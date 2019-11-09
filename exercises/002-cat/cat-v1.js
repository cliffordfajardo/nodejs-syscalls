const syscalls = require('syscalls');
const STD_OUT = 1;
const args = process.argv.slice(2);
if(args.length === 0) throw Error(`Please provide a filepath to the cat program. Ex: node cat.js <file path>`);
const filename = args[0];


const fd = syscalls.open(filename, syscalls.O_RDONLY);
const file_size = getFilesizeInBytes('./my-file.txt');    // note this needs to ne run from this folder. If you run it from root `./my-file.txt` will be run from the CWD of where the program started
const data = syscalls.read(fd, file_size)
syscalls.write(STD_OUT, data);
syscalls.close(fd); // close the file, we're done reading it.




// FUTURE TODO❗: instead of using fs, implement `fseek`, `stat` (make an exercise out of these..)...https://stackoverflow.com/questions/238603/how-can-i-get-a-files-size-in-c
function getFilesizeInBytes(filename) {
  const fs = require('fs');
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}