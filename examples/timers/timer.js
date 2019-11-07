const event_loop = require('../event-loop/event-loop-v2');

event_loop.setTimeout(() => {
  console.log(`Hi 1s later`)
},1000);

event_loop.setTimeout(() => {
  console.log(`Hi 2s later`)
},2000);

// Same beahvior as the builtins:
// setTimeout(() => {
//   console.log(`Hi 1s later`)
// },1000);

// setTimeout(() => {
//   console.log(`Hi 2s later`)
// },2000);

event_loop.run();