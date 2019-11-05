const syscalls = require('syscalls');
const BYTES_TO_READ = 1024;
const STD_OUT = 1;




const fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM,0)
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);      // Makes sockets non-blocking.

syscalls.connect(fd, 3000, "0.0.0.0");                         // connect is not blocking. It's just going to start the connection

/**
 * Cases were socket/fd are not available to writes
 * 1. If you're writing lots & lots of data and the OS cannnot buffer it fast enough.
 * 2. If the socket is not `connect`ed. 
 *    Recall that `connect`  starts a connection, it doesn't wait for the connection to happen. If we write
 *    & haven't connected we'll get an error.
 *    Locally we shouldn't get this problem b/c there's no delay with the NIC. BUT
 *    with a remote server, there is a delay.
 */
syscalls.select([], [fd], []);    // wait for socket to become `write`able (AKA we have a connection)
syscalls.write(fd, "hi\n");


syscalls.select([fd], [], []);    // wait for socket to be `read`able....listening for a response!
let data = syscalls.read(fd, BYTES_TO_READ);
syscalls.write(STD_OUT, `[CLIENT]: response --> ${data}`);

