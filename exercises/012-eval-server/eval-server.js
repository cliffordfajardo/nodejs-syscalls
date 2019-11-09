// Usage
// echo "1+2" | nc localhost 3000 .....child process runs this
// echo "console.lof(1)" | nc localhost 3000 .....cchild process crashed....but main server running

// ❗❗❗ This is an example of play code, don't fork in the middle of your application for the most part, you should do it at the beginning like in the HTTP server
const syscalls = require('syscalls')
const loop = require('../../examples/event-loop/event-loop-v3.js')

const fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(fd, 3000, "0.0.0.0")
syscalls.listen(fd, 100)




loop.on(fd, 'read', function() {
  console.log("New connection")
  const connFd = syscalls.accept(fd)

  loop.on(connFd, 'read', function() {
    const code = syscalls.read(connFd, 10240); // you could choose to buffer it, but you're going to need to implement a protocol (am I done recieving..make server more complex )..or create a parser
    loop.remove(connFd, 'read'); // we have the data, remove the event....

    // client close connection, clean up memory
    if (code.length == 0) {
      syscalls.close(connFd)
      return;
    }

    // one thing thats common is to run unsafe code in a child process so we don't take out master.
    if (syscalls.fork() == 0) { // In the child process
      console.log("Running in PID: " + syscalls.getpid())
      const result = eval(code); //eval a string as a piece as JS code & send back the code (JSON.stringify..we can't send objects back to sockets obvioisly..)
      syscalls.write(connFd, JSON.stringify(result) + "\n")
      console.log("Done PID: " + syscalls.getpid())
      process.exit()

    } else {
      // In the master process
      syscalls.close(connFd);
    }
  })
})

loop.run()