import fs from "fs/promises";
import path from "path";
import { load } from "js-yaml";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { execSync } from "child_process";
import getPalette from "tailwindcss-palette-generator";
import pkg from "lodash";

const { get } = pkg;

// Read JSON file
const readJsonFile = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

const config = await readJsonFile("./chai.config.json");

// Path to your JSON file and directories
const jsonFilePath = "./public/blocks.json";
const outputDir = "./public/preview";
const blocksDir = "./public/blocks";

// Function to get modified files from git
function getModifiedAndNewFiles() {
  try {
    // Get modified files
    const modifiedFiles = execSync("git diff --name-only HEAD")
      .toString()
      .trim();

    // Get untracked (new) files
    const newFiles = execSync("git ls-files --others --exclude-standard")
      .toString()
      .trim();

    // Combine and filter the results
    const allFiles = `${modifiedFiles}\n${newFiles}`;
    return allFiles
      .split("\n")
      .filter(
        (file) => file.startsWith("public/blocks/") && file.endsWith(".html"),
      )
      .filter(Boolean); // Remove any empty strings
  } catch (error) {
    console.error("Error getting modified and new files from git:", error);
    return [];
  }
}

// Function to extract JSON object from <chaistudio> tag
const extractJSONObject = (htmlContent) => {
  const blockMeta = htmlContent.match(/---([\s\S]*?)---/);
  if (blockMeta) {
    try {
      return load(blockMeta[1]);
    } catch (er) {}
  }
  return {};
};
// Read HTML file
const readHtmlFile = async (filePath) => {
  const htmlContent = await fs.readFile(filePath, "utf-8");
  const metaData = extractJSONObject(htmlContent);
  const html = htmlContent.replace(/---([\s\S]*?)---/g, "");
  const wrapperClasses = get(metaData, "previewWrapperClasses", "");
  return { html, wrapperClasses, ...getViewport(metaData) };
};

const getFonts = (options) => {
  const headingFont = options.headingFont;
  const bodyFont = options.bodyFont;
  if (headingFont === bodyFont)
    return `<link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">`;

  return `
    <link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=${bodyFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;
};

const getTailwindConfig = () => {
  const palette = getPalette.default([
    { color: config.primaryColor, name: "primary" },
    { color: config.secondaryColor, name: "secondary" },
  ]);

  const colors = {
    "bg-light": config.bodyBgLightColor,
    "bg-dark": config.bodyBgDarkColor,
    "text-dark": config.bodyTextDarkColor,
    "text-light": config.bodyTextLightColor,
  };

  return JSON.stringify({
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1300px",
        },
      },
      fontFamily: { heading: [config.headingFont], body: [config.bodyFont] },
      borderRadius: { DEFAULT: `${config.roundedCorners}px` },
      colors: { ...palette, ...colors },
    },
  });
};

const wrapInsideHtml = (html) => {
  return `!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${getFonts(config)}
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"></script>
      <script>
        tailwind.config = {
          darkMode: "class",
          theme: ${getTailwindConfig()},
          plugins: [
            tailwind.plugin.withOptions(() =>
              function ({ addBase, theme }) {
                addBase({
                  "h1,h2,h3,h4,h5,h6": {
                    fontFamily: theme("fontFamily.heading"),
                  },
                  body: {
                      fontFamily: theme("fontFamily.body"),
                      color: theme("colors.text-light"),
                      backgroundColor: theme("colors.bg-light"),
                  },
                  ".dark body": {
                      color: theme("colors.text-dark"),
                      backgroundColor: theme("colors.bg-dark"),
                  },
                });
              }
            )
          ],
        }
      </script>
    </head>
    <body>
      ${html}
      <script src="https://unpkg.com/alpinejs" defer ></script>
    </body>
  </html>`;
};

const getViewport = (data) => {
  const viewport = get(data, "viewport", {});
  return {
    width: get(viewport, "width", 1280),
    height: get(viewport, "height", 800),
  };
};

// Main function
const generatePreviews = async () => {
  const data = await readJsonFile(jsonFilePath);
  const modifiedFiles = getModifiedAndNewFiles();

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Loop through each block in the JSON data
  for (let block of data) {
    const { group, uuid, preview } = block;

    if (preview.startsWith("http")) {
      continue;
    }

    // // Check if the file has been modified
    const blockFile = path.join(
      blocksDir,
      group,
      `${uuid.replace(group + "-", "")}.html`,
    );
    if (!modifiedFiles.includes(blockFile)) {
      continue;
    }

    console.log("Generating preview for:" + uuid + ".html");

    // Read the HTML file
    const { html, wrapperClasses, width, height } =
      await readHtmlFile(blockFile);
    const htmlContent = wrapInsideHtml(
      `<div id="root" class="${wrapperClasses}">${html}</div>`,
    );

    // Set the viewport size to 1280px width
    await page.setViewport({ width, height });
    // Set the content of the page
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Wait for any dynamic content to load
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    // Get the root element
    const rootElement = await page.$("#root");

    if (rootElement) {
      // Get the bounding box of the root element
      const boundingBox = await rootElement.boundingBox();

      // Take a screenshot of the root element
      const screenshotBuffer = await rootElement.screenshot();

      // Ensure the output directory exists
      const groupOutputDir = path.join(outputDir, group);
      await fs.mkdir(groupOutputDir, { recursive: true });

      // Define the output file path
      const outputFilePath = path.join(groupOutputDir, `${uuid}.jpg`);

      // Optimize and save the image
      let optimizedBuffer = await sharp(screenshotBuffer)
        .resize({ width, height, fit: "inside" })
        .jpeg({ quality: 100 })
        .toBuffer();

      // Compress further if necessary to ensure the image is under 50KB
      let quality = 80;
      while (optimizedBuffer.length > 50000 && quality > 10) {
        quality -= 10;
        optimizedBuffer = await sharp(optimizedBuffer)
          .jpeg({ quality })
          .toBuffer();
      }

      // Save the optimized image
      await fs.writeFile(outputFilePath, optimizedBuffer);
      console.log(`Screenshot saved for ${uuid} at ${outputFilePath}`);
    } else {
      console.log(`No root element found for ${uuid}`);
    }
  }

  // Close the browser
  await browser.close();
};

// Run the main function
generatePreviews().catch(console.error);
