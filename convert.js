const { Transform } = require("stream");
const { InvalidImageError } = require("./errors");

class MirrorStream extends Transform {
  constructor() {
    super();
    this.imageHeader = {};
    this.pos = 0;
    this.padding = 0;

    this.cache = Buffer.alloc(0);
    this.currentBuff = null;
    this.state = "read header";

    this.lineWidth = null;

    this.writhedLinesNumber = 0;
  }

  getHeader() {
    this.imageHeader.flag = this.cache.toString("utf-8", 0, (this.pos += 2));
    this.imageHeader.fileSize = this.cache.readUInt32LE(this.pos);
    this.imageHeader.reserved = this.cache.readUInt32LE((this.pos += 4));
    this.imageHeader.offset = this.cache.readUInt32LE((this.pos += 4));
    this.imageHeader.headerSize = this.cache.readUInt32LE((this.pos += 4));
    this.imageHeader.width = this.cache.readUInt32LE((this.pos += 4));
    this.imageHeader.height = this.cache.readInt32LE((this.pos += 4));
    this.imageHeader.planes = this.cache.readUInt16LE((this.pos += 4));
    this.imageHeader.bitPP = this.cache.readUInt16LE((this.pos += 2));

    this.padding =
      ((this.imageHeader.bitPP / 8) * this.imageHeader.height) % 4
        ? 4 - (((this.imageHeader.bitPP / 8) * this.imageHeader.height) % 4)
        : 0;
    this.lineWidth = 3 * this.imageHeader.width + this.padding;
  }

  writeHeader() {
    this.push(this.cache.slice(0, this.imageHeader.offset));
    this.cache = this.cache.slice(this.imageHeader.offset);
  }

  writeReversedLine() {
    const reversedLine = Buffer.alloc(this.lineWidth);

    for (let i = 0; i < this.imageHeader.width; i += 1) {
      this.cache.copy(
        reversedLine,
        3 * i,
        3 * (this.imageHeader.width - i - 1),
        3 * (this.imageHeader.width - i)
      );
    }

    this.writhedLinesNumber += 1;
    this.push(reversedLine);
    this.cache = this.cache.slice(this.lineWidth);
  }

  _transform(chunk, encoding, cb) {
    this.currentBuff = chunk;
    while (this.currentBuff.length) {
      if (this.state === "read header") {
        this.cache = Buffer.concat([this.cache, this.currentBuff.slice(0, 30)]);
        if (this.cache.length >= 30) {
          this.getHeader();
          this.state = "write header";
        }
        this.currentBuff = this.currentBuff.slice(30);
      }
      if (this.state === "write header") {
        if (this.imageHeader.flag !== "BM" || this.imageHeader.bitPP !== 24) {
          throw new InvalidImageError();
        }
        this.cache = Buffer.concat([
          this.cache,
          this.currentBuff.slice(0, this.imageHeader.offset - 30)
        ]);
        this.currentBuff = this.currentBuff.slice(this.imageHeader.offset - 30);

        if (this.cache.length >= this.imageHeader.offset) {
          this.writeHeader();
          this.state = "write image";
        }
      }
      if (this.state === "write image") {
        this.cache = Buffer.concat([
          this.cache,
          this.currentBuff.slice(0, this.lineWidth)
        ]);
        if (this.cache.length >= this.lineWidth) {
          this.writeReversedLine();
        }
        if (this.writhedLinesNumber === this.imageHeader.height) {
          this.state = "write rest";
        }
        this.currentBuff = this.currentBuff.slice(this.lineWidth);
      }
    }
    cb();
  }

  // _flush(cb) {
  //   console.log(this.imageHeader);
  //   console.log(this.writhedLinesNumber);
  //   console.log(this.state);
  //   throw new InvalidImageError();
  // }
}

module.exports = MirrorStream;
