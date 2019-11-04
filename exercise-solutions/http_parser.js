// Extend Node internal parser to take care of data buffering and have a nicer API.
// See parser_demo.js for sample usage.

const HTTPParser = process.binding('http_parser').HTTPParser;
const events = require('events')

// Make HTTPParser inherit from EventEmitter without changing it's prototype.
HTTPParser.prototype.__proto__ = events.EventEmitter.prototype

// Constants used by the parser for callbacks. Taken from Node internals.
const kOnHeaders = HTTPParser.kOnHeaders | 0
const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
const kOnBody = HTTPParser.kOnBody | 0
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

// Creates and return an new parser.
exports.createParser = function() {
  const parser = new HTTPParser(HTTPParser.REQUEST);
  let info;

  events.EventEmitter.call(parser)

  // Store headers
  function onHeadersComplete(versionMajor, versionMinor, headers, method, url) {
    if (typeof versionMajor === 'object') {
      // Older node version passed info as one hash argument
      info = versionMajor
    } else {
      info = {
        versionMajor: versionMajor,
        versionMinor: versionMinor,
        headers: headers,
        method: method,
        url: url
      }
    }

    // Some old Node version pass method as an int
    if (typeof info.method !== 'string') {
      info.method = HTTPParser.methods[info.method]
    }
  }

  // A few versions of Node used properties for callbacks then went back to using array indices for better perf.
  // We try to support both.
  if (HTTPParser.kOnHeadersComplete != null) {
    parser[kOnHeadersComplete] = onHeadersComplete
  } else {
    parser.onHeadersComplete = onHeadersComplete
  } 

  function onMessageComplete() {
    parser.emit('request', info)
  }

  if (HTTPParser.kOnMessageComplete != null) {
    parser[kOnMessageComplete] = onMessageComplete
  } else {
    parser.onMessageComplete = onMessageComplete
  }

  return parser
}

// Feed a string to the parser.
// `onComplete` will be called if this results in a complete HTTP request.
HTTPParser.prototype.parse = function(data) {
  // Buffer data
  const buffer = this.buffer = this.buffer || ""
  const start = buffer.length
  buffer += data
  
  this.execute(new Buffer(buffer), start, data.length)
}
