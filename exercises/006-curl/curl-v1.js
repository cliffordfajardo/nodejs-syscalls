const syscalls = require('syscalls');
const STD_OUT = 1;
const BYTES_TO_READ = 1024; // arbitrary value...

/**
 * Create a socket which will connect to our server located at 0.0.0.0:3000 (that server should be running in a different tab)
 */
const client_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
// const has_connected = syscalls.connect(client_FD, 3000, "0.0.0.0"); TODO: this doesn't work like the real API

syscalls.connect(client_FD, 3000, "0.0.0.0");
syscalls.write(client_FD, 'Hi from curl.');


/**
 * Read the response the server on our connected socket.
 */
const data = syscalls.read(client_FD, BYTES_TO_READ)
syscalls.write(STD_OUT, data);







// Question:
//   - How do I get my curl client to send request headers? I imagine, that I'd need to write that into my socket before sending my message?

//   When I hit my sever with real "curl" it recieves this:
//     GET / HTTP/1.1
//     Host: localhost:3000
//     User-Agent: curl/7.64.1
//     Accept: */*

//   When I hit it with my basic curl which simply writes to the socket "Hi from curl"
//     Hi from curl





