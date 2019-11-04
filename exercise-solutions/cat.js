/**
 * Program usage: node cat.js
 * 
 * We're going to use several system calls here, the 
 * 1.`open` syscall to open or create a` file for reading or writing. 
 *    Open via terminal "man 2 open" OR  http://man7.org/linux/man-pages/man2/open.2.html
 * 
 * 2.`read` syscall top read data from a file.
 *    Open via terminal "man 2 read" OR http://man7.org/linux/man-pages/man2/read.2.html
 * 
 * 3.`write` syscall to write to a buffer (std out in our case)
 *    Open via terminal "man 2 read" OR http://man7.org/linux/man-pages/man2/read.2.html
 */
const syscalls = require('syscalls');
const files = process.argv.slice(2) 

files.forEach((file) => {
  const fd = syscalls.open(file, syscalls.O_RDONLY);
  
  let data;
  while (data.length > 0) {
    data = syscalls.read(fd, 1024 /*At most read 1k*/)
    syscalls.write(1, data)
  }
  syscalls.close(fd)
})