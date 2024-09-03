import fs from "fs";
import path from "path";
import { load } from "js-yaml";
import pkg from "lodash";

const { omit } = pkg;

// Function to read all HTML files in a folder and its subfolders
const readHTMLFiles = (folderPath) => {
  let results = [];
  const items = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      const subfolderPath = path.join(folderPath, item.name);
      const subfolderFiles = fs.readdirSync(subfolderPath)
        .filter(file => path.extname(file).toLowerCase() === ".html")
        .map(file => ({
          path: file,
          group: item.name,
          name: path.parse(file).name
        }));
      results = results.concat(subfolderFiles);
    }
  }

  return results;
};

// Function to extract JSON object from <chaistudio> tag
const extractJSONObject = (block) => {
  const htmlContent = fs.readFileSync("./src/blocks/"+ block.group + "/" + block.path, "utf-8");
  const blockMeta = htmlContent.match(/---([\s\S]*?)---/);
  if (blockMeta) {
    try {
      return load(blockMeta[1]);
    } catch (er) {}
  }
  return {};
};

// Function to humanize a string
const humanize = (str) => {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/^./, function(m) { return m.toUpperCase(); });
};

// Main function to create the JSON file
const createJSONFile = (folderPath, outputFileName) => {
  const htmlFiles = readHTMLFiles(folderPath);
  const jsonArray = htmlFiles
    .map((file) => {
      const jsonObject = extractJSONObject(file);
      if (jsonObject && !jsonObject.draft) {
        const uuid = `${file.group}-${file.name}`;
        return {
          group: file.group,
          uuid: uuid,
          name: humanize(file.name),
          preview: `/preview/${file.group}-${file.name}.jpg`,
          ...omit(jsonObject, ["group", "uuid"]),
        };
      }
      return null;
    })
    .filter((obj) => obj !== null);

  fs.writeFileSync(outputFileName, JSON.stringify(jsonArray, null, 2), "utf-8");
  console.log(`Blocks JSON file created successfully: ${outputFileName}`);
};

// Specify the folder path and output file name
const folderPath = "./src/blocks";
const outputFileName = "./public/blocks.json";

// Create the JSON file
createJSONFile(folderPath, outputFileName);