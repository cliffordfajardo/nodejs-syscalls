// TODO Fix this file so it doesn't mention `fcntl`
const syscalls  = require('syscalls');

const STD_OUT = 1;
const BYTES_TO_READ = 1024;
const config = {
  port: 3000,
  address: "0.0.0.0",
  backlog_limit: 100, //Max # of connections to queue.
}

const ACCEPTING_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0); // Create an IPV4 TCP socket

/** 
 * fcntl() provides for control over descriptors.
 * SETFL means setflag
 * O_NONBLOCK: Non-blocking I/O; if no data is available to a read call, or if a write operation would block, the read or write call returns -1 with the error EAGAIN.
*/
syscalls.fcntl(ACCEPTING_FD, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(ACCEPTING_FD, config.port, config.address)
syscalls.listen(ACCEPTING_FD, config.backlog_limit)

syscalls.write(STD_OUT, `Listening for connections on ${config.address}:${config.port}\n`)


while(true) {
  syscalls.write(STD_OUT, "Waiting for a connection...");
  
  const CONNECTION_FD = syscalls.accept(ACCEPTING_FD);      // well get an error since we're not handling this: Error: Resource temporarily unavailable
  syscalls.write(STD_OUT, `Accepted a new connection.\n`);

  let data = syscalls.read(CONNECTION_FD, BYTES_TO_READ);
  syscalls.write(STD_OUT, `[SERVER]: Recieved --> ${data}\n`);
  syscalls.write(CONNECTION_FD, "[CLIENT]: Response --> Bye.\n");

  syscalls.close(CONNECTION_FD)
}