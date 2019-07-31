const { Transform } = require("stream");
const { InvalidImageError } = require("./errors");

class MirrorStream extends Transform {
  constructor() {
    super();
  }

  _transform(chunk, encoding, cb) {
    cb();
  }
}

module.exports = MirrorStream;
