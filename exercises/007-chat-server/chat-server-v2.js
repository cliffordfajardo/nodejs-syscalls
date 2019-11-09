/********************************************************************************
* This file is nearly the same as `chat-server-v1.js` except I'm using callbacks
* to handling my events and modifying select a bit.  `select(Object.keys(hash), [], [])
*
* Why are we using callbacks❓
* - learn different way to structure things
* - slwoly moving to adding callbacks to our system
********************************************************************************/
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
const acceptFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
syscalls.fcntl(acceptFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(acceptFd, config.port, config.host)
syscalls.listen(acceptFd, config.backlog_limit)
const users = []; // FDs 



/**
 * Handles accepting new connections to our server.
 * @returns {Number}
 */
function accept() {
  const userFd = syscalls.accept(acceptFd); // pick up a FD from the queue
  users.push(userFd)
  syscalls.write(STD_OUT, `User (FD#${userFd}) connected.`);
  syscalls.write(userFd, "Welcome!\n")
  return userFd
}



 /**
  * Read incoming message from a user & broadcasts messages from our connected users.
  * NOTE❗ Normally you keep reading in chunks until there is no more data or we get a 0 byte length string.
  *        Here we're reading a 1kb message, if it's more it will  truncate. TODO ❗ create a 10byte limit
  * @param {Number} SENDER_FD 
  */
function read_and_broadcast_message(SENDER_FD) {
  const message = syscalls.read(SENDER_FD, 1024)

  // Read with a 0 byte string === connection closed
  if (message.length === 0) {
    disconnect(SENDER_FD)
    return;
  }

  // Send the message to all connected users
  users.forEach((USER_FD) => {
    if (USER_FD != SENDER_FD) syscalls.write(USER_FD, `user ${SENDER_FD}> ${message}`);
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
  syscalls.write(STD_OUT, `User (FD#${fd}) disconnected.`)
  syscalls.close(fd)
  users.splice(users.indexOf(fd), 1)
  delete callback_map[fd];
}



//TODO❗: need to map out the process os select and socket events
const callback_map = {
  /*fd : <function-to-call-when-readable*/
  // Code to run when the accept_fd becomes readable. Once we've accepted a new socket connection, add the new user FD to our hash with the action they can perform `read_and_broadcast_message`
  
  acceptFd: () => {
    const user_fd = accept();
    callback_map[userFd] = () => {
      read_and_broadcast_message(user_fd);
    }
  }
}



while (true) {
  // const fds = syscalls.select(users.concat(acceptFd), [], []) // `select(Object.keys(callback_map), [], [])
  const fds = syscalls.select(Object.keys(callback_map), [], [])
  const readableFds = fds[0]

  readableFds.forEach((fd) => {
    const callback = callbacks[fd];
    callback();
  })  
}





/**
 * In summary, we've implemented a basic event loop. A basic event loop `select`s on all the file descriptors we care about
 * and then executes callbacks depending on what type of event occured. So we iterate over all our file descriptors,
 * the callback associated with that particular file descriptor and execute it. 
 */