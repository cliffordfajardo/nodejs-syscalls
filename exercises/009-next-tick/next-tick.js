const event_loop = require('../event-loop/event-loop-v3.js');

console.log('This will print 1st. (line 3)')

// Not in next_tick queue yet. Because event loop hasn't started
event_loop.nextTick(() => {
  console.log('This will print 3rd. (line 6)');

  event_loop.nextTick(() => {
    console.log('This will print last. (line 10)');
  })

})
console.log('This will print 2nd. (line 12)');



// At this point our 2 console logs ran. Now, we start the event loop.
event_loop.run();