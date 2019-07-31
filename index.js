/* global process */
const fs = require("fs");
const MirrorStream = require("./convert");

const inputFile = process.argv[2];
const outputFile = process.argv[3];
if (!inputFile) {
  global.console.error("CLI usage: node index.js input.bmp output.bmp");
  process.exit(1);
}

const inputStream = fs.createReadStream(inputFile, {
  highWaterMark: 8 * 1024
});
const stream = new MirrorStream();
inputStream
  .pipe(stream)
  .pipe(fs.createWriteStream(outputFile, { highWaterMark: 8 * 1024 }));
