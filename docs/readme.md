# TODO
TODO
- consilitate this with Notes.md

# Class Notes

### Part 1
Intro Overview: 
- Javascript/Node: brief overview of the language/environment
- I/O system calls: how the language we use interacts with the operating system to perform IO operations. Example: read file, write file, make a network request, connection to external server
- Non-blocking I/O:
- I/O Multiplexing: core part of our event loop.

### Part 2
Intro Overview:
- The Event Loop: we're going to build our own event loop library inside of Nodejs. We're only going to use NODEJS as a JS interpreter, that is werre not going to use the event loop that's part of Nodejs.
- Creating a web server: we're going to tie our event loop with a simple server we're going to build.
- Blocking & unblocking the event loop: using our server we will see what causes blocks and how we can unblock
- Processes: how to use proccesses to achieve 'parallelism' or  multi-core performance.

  



  


# FAQ
**How do we take advantage of multiple CPU's on our machine?**
- proccesses

**What happens when we create a new proccess?**
- A new instance of `node` is created. Forking a process is an expensive process in terms of resources & is slow.
  It means running a new virtual machine from scratch using a lot of memory since processes don’t share memory.

**What is event driven programming**
When we're writing our code in such a way that we're responding to events, typicall callback or promise style code. The order in which code executes is determined by the order in which the events on IO objects happen.




# Resources
https://github.com/streamich/libjs
https://github.com/streamich/libsys
https://stackoverflow.com/questions/16707098/node-js-kernel-mode-threading