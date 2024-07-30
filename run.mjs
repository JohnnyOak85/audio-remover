import { spawn } from "child_process";
import { basename, extname, join } from "path";
import { existsSync, readdirSync, renameSync } from "fs";

const directoryPath = process.argv[2];
const suffix = "_noaudio";
const extension = ".mkv";

/**
 * Constructs a command to run MKVMerge with specified input and output files.
 *
 * This function builds a command to run MKVMerge (`mkvmerge.exe`) with the
 * given input file and output file. It specifically selects Japanese audio tracks.
 *
 * @param {string} inputFile - The path to the input MKV file.
 * @param {string} outputFile - The path to the output MKV file.
 * @returns {{ path: string, args: string[] }} An object containing the path to
 *          the MKVMerge executable and an array of arguments to be passed to it.
 * @throws {Error} Throws an error if `mkvmerge.exe` is not found in the current directory.
 */
function buildCommand(inputFile, outputFile) {
  const path = join(".", "mkvmerge.exe");

  if (!existsSync(path)) {
    throw new Error("MKVMerge not found! Please install it.");
  }

  const args = ["--output", outputFile, "--audio-tracks", "ja", inputFile];

  return { path, args };
}

/**
 * Removes extraneous audio tracks from MKV files.
 *
 * This function utilizes MKVMerge to remove non-Japanese audio tracks from
 * an MKV file. It runs the MKVMerge command built by `buildCommand`, capturing
 * and logging the output and errors, and resolves or rejects the promise
 * based on the process exit code.
 *
 * @param {string} inputFile - The path to the input MKV file from which audio tracks will be removed.
 * @param {string} outputFile - The path to the output MKV file with the extraneous audio tracks removed.
 * @returns {Promise<string>} A promise that resolves with a success message indicating the input file processed,
 *                            or rejects with an error if the MKVMerge process fails.
 * @throws {Error} If MKVMerge executable is not found, or if the MKVMerge process exits with a non-zero code.
 */
function removeAudio(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const { path, args } = buildCommand(inputFile, outputFile);

    const process = spawn(path, args);

    process.stdout.on("data", (data) => {
      console.log(`MKVMerge output: ${data.toString()}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`MKVMerge error: ${data.toString()}`);
      reject(new Error("Error during processing"));
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(`Successfully removed audio for ${inputFile}`);
      } else {
        reject(new Error(`MKVToolNix process exited with error code: ${code}`));
      }
    });
  });
}

/**
 * Processes all MKV files in a specified directory.
 *
 * This function scans a given directory for MKV files and processes each file
 * by removing extraneous audio tracks using the `removeAudio` function. After
 * processing, the output file replaces the original file.
 *
 * @param {string} directory - The path to the directory containing MKV files to be processed.
 * @throws {Error} Throws an error if no directory is provided or if there's an issue reading or processing the directory.
 */
async function processDirectory(directory) {
  if (!directory) {
    throw new Error("Please provide a directory to process");
  }

  directory = directory.replace('"', "");

  try {
    const files = readdirSync(directory);

    for (const file of files) {
      const filePath = join(directory, file);

      if (extname(filePath) !== extension) {
        continue;
      }

      const outputFile = `${basename(file, extension)}${suffix}${extension}`;
      const outputPath = join(directory, outputFile);

      const result = await removeAudio(filePath, outputPath);
      console.log(result);
      renameSync(outputPath, filePath);
    }
  } catch (error) {
    throw new Error(`Error processing directory: ${error}`);
  }
}

processDirectory(directoryPath)
  .then(() => console.log("Finished processing all files in the directory."))
  .catch((error) => console.error(error));
