/********************************************************
* This file is is a refactoring of `chat-server/chat-server-v2.js`
* The differences:
* - we've remove the event loop code out of ther server
* - we now use an `event_loop` module in our server.
*
*
* 💡Improvements 💡:
* We've improved the API of our event loop, but it could be nicer.
* We could abstract away needing to specify the file descriptor for registering & removing events &
* store the file descriptor in an object representing an IO object. This is what NODE JS does actually.
*
* const IO_object = {
*   fd: number,
*   
*   proto: {
*     on(){},
*   }
* }
*
*
* BEFORE:   event_loop.on(SOME_FD, 'read', ()=>{})
*           event_loop.on(SOME_FD, 'write', ()=>{})
*
* AFTER:    SOME_SOCKET.on('read', () => {});
*           SOME_SOCKET.on('write', () => {});
*
********************************************************/
const syscalls = require('syscalls');
const event_loop = require('./event-loop/event-loop-v1');
const config = {
  port: 3000,
  host: "0.0.0.0",
  backlog_limit: 100
};
const STD_OUT = 1;


/********************************************************
* Setup simple chat server
********************************************************/
const ACCEPT_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
syscalls.fcntl(ACCEPT_FD, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(ACCEPT_FD, config.port, config.host)
syscalls.listen(ACCEPT_FD, config.backlog_limit)
const users = [/* FDs */]; 



/**
 * Handles accepting new connections to our server.
 * @returns {Number}
 */
function accept() {
  const USER_FD = syscalls.accept(ACCEPT_FD); // pick up a FD from the queue
  users.push(USER_FD)
  syscalls.write(STD_OUT, `User (FD#${USER_FD}) connected.`);
  syscalls.write(USER_FD, "Welcome!\n")
  return USER_FD
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

  event_loop.remove(fd, 'read');
}





event_loop.on(ACCEPT_FD, 'read', () => {
  const USER_FD = accept();
  event_loop.on(USER_FD, 'read', () => read_and_broadcast_message(USER_FD));
})



event_loop.run();