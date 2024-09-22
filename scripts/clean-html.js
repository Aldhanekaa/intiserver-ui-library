import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as cheerio from "cheerio";
import prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function processHtmlFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await processHtmlFiles(filePath);
      } else if (path.extname(file).toLowerCase() === ".html") {
        await updateHtmlFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

async function updateHtmlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const $ = cheerio.load(content);

    const bodyContent = $("body").html();
    let newContent;

    if (bodyContent) {
      newContent = bodyContent.trim();
      console.log(`Updated content from body for file: ${filePath}`);
    } else {
      newContent = $.root().html().trim();
      console.log(
        `No body tag found, using entire content for file: ${filePath}`,
      );
    }

    // Format the content with Prettier
    const formattedContent = await prettier.format(newContent, {
      parser: "html",
      printWidth: 120,
      tabWidth: 2,
      useTabs: false,
      singleQuote: true,
      bracketSameLine: true,
    });

    // Write the formatted content back to the file
    await fs.writeFile(filePath, formattedContent);
    console.log(`Formatted and saved file: ${filePath}`);
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
  }
}

// Get the target directory from command-line arguments
const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error("Please provide a target directory path as an argument.");
  process.exit(1);
}

const absolutePath = path.resolve(targetDirectory);

console.log(`Processing HTML files in: ${absolutePath}`);
processHtmlFiles(absolutePath);
