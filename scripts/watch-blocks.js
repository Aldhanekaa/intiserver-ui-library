import chokidar from "chokidar";
import { exec, spawn } from "child_process";

const watchDir = "./public/blocks";

console.log(`Watching for file changes in ${watchDir}`);

const watcher = chokidar.watch(watchDir, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true, // Ignore the initial scan of the watched directories
});

function runBuildBlocks(event, path) {
  console.log(`File ${path} has been ${event}`);
  console.log("Running npm run build:blocks...");
  exec("npm run build:blocks", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log("build:blocks completed successfully.");
  });
}

watcher
  .on("add", (path) => runBuildBlocks("added", path))
  .on("unlink", (path) => runBuildBlocks("deleted", path))
  .on("addDir", (path) => runBuildBlocks("added", path))
  .on("unlinkDir", (path) => runBuildBlocks("deleted", path));

// Watch for file/directory renames
let oldPath = null;
watcher.on("raw", (event, path, details) => {
  if (event === "renamed") {
    if (oldPath) {
      console.log(`File renamed from ${oldPath} to ${path}`);
      runBuildBlocks("renamed", `${oldPath} to ${path}`);
      oldPath = null;
    } else {
      oldPath = path;
    }
  }
});

// Run the original dev script
const devProcess = spawn("npm", ["run", "dev:vite"], { stdio: "inherit" });

devProcess.on("close", (code) => {
  console.log(`dev process exited with code ${code}`);
  process.exit(code);
});

console.log("Watcher and dev server started. Press Ctrl+C to exit.");
