const syscalls = require('syscalls');
const STD_OUT = 1;

/*
GOAL: reimplement `cat` command using `syscall` module.
Example program use: node cat.js my-file1.txt my-file2.txt

Questions:
- what syscalls do you think you will need to open a file, scan it and then display it on STDOUT?
*/

const filenames = process.argv.slice(2);       if(filenames.length === 0) throw Error(`Please provide a filepath to the cat program. Ex: node cat.js <file path>`);

// filenames.forEach((filename) => {
//   const fd = syscalls.open(filename, syscalls.O_RDONLY);
//   const file_size = getFilesizeInBytes(filename);    // note this needs to ne run from this folder. If you run it from root `./my-file.txt` will be run from the CWD of where the program started
//   const data = syscalls.read(fd, file_size)
//   syscalls.write(STD_OUT, data);
//   syscalls.close(fd);
// })

// This imeplementation reads in chunks
const BYTES_TO_READ = 1024; 
filenames.forEach((filename) => {
  const fd = syscalls.open(filename, syscalls.O_RDONLY);
  let data; //allocate the variable here to re-use it instead of creating a new one loop.
  do {
    data = syscalls.read(fd, BYTES_TO_READ)
    syscalls.write(STD_OUT, data);  // write chunks to stdout in chunks
  } while(data.length > 0);         // when we've reached the end of the file, 0 will be returned.
  
  syscalls.close(fd);              // if you don't do this, the OS will close it BUT its better to do this so you can free up the fd # so if we need to do another IO we don't need a new entry in our FD table. 1024 FD is the default limit in unix
})





function getFilesizeInBytes(filename) {
  const fs = require('fs');
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}