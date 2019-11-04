const syscalls = require('syscalls')
const dns = require('dns')

const host = process.argv[2]
const port = parseInt(process.argv[3])

dns.lookup(host, function(err, address, family) {
  if (err) throw err
  connect(address)
})

function connect(address) {
  const serverFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
  syscalls.fcntl(serverFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)

  syscalls.connect(serverFd, port, address)

  // - terminal is ready to be read, stdin = 0
  // - server sends some data, serverFd is readable

  while (true) {
    const fds = syscalls.select([0, serverFd], [], [])
    const readableFds = fds[0]

    // stdin readable
    if (readableFds.indexOf(0) != -1) {
      let data = syscalls.read(0, 1024)
      syscalls.write(serverFd, data)
    }

    // server sent something
    if (readableFds.indexOf(serverFd) != -1) {
      let data = syscalls.read(serverFd, 1024)
      if (data.length == 0) return; // Server closed the connection
      console.log(data)
    }
  }    
}