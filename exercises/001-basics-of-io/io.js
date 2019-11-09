
const syscalls = require('syscalls');
const STDIN = 0;
const STDOUT = 1;



/******************************************************************************
* EXAMPLE 1
* Read the first 10 bytes (10 chars) from the user input.
* If the user typed into the STDIN "apples are nice" this is 15 characters.
* In the example below we only read 10/15
******************************************************************************/
// const bytes_to_read = 10;
// const user_input= syscalls.read(STDIN, bytes_to_read);
// syscalls.write(STDOUT, user_input); // If I type "apples are nice", I'll only read 10 bytes "apples are%"





/********************************************************
* EXAMPLE 2
* Read up to 20 bytes from STDIN. In this example, we're going to read up to 20 characters (20 bytes)
* by calling `read` 2x and buffering that data to the variable `user_input`. 
*
* We could of course decide to make `bytes_to_read` 20 but i'm just demonstrating how chunking is done imperatively.
* Ideally, you would do chunking in a while loop `read` returns back 0. Why 0? According to the `read` system call API docs
* (see  `man 2 read` in your terminal) when we've reached the end of the file `read` returns 0.
**/ 
const bytes_to_read = 10;
let user_input = '';
user_input += syscalls.read(STDIN, bytes_to_read);
user_input += syscalls.read(STDIN , bytes_to_read);
syscalls.write(STDOUT, user_input);




/********************************************************
* CEMENT THE POINT
* This exercise was to give you exposure to 2 of the most common syscalls!
* Did you know that `read` and `write` syscalls are not only used on files, but also sockets?
* If you've ever heard the concept 'everything is a file' on unix, this is where it comes from...the
* fact that we can read and write to files, sockets (which is an abstraction over a network connection but from a programmers perspective its like a file!).
* When we query to a database, we are usually writing to a socket that's connected to the database server...(sqlite is an exception (its just a file on disk))
* or when we are sending back data to the browser\
**/ 