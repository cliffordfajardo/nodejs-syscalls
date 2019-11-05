/**
 * Anytime we're creating a server, at a minimum there's 2 file descriptors
 * - 1 'accepting' fd for our server (this lets outside world connect to us. There is only 1 instance of this process).
 * - 1 'connecting' fd for each connected client.
 */
const syscalls = require('syscalls');
const STD_OUT = 1;
const BYTES_TO_READ = 1024;

/**
 * Create an IPV4 TCP socket.
 * TODO: why is this `AF_net` but the docs they IF
 */
const ACCEPTING_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0); //last argument is rarely used


/**
 * Bind a socket to a port and address.
 * "0.0.0.0" (wild card address is different than loopback 127.xx (localhost), this accepts connections on all the interfaces of our machine)
 * Think of "0.0.0.0" as a ‘no particular address’ place holder. In the context of servers, "0.0.0.0" means all IPv4 addresses on the local machine.
 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on the host listens on 0.0.0.0, it will be reachable at both of those IPs
 * 
 * ✅ curl localhost:3000 
 * ✅ curl 0.0.0.0:3000
 */
syscalls.bind(ACCEPTING_FD, 3000, "0.0.0.0")

/**
 * Enable the socket to listen for incoming connctions. Incoming connections get added on a queue
 * The backlog parameter, (2nd argument) defines the max length for the queue of pending connections.
 * The OS uses this number to limit the amount of connections we can queue up. 
 * Each time there is an incoming connection if the process is not ready to accept the connection the OS will take care of it by queing it up in the backlog queue.
 */
syscalls.listen(ACCEPTING_FD, 100)
syscalls.write(STD_OUT, `Listening for incoming connections on "http://0.0.0.0:3000/"\n`);


while(true) {
  /**
   * Tell the OS we're ready to accept new connections from the queue.
   * Returns a new FD for the  socket that is the connection with the remote (client).
   * 
   * At this point we have 2 sockets
   *  - 1 socket for listening for incoming connections. We only use this FD for accepting. Each time there's a
   *     new connection, for each open connection on the server, a new FD will be created `INCOMING_CONN_FD` for that specific connection.
   */
  const INCOMING_CONN_FD = syscalls.accept(ACCEPTING_FD);
  syscalls.write(STD_OUT, `[Server]: Accepted new connection from FD:${INCOMING_CONN_FD}\n`);



  const data = syscalls.read(INCOMING_CONN_FD, BYTES_TO_READ);
  syscalls.write(STD_OUT, `[Server]: FD#${INCOMING_CONN_FD} data --> ${data}\n`);

  //Send the connected client a message
  syscalls.write(INCOMING_CONN_FD, `[ClientFD#${INCOMING_CONN_FD}]: Response --> Bye!`);

  syscalls.close(INCOMING_CONN_FD); 
}



// ❗Questions: Why does my connection end after 1 curl request?
//    Currently, we set up the server, accept connections, respond to the connections and then the script terminates, thus the server terminates.
//    What we need to do is put our code which accepts and response to connections inside a while-loop so our program keeps running.
//    
//    echo hello | nc localhost 3000