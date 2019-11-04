const syscalls = require('syscalls')
const loop = require('./loop')

const acceptFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
syscalls.fcntl(acceptFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(acceptFd, 3000, "0.0.0.0")
syscalls.listen(acceptFd, 100)

const users = [] // FDs

function accept() {
  const userFd = syscalls.accept(acceptFd)
  users.push(userFd)
  console.log("User connected on FD: " + userFd)
  syscalls.write(userFd, "Welcome!\n")
  return userFd
}

function readAndBroadcastMessage(senderFd) {
  const msg = syscalls.read(senderFd, 1024)

  // Read w/ a 0 byte string == connection closed
  if (msg.length == 0) {
    disconnect(senderFd)
    return;
  }

  // Send the message to all connected users
  users.forEach(function(receiverFd) {
    if (receiverFd != senderFd) syscalls.write(receiverFd, "user " + senderFd + "> " + msg)
  })
}

function disconnect(fd) {
  console.log("User disconnect on FD: " + fd)
  syscalls.close(fd)
  users.splice(users.indexOf(fd), 1)
  loop.remove(fd, 'read')
}

loop.on(acceptFd, 'read', function() {
  const userFd = accept()

  loop.on(userFd, 'read', function() {
    readAndBroadcastMessage(userFd)
  })
})

loop.run()