const syscalls = require('syscalls')
const dns = require('dns')
const host = process.argv[2]
const port = parseInt(process.argv[3])
const STD_IN = 0;
const STD_OUT = 1;

dns.lookup(host, function(err, address, family) {
  if (err) throw err
  connect(address)
})




function connect(address) {
  const serverFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0); // create a socket
  syscalls.fcntl(serverFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)              // make the socket async (non-blockign..now we can use `select`)
  syscalls.connect(serverFd, port, address)

  while (true) {
    // 1. Watch stdin for read (ready when user typed and hit enter)
    // 2. Watch connection for responses (readability)
    const fds = syscalls.select([STD_IN, serverFd], [], []);

    const readableFds = fds[0]            // readables are at 0

    //Handle STDIN read
    if (readableFds.includes(STD_IN)) {
      let data = syscalls.read(0, 1024); // can use a loop to chunk it but we're just going to make it 1k.
      syscalls.write(serverFd, data)    // send back to server.........we can always assume a socket is writeable (you can use select if you want.)
    }

    //Handle server response (read)
    if (readableFds.includes(serverFd)) {
      let data = syscalls.read(serverFd, 1024)
      if (data.length == 0) return; // Server closed the connection .. empty string also means a connection was closed by server.
      syscalls.write(STD_OUT, data)
    }
  }    
}


// TLDR:
// - select's return values are at the core of the event loop
// - we we use async sockets for a single user controlled program like netcat
//    - we're watching for 2 things to happen:
//        1. handling server response & immediately putting it in console
//        2. handling std in, hitting enter, sends to server, and we handle response immediately.
//
// NC is a good example of using select outside the context of event loops