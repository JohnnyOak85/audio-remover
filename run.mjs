import { spawn } from "child_process";
import { basename, extname, join } from "path";
import { existsSync, readdirSync, renameSync } from "fs";

const directoryPath = process.argv[2];
const suffix = "_noaudio";
const extension = ".mkv";

/**
 * Remove extraneous audio tracks from MKV files
 * @param {string} inputFile
 * @param {string} outputFile
 * @returns {Promise<string>}
 */
function removeAudio(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    // Check if MKVToolNix is installed (adjust path based on your installation)
    // TODO: Try to include MKV tools in the project itself
    const MKVPath = join("C:", "Program Files", "MKVToolNix", "mkvmerge.exe");

    if (!existsSync(MKVPath)) {
      reject(new Error("MKVToolNix not found! Please install it."));
      return;
    }

    // Build arguments
    // TODO: Add information about arguments
    const args = ["-o", outputFile, "-a", "ja", inputFile];

    // Spawn MKVToolNix process
    const process = spawn(MKVPath, args);

    process.stdout.on("data", (data) => {
      console.log(`mkvmerge output: ${data.toString()}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`mkvmerge error: ${data.toString()}`);
      reject(new Error("Error during processing"));
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(`Successfully removed audio and created: ${outputFile}`);
      } else {
        reject(new Error("MKVToolNix process exited with error code: " + code));
      }
    });
  });
}

/**
 * Process all MKV files in a directory
 * @param {string} directory
 */
async function processDirectory(directory) {
  if (!directory) {
    throw new Error("Please provide a directory to process");
  }

  try {
    const files = readdirSync(directory);

    for (const file of files) {
      // OPTIMIZE: If file extension is not `.mkv`, carry on to the next file
      const filePath = join(directory, file);

      if (extname(filePath) === extension) {
        const outputFile = `${basename(file, extension)}${suffix}${extension}`;
        const outputPath = join(directory, outputFile);

        await removeAudio(filePath, outputPath);
        renameSync(outputPath, filePath);
      }
    }
  } catch (error) {
    console.error("Error processing directory:", error);
  }
}

processDirectory(directoryPath)
  .then(() => console.log("Finished processing all files in the directory."))
  .catch((error) => console.error(error));
