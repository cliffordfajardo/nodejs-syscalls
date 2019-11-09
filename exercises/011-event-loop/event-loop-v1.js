/******************************************************************************
* This file was created after working on `chat-server/chat-server-v2.js`.
* This module moves the event loop logic from `chat-server/chat-server-v2.js`
* into here. 
*
******************************************************************************/
const syscalls = require('syscalls');
const callbacks = {
  read: {
    //fd: callback
  },
  write: {
    //fd: callback
  }
};




/**
 * Map an event and an action to fire to a file descriptor.
 * @param {Number} fd
 * @param {String} event 
 * @param {Function} callback 
 * @returns {void}
 * @example
 * loop.on(fd, `read`, function(){})
 */
function on(fd, event, callback) {
  callbacks[event][fd] = callback;
}





/**
 * Remove a file descriptors event handler
 * @param {Number} fd 
 * @param {String} event 
 * @returns {void}
 * @example
 * loop.remove(fd, `read`)
 */
function remove(fd, event) {
  delete callbacks[event][fd];
}






/**
 * Starts the event loop explicitly as we are using our own event loop & not the one from Node.
 * 
 * What do you mean by the statement above? 
 *  If we we're using the built in modules/functions (API's) that are part of node, they abstract from us the event loop.
 * @returns {void}
 * @example
 * event_loop.run();
 */
function run(){
  while (true) {
    const fds = syscalls.select(Object.keys(callbacks.read), Object.keys(callbacks.write), []);
    const readable_fds = fds[0];
    const writable_fds = fds[1];
  
    readable_fds.forEach((fd) => {
      const callback = callbacks[fd];
      callback();
    });
    writeable_fds.forEach((fd) => {
      const callback = callbacks[fd];
      callback();
    });
  }
} 




// TODO❗ use esNEXT syntax .. look at GUIlib for that package that allows us to do that
module.exports = {
  on,
  remove,
  run
}