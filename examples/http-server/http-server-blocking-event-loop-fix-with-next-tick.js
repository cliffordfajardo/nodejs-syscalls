const syscalls = require('syscalls');
const event_loop = require('../event-loop/event-loop-v3.js');
const httpParser = require('../../exercise-solutions/http_parser')
const STD_OUT = 1;

function HttpServer(callback){
  this.callback = callback;
}

HttpServer.prototype.listen = function(port){
  this.fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
  syscalls.fcntl(this.fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  syscalls.bind(this.fd, port, "0.0.0.0");
  syscalls.listen(this.fd, 100);
}

HttpServer.prototype.start = function(){
  const self = this;
  
  event_loop.on(this.fd, 'read', function(){
    const CONN_FD = syscalls.accept(self.fd);
    new Connection(CONN_FD, self.callback);
  }); 
}

function Connection(fd, callback) {
  this.fd = fd;
  this.callback = callback;
  const BYTES_TO_READ = 1024;
  var self = this;

  const http_parser = httpParser.createParser();

  event_loop.on(fd, 'read', () => {
    const data = syscalls.read(fd, BYTES_TO_READ);
    if(data.length === 0) {
      event_loop.remove(self.fd, 'read')
      syscalls.close(self.fd);
    }
    http_parser.parse(data);
  });

  


  
  http_parser.on('request', (request) => {
    event_loop.remove(fd, 'read');
    syscalls.write(STD_OUT, `${request.method} ${request.url}`);
    self.callback(request, self)
  })
}

/**Send valid HTTP response */
Connection.prototype.send = function(body){
  let data = [
    `HTTP/1.1 200 OK\r\n`,                  // status line
    `Content-Type: text/plain\r\n`,         // Tell browser or client how to render content
    `Content-Length: ${body.length} \r\n`,  // inform the client how many bytes to read on the socket
    `\r\n ${body}`
  ].join('')

  
  const self = this;
  event_loop.on(this.fd, 'write', function() { // when the socket is writeable
    syscalls.write(self.fd, data);
    syscalls.close(self.fd);        // nothing left to be done...
    event_loop.remove(self.fd, 'write');  
  })

}

// TODO: run server, open 2 other tabs.....1 hits slow and the other client hits `/`
// OPTION1: This solution is spreading out work....still working with only 1 process

const server = new HttpServer((request, response) => {
  if(request.url == '/slow') {
    let objects = [];
    //BEFORE
    // for(var i = 0; i < 12000000; i++) {
    //   objects.push(new Object()); // pretend this is an expensive  (hit /slow with 1 client)..if we have another client hitting ('/'), it's stuck waiting.
    // }
     
    // spread execution
    var i = 0;
    function compute() {
      // execute 1000 push opps at a time...as a developer you have the power to make trade offs...do I want to block the event loop more time and get more work done or not?
      for(var j = 0; j < 1000; j++) {
        objects.push(new Object())
      }
      if(i < 10000) {
        i++;
        event_loop.nextTick(compute)
      } else {
        response.send("Slow request done!\n")
      }
    }
    compute();
  } else {
    response.send("Fast request done!\n")
  }
  
})



server.listen(3000);
server.start();
event_loop.run();