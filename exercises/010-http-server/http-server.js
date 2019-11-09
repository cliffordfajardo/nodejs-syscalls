/*
Most webservers follow this event loop type format EXCEPT thread based web servers like Apache. 
They create a new thread for each connection...we don't use threads...we split our code into small callbacks
*/
const syscalls = require('syscalls');
const event_loop = require('../../examples/event-loop/event-loop-v3.js');
const httpParser = require('../../exercise-solutions/http_parser')
const STD_OUT = 1;




function HttpServer(callback){
  this.callback = callback;
}

/**
 * Create a socket, bind it to a port AND make it non blocking.
 * @param {Number} port
 */
HttpServer.prototype.listen = function(port){
  this.fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
  syscalls.fcntl(this.fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  syscalls.bind(this.fd, port, "0.0.0.0");
  syscalls.listen(this.fd, 100);
}


/** 
 * 
*/
HttpServer.prototype.start = function(){
  const self = this;
  
  event_loop.on(this.fd, 'read', function(){    // when the `fd` becomes readable, create a new connection. After the callback fires, we're of course ready to pick up another connection. This is how we achieve concurrency without threads (using the event loop).
    const CONN_FD = syscalls.accept(self.fd);
    new Connection(CONN_FD, self.callback);
  }); 
}



/**
 * Any time there is a new connection, create an instance of that new connection.
 * Handle all the logic for handling 1 single connection here.
 * @param {Number} fd 
 * @param {Function} callback 
 */
function Connection(fd, callback) {
  this.fd = fd;
  this.callback = callback;
  const BYTES_TO_READ = 1024;
  var self = this;

  const http_parser = httpParser.createParser(); //recieves data increments...

  event_loop.on(fd, 'read', () => {
    const data = syscalls.read(fd, BYTES_TO_READ);
    if(data.length === 0) { // Ex: echo 'GET /' | nc localhost 3000
      // connection close by client
      event_loop.remove(self.fd, 'read')
      syscalls.close(self.fd)
      // Immediately free up memeory, despite it being disconnected remotely
    }
    http_parser.parse(data);
  });

  


  
  http_parser.on('request', (request) => {
    //no point in watching incoming data on the socket, if we know we're doine parsing the request. This is the inverse of what's happening a few lines above where we register.
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

const server = new HttpServer((request, response) => {
  response.send("A web server!\n")
})



server.listen(3000);
server.start();
event_loop.run();