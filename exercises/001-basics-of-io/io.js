/*
Goal: use the `read()` syscall to read from STDIN and then output it back to stdout

Tips:
- Read the man page for this syscall. Terminal: "man 2 read"
*/
const syscalls = require('syscalls');
const STDIN = 0;
const STDOUT = 1;

// const bytes_to_read = 10;
// const user_input= syscalls.read(STDIN, bytes_to_read);
// syscalls.write(STDOUT, user_input); // If I type "apples are nice", I'll only read 10 bytes "apples are%"






// If I want to read the next 10 bytes, I'll need to call read again
const bytes_to_read = 10;
let user_input = '';
user_input += syscalls.read(STDIN, bytes_to_read);
user_input += syscalls.read(STDIN , bytes_to_read);
syscalls.write(STDOUT, user_input); // If I type "apples are nice", I'll only read 10 bytes "apples are%"











// CEMENT THE POINT
// This exercise was to give you exposure to two of the most common syscalls.
// We read and write to the socket all the time (query to db, sending back data to browser via socket)