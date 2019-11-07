/* Extend Node internal parser to take care of data buffering and have a nicer API.
See parser_demo.js for sample usage.

Process.binding is only supposed to be used by core node libraries. From my brief reading of the source, the http parser C++ code only exposes a small subset of events (onHeaders, onHeadersComplete, onBody, onMessageComplete) so I believe these are the only events you can latch.
*/

var HTTPParser = process.binding('http_parser').HTTPParser; //https://stackoverflow.com/questions/13651071/node-js-httpparser-doesnt-call-some-of-the-callbacks/42003256
var events = require('events')

// Make HTTPParser inherit from EventEmitter without changing it's prototype.
HTTPParser.prototype.__proto__ = events.EventEmitter.prototype

// Constants used by the parser for callbacks. Taken from Node internals....// bitwise or: https://stackoverflow.com/questions/6194950/what-does-the-single-pipe-do-in-javascript
const kOnHeaders = HTTPParser.kOnHeaders | 0
const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
const kOnBody = HTTPParser.kOnBody | 0
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

// Creates and return an new parser.
exports.createParser = function() {
  var parser = new HTTPParser(HTTPParser.REQUEST);
  var info;

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
    if (typeof info.method === 'number') {
      info.method = HTTPParser.methods[info.method]
    }
  }

  // A few versions of Node used properties for callbacks then went back to using array indices for better perf. We try to support both.
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
  var buffer = this.buffer = this.buffer || ""
  var start = buffer.length
  buffer += data
  
  this.execute(new Buffer(buffer), start, data.length)
}


HTTPParser.methods = {
  0:  'DELETE',
  1:  'GET',
  2:  'HEAD',
  3:  'POST',
  4:  'PUT',
  5:  'CONNECT',
  6:  'OPTIONS',
  7:  'TRACE',
  8:  'COPY',
  9:  'LOCK',
  10: 'MKCOL',
  11: 'MOVE',
  12: 'PROPFIND',
  13: 'PROPPATCH',
  14: 'SEARCH',
  15: 'UNLOCK',
  16: 'BIND',
  17: 'REBIND',
  18: 'UNBIND',
  19: 'ACL',
  20: 'REPORT',
  21: 'MKACTIVITY',
  22: 'CHECKOUT',
  23: 'MERGE',
  24: 'M-SEARCH',
  25: 'NOTIFY',
  26: 'SUBSCRIBE',
  27: 'UNSUBSCRIBE',
  28: 'PATCH',
  29: 'PURGE',
  30: 'MKCALENDAR',
  31: 'LINK',
  32: 'UNLINK'
};