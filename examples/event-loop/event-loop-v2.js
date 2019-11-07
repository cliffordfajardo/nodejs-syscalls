/******************************************************************************
* This file was created after working on `event-loop-v1`.
* This file is nearly identical, except we're adding a new feature to allow for timers.
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



const timers = [];
/**
 * 
 * @param {Function} callback 
 * @param {Number} milliseconds 
 */
function setTimeout(callback, milliseconds) {
  timers.push({
    callback: callback,
    timeout: new Date().getTime() + milliseconds // get current time on computer
  });
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
  // run the event loop while there is something to do. Without this, when we ran `timer.js` it would run the code & hang.
  // the hang came from the fact that after those timers ran we we're now at `select`. Recall `select` is blocking and it's waits for stuff.
  let has_pending_work; 
  while (has_pending_work = Object.keys(callbacks.read).length > 0 || Object.keys(callbacks.write).length > 0 || timers.length > 0) {
    // Currently `select` will block indefintely until there's an IO operation. If we had a script with only timers, they would never run with the `select` call below.
    // So we're going to introduce the 4th param to `select` which is a timeout value. The timout is the maximum number of milliseconds that `select` should block
    // until it returns (❗❗❗ syscalls library, chose to do it in seconds....)
    // const fds = syscalls.select(Object.keys(callbacks.read), Object.keys(callbacks.write), []);


    let TIMEOUT = 2; // seconds ...see ! above
    if(timers.length) {
      TIMEOUT = 1; // if there are timers, make `select` only block for 1s to allow any timers to run.
    }


    const fds = syscalls.select(Object.keys(callbacks.read), Object.keys(callbacks.write), [], TIMEOUT);
    const readable_fds = fds[0];
    const writeable_fds = fds[1];
  
    readable_fds.forEach((fd) => {
      const callback = callbacks[fd];
      callback();
    });
    writeable_fds.forEach((fd) => {
      const callback = callbacks[fd];
      callback();
    });

    const time = new Date().getTime();
    
    // See "footnote1" for why we create a shallow copy
    [...timers].forEach((timer) => {
      if(time >= timer.timeout) { // is the timer due or overdue
        timer.callback();
      timers.splice(timers.indexOf(timer), 1); // since these are not interval timers, remove them once used.
      }
    });
  }
} 




// TODO❗ use esNEXT syntax .. look at GUIlib for that package that allows us to do that
module.exports = {
  on,
  remove,
  setTimeout,
  run
}











/**
 * footnote1:
 * Concerning `[...timers].forEach((timer) => {`
 * We're making a shallow copy of the array to iterate over. Why?
 * If we're iterating over an array & splicing it at the same time, our indexes will shift by 1 for each splice, causing us to skip over items.
 * 
 *  const numbers = [5,6,7];
 *  numbers.forEach(num => {
 *    const index = numbers.indexOf(5);                  index:  0 , 1  
 *    numbers.splice(index, 1);             // our array is now [6,  7] ... in the next iteration, our index is 1, so we'll be at 7 skipping 6.
 *  })
 * 
 * Creating a shallow copy to iterate over and splicing the real array is our solution.
 */