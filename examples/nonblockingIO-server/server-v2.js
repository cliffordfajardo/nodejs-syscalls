/**
 * This is very similar to `server-v1` , exccept we are using a new system call `select.
 * `select` introduces synchronous IO multiplexing, the heart of our event loop.
 *  We're going to use `select` to know when data is ready.
 * 
 * Why is it called synchronous IO multiplexing? Because `select` itself is blocking,
 * but everthing else will be non-blocking. 
 * 
 * The power of `select` is that it can watch 100's or even 1000's of filedescriptors and return backk to us one that is ready.
 * @example
 * readyFDs = select(
 *  [], // FD's I'm waiting to become readable.
 *  [], // FD's I'm waiting to become writable.
 *  []  // FD's I'm waiting to emit errors.
 * );
 */
const syscalls  = require('syscalls');
const STD_OUT = 1;
const BYTES_TO_READ = 1024;

const config = {
  port: 3000,
  address: "0.0.0.0",
  backlog_limit: 100, //Max # of connections to queue.
}

const ACCEPTING_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0); // Create an IPV4 TCP socket
syscalls.bind(ACCEPTING_FD, config.port, config.address)
syscalls.listen(ACCEPTING_FD, config.backlog_limit)

syscalls.write(STD_OUT, `Listening for connections on ${config.address}:${config.port}\n`)



// FD's that return errors (rarely used since it's not portable and each platform implemnets differently)

while(true) {
  syscalls.write(STD_OUT, `Waiting on connection....\n`);
  
  // SYNC wait for `ACCEPTING_FD` to be ready
  const fds = syscalls.select([ACCEPTING_FD],[], []);
  const CONNECTION_FD = syscalls.accept(ACCEPTING_FD);    // normally this blocks..in async...it normall errors....only accept when `select` notifies us that we're ready/
  syscalls.write(STD_OUT, `Accepted a new connection.\n`);


  // SYNC wait for connection to become readable, before we call `read`
  syscalls.select([CONNECTION_FD], [], []);
  let data = syscalls.read(CONNECTION_FD, BYTES_TO_READ);
  syscalls.write(STD_OUT, `[SERVER]: Recieved --> ${data}\n`);



  //SYNC wait for connecting_FD to be write
  syscalls.select([], [CONNECTION_FD], []);
  syscalls.write(CONNECTION_FD, "[CLIENT]: Response --> Bye.\n");
  syscalls.close(CONNECTION_FD)
}