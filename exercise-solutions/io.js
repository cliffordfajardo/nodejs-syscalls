/**
 * `write` syscall to write to a buffer (std out in our case)
 *  Open via terminal "man 2 read" OR http://man7.org/linux/man-pages/man2/read.2.html
 * 
 * Read the docs, and try to decipher what is happening. Leave comments.
 */
const syscalls = require('syscalls')
const STD_OUT = 1;
const STD_IN = 0;



// We're going to write `Hello` into the object referenced by file_descriptor 1.
// Recall the FD table. 1 is STDOUT.
syscalls.write(STD_OUT, 'Hello\n')

// Fun fact, you can use this very same syscall to write to files, sockets...used anytime we want to write to an IO object.




// We're going to read 10 bytes from STDIN
// because we're calling `read` on stdin, we will be prompted to STDIN to write something.
// we can only type at most 10 characters
let data = syscalls.read(STD_IN, 10)
console.log("You typed: " + data)