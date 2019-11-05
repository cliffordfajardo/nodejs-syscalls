/**
 * Creating a client like the `curl` command that can 
 * - connect with our server
 * - send it messages
 * - recieve responses from server
 * 
 * Example usage: node curl.js https://www.google.com
 *                DUMPS HTML
 *
 *  NOTE: the real curl dumps back the response body by default, without the request headers. Our version doesn't have any options. We get back whatever is given to us.
 * 
 * PSEUDO CODE
 *  1.Extract the URL value from the command line arguments.
 *  2.Convert the domain name to an IP address. We're not going to create a DNS server from scratch, instead we'll use the builtin `dns` module.
 *  3.Use the IP to connect to the server and listen for it's response.
 */
const dns = require('dns');
const syscalls = require('syscalls');
const STD_OUT = 1;
const BYTES_TO_READ = 4000;

const args = process.argv.slice(2);
const url = args[0]

const matches = /^http:\/\/([\.\w]+)/.exec(url); // http://www.google.com' --> ["http://www.google.com", "www.google.com", index: 0, input: "http://www.google.com", groups: undefined]
const host = matches[1]; // www.google.com ...essentially, we're removing the protocol.

if(args.length === 0) {
  throw new Error("Please provide a url. Ex: node curl-v2.js https://www.google.com/");
}

const curl_request_header = [
  `GET ${url} HTTP/1.1\r\n`,
  "Connection: close\r\n",
  "\r\n"
].join('')

/**
 * Create a IPV$ TCP socket
 */
const client_FD = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls

dns.lookup(host, function(error, ip_address){
  if(error) throw new Error(`Error occured while attempting DNS look ip on ${host}`);
  syscalls.write(STD_OUT, `DNS LOOKUP SUCCESSFUL\n\n`);
  
  syscalls.connect(client_FD, 80, ip_address);
  syscalls.write(client_FD, curl_request_header); // Send the server a request, so it can respond back.

  let data;
  do {
    data = syscalls.read(client_FD, BYTES_TO_READ)
    syscalls.write(STD_OUT, data);
  } while(data.length > 0)
  syscalls.close(client_FD);
});





// QUESTIONs
// Why is `http://www.google.com/` returning data correctly, but `http://www.google.com` without the traling forward slash not?
// looks like curl automatically adds a trailling slash:
//  - https://curl.haxx.se/mail/archive-2016-08/0027.html
//  - https://softwareengineering.stackexchange.com/questions/186959/trailing-slash-in-restful-api