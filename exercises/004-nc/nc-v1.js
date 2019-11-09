/**
 * Implementation of `nc` command. This is my first attempt from scratch. v2 is based off solution.
 * 
 *  PSUEDO CODE
 * --------------------
 * 
 * 
 * Example
 * > node nc.js localhost 3000
 * > hello  # send 'hello' to server
 * >
 * > bye    # response from server
 *  ---------------------------------------
 * > node nc.js google.com 80
 * > hello
 * >
 * > HTTP/1.0 400 Bad Request # response from google server
 * > .....
 */
const syscalls = require('syscalls');
const STD_OUT = 1;
const STD_IN = 0;
const BYTES_TO_READ = 1024;
const args = process.argv.slice(2);
if(args.length < 2) throw new Error(`Please provide an address & port. Example: node nc.js google.com 80`);
const destination_address = args[0]
const destination_port = parseInt(args[1]);



const CLIENT_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.connect(CLIENT_FD, destination_port, destination_address);


syscalls.select([], [STD_IN], []);              // Notify us when STD_IN is write-ready, so we can write data to it.
syscalls.select([STD_IN], [], []);              // Notify us when STD_IN is read-ready, so we can read data from it
const user_input_data = syscalls.read(STD_IN, BYTES_TO_READ);



syscalls.select([], [CLIENT_FD], [])             // Notify us exactly when the socket is `writable`.
syscalls.write(CLIENT_FD, user_input_data)       // Send data off to server



syscalls.select([CLIENT_FD], [], [])            //Notify us when the server has written back to us and write response to STD OUT
let response_chunk;
do {
  response_chunk = syscalls.read(CLIENT_FD, BYTES_TO_READ);
  syscalls.write(STD_OUT, response_chunk);
} while(response_chunk.length > 0);



















/**
 * Thoughts during development
 * ----------------------------
 * I had to read the docs on `select` a few times to remember what I actually wanted to `select` and when.
 * `select` allows me to pass a list of FD's. It will notfy me when a socket is ready for `read` or `write`.
 * 
 * 1. node nc.js localhost 3000 doesn't work, but it does with the real netcat.
 *    -  Does using Node's built in DNS resovler solve it? SEE SOLUTION, which does make use of `dns` module.
 *        ANSWER: when we pass `localhost` that domain name needs to be resolve to the an actual IP (127.0.0.1 AKA the loopback address)
 *                Also our end server is using 0.0.0.0...that's an actual IP...our module was providing a domain name. 127.X maps to wildcar too.
 * 
 *  node nc.js 0.0.0.0 3000 ✅ worked when connecting to `nonblockingIO-server/server-v2.js`. Probably has to do with DNS resolution see above
 * 
 * 
 * 2.Is blocking really all that bad for a programming like nc, which is only used an operated by one user? Why do we need `select`?
 * - 
 */