const syscalls = require('syscalls')
const loop = require('./loop')
const httpParser = require('./http_parser')

function HttpServer(callback) {
  this.callback = callback
}

HttpServer.prototype.listen = function(port) {
  this.fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
  syscalls.fcntl(this.fd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
  syscalls.bind(this.fd, port, "0.0.0.0")
  syscalls.listen(this.fd, 100)
}

HttpServer.prototype.start = function() {
  const self = this

  loop.on(this.fd, 'read', function() {
    try {
      var connFd = syscalls.accept(self.fd)
    } catch(e) {
      // Another worker accepted the connection      
    }
    if (connFd) {
      new Connection(connFd, self.callback)
    }
  })
}

HttpServer.prototype.fork = function(workers) {
  if (syscalls.fork() == 0) {
    console.log("In a child process: " + syscalls.getpid())
    this.start()
  } else {
    console.log("In the master process: " + syscalls.getpid())
    workers--
    if (workers > 0) {
      this.fork(workers)
    } else {
      syscalls.waitpid(-1) // Wait for all the children process to exit
    }
  }
}


function Connection(fd, callback) {
  this.fd = fd
  this.callback = callback

  const parser = httpParser.createParser()
  const self = this

  loop.on(this.fd, 'read', function() {
    let data = syscalls.read(fd, 1024)
    if (data.length == 0) {
      // Connection was closed by the client
      loop.remove(self.fd, 'read')
      syscalls.close(self.fd)
      return
    }
    parser.parse(data)
  })

  parser.on('request', function(request) {
    loop.remove(fd, 'read')
    console.log(request.method + ' ' + request.url)
    self.callback(request, self)
  })
}

Connection.prototype.send = function(body) {
  let data = "HTTP/1.1 200 OK\r\n" +
             "Content-Type: text/plain\r\n" +
             "Content-Length: " + body.length + "\r\n" +
             "\r\n" +
             body

  const self = this
  loop.on(this.fd, 'write', function() {
    syscalls.write(self.fd, data)
    syscalls.close(self.fd)
    loop.remove(self.fd, 'write')
  })
}



const server = new HttpServer(function(req, res) {
  if (req.url == "/slow") {
    let objects = []
        
    // for (let i = 0; i < 10000000; i++) {
    //   objects.push(new Object()) // pretend we're computing something here
    // }

    let i = 0
    function compute() {
      for (let j = 0; j < 100000; j++) {
        objects.push(new Object())
      }
      
      if (i < 10000000) {
        i++;
        loop.nextTick(compute);
      } else {
        // done
        res.send("slow request done\n")
      }
    }
    compute()

  } else {
    res.send("from pid: " + syscalls.getpid() + "\n")
  }
})

server.listen(3000)
// server.start()
server.fork(3)

loop.run()