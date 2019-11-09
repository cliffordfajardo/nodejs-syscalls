const syscalls = require('syscalls');
const STD_OUT = 1;

const filenames = process.argv.slice(2);
if(filenames.length === 0) throw Error(`Please provide a filepath to the cat program. Ex: node cat.js <file path>`);


/********************************************************
* Attempt 1:
* Using `getFileSize` to tell `read` how much data to read at once (AKA the whole file!)
* If the file is megabytes large, than loading everything into memory at once wouldn't be ideal.
********************************************************/
// filenames.forEach((filename) => {
//   const fd = syscalls.open(filename, syscalls.O_RDONLY);
//   const file_size = getFilesizeInBytes(filename);    // note this needs to ne run from this folder. If you run it from root `./my-file.txt` will be run from the CWD of where the program started
//   const data = syscalls.read(fd, file_size)
//   syscalls.write(STD_OUT, data);
//   syscalls.close(fd);
// })

// /**
//  * Get the length of a given file.
//  * @param {string} filename 
//  */
// function getFilesizeInBytes(filename) {
//   const fs = require('fs');
//   const stats = fs.statSync(filename)
//   const fileSizeInBytes = stats["size"]
//   return fileSizeInBytes
// }











/****************************************************************************
* Attempt 2:
* Read the data in chunks & immediatly write the data out!
* This is more memory efficient, especially for VERY large files.
* At most, we're loading 1024 bytes into memory, writing out to STDOUT
* reading 1024 bytes again, overwriting the old `data` valu & writing STDOUT.
* If our file was 1gb large, we would still only be reading `1024bytes` at a time.
****************************************************************************/
const BYTES_TO_READ = 1024; 
filenames.forEach((filename) => {
  const fd = syscalls.open(filename, syscalls.O_RDONLY);
  let data;
  do {
    data = syscalls.read(fd, BYTES_TO_READ)
    syscalls.write(STD_OUT, data);
  } while(data.length > 0);
  
  syscalls.close(fd);
})





