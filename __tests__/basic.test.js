const path = require("path");
const fs = require("fs");
const { PassThrough } = require("stream");
const streamEqual = require("stream-equal");
const { promisify } = require("util");

const MirrorStream = require("../convert");

it("корректно преобразовывает тестовое изображение", async () => {
  const input = path.resolve(__dirname, "assets", "input.bmp");
  const output = path.resolve(__dirname, "assets", "output.bmp");
  const through = new PassThrough();

  fs.createReadStream(input)
    .pipe(new MirrorStream())
    .pipe(through);
  expect(
    await promisify(streamEqual)(through, fs.createReadStream(output))
  ).toBeTruthy();
});
