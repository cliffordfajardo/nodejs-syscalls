const syscalls = require('syscalls')
const config = {
  port: 3000,
  host: "0.0.0.0",
  backlog_limit: 100
};
const STD_OUT = 1;


/********************************************************
* Setup simple chat server
********************************************************/
const acceptFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(acceptFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(acceptFd, 3000, "0.0.0.0")
syscalls.listen(acceptFd, 100)

const users = []; // FDs 


/**
 * Handles accepting new connections to our server.
 * @returns {Number}
 */
function accept() {
  const userFd = syscalls.accept(acceptFd); // grab a socket from the queue.
  users.push(userFd);
  console.log("User connected on FD: " + userFd)
  syscalls.write(userFd, "Welcome!\n")
  return userFd
}



 /**
  * Read incoming message from a user & broadcasts messages from our connected users.
  * NOTE❗ Normally you keep reading in chunks until there is no more data or we get a 0 byte length string.
  *        Here we're reading a 1kb message, if it's more it will  truncate. TODO ❗ create a 10byte limit
  * @param {Number} SENDER_FD 
  */
function readAndBroadcastMessage(SENDER_FD) {
  const message = syscalls.read(SENDER_FD, 1024)

  // Read w/ a 0 byte string == connection closed
  if (message.length == 0) {
    disconnect(SENDER_FD)
    return;
  }

  // Send the message to all connected users
  users.forEach((USER_FD) => {
    if (USER_FD != SENDER_FD) syscalls.write(USER_FD, "user " + SENDER_FD + "> " + message)
  })
}









/**
 * Disconnects a connected client from our server.
 * NOTE❗ Even though a connection may be closed by a user, we need to call close on our end. 
 *        Calling `close` won't immediately close a socket (either server or clientside).
 *        Calling `close` tells the OS to free up memory used by that FD & close it when its done writing its data.
 *        Freeing up that memory used by that file descriptor allows us to re-use that file descriptor number to ensure
 *        we don't run out of file descriptor numbers. OS's have a default limit of about 1000(varies by OS & config).
 * @param {Number} fd 
 */
function disconnect(fd) {
  console.log("User disconnect on FD: " + fd)
  syscalls.close(fd)
  users.splice(users.indexOf(fd), 1)
}




while (true) {
  const fds = syscalls.select(users.concat(acceptFd), [], [])
  const readableFds = fds[0]

  readableFds.forEach(function(fd) {
    if (fd == acceptFd) {
      accept()
    } else {
      readAndBroadcastMessage(fd)
    }
  })  
}