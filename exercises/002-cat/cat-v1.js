const syscalls = require('syscalls');
const STD_OUT = 1;

/*
GOAL: reimplement `cat` command using `syscall` module.
Example program use: node cat.js my-file.txt

Questions:
- what syscalls do you think you will need to open a file, scan it and then display it on STDOUT?
*/

const args = process.argv.slice(2);       if(args.length === 0) throw Error(`Please provide a filepath to the cat program. Ex: node cat.js <file path>`);
const filename = args[0];


const fd = syscalls.open(filename, syscalls.O_RDONLY);
const file_size = getFilesizeInBytes('./my-file.txt');    // note this needs to ne run from this folder. If you run it from root `./my-file.txt` will be run from the CWD of where the program started
const data = syscalls.read(fd, file_size)

syscalls.write(STD_OUT, data);
/*Prints
----------
hello
world%
*/

syscalls.close(fd);







// TODO: instead of using fs, implement `fseek`, `stat`...https://stackoverflow.com/questions/238603/how-can-i-get-a-files-size-in-c
function getFilesizeInBytes(filename) {
  const fs = require('fs');
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}