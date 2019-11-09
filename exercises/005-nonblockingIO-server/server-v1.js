/**
 * Non blocking server. Uses  `fcntl` to make the socket methods asynchronous.
 * However, when we make a socket async, it will keep emitting errors.
 */
const syscalls  = require('../010-http-server/node_modules/syscalls');
const STD_OUT = 1;
const BYTES_TO_READ = 1024;

const config = {
  port: 3000,
  address: "0.0.0.0",
  backlog_limit: 100, //Max # of connections to queue.
}

const ACCEPTING_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0); // Create an IPV4 TCP socket
syscalls.fcntl(ACCEPTING_FD, syscalls.F_SETFL, syscalls.O_NONBLOCK)
syscalls.bind(ACCEPTING_FD, config.port, config.address)
syscalls.listen(ACCEPTING_FD, config.backlog_limit)

syscalls.write(STD_OUT, `Listening for connections on ${config.address}:${config.port}\n`)

while(true) {
  console.log("Waiting for a connection....(this is blocking)");
  const CONNECTION_FD = syscalls.accept(ACCEPTING_FD);
  syscalls.write(STD_OUT, `Accepted a new connection.\n`);

  let data = syscalls.read(CONNECTION_FD, BYTES_TO_READ);
  syscalls.write(STD_OUT, `[SERVER]: Recieved --> ${data}\n`);
  syscalls.write(CONNECTION_FD, "[CLIENT]: Response --> Bye.\n");

  syscalls.close(CONNECTION_FD)
}