const syscalls = require('syscalls')
const dns = require('dns')

const url = process.argv[2]

const matches = /^http:\/\/([\.\w]+)/.exec(url)
const host = matches[1]

dns.lookup(host, function(err, address, family) {
  if (err) throw err
  connect(address)
})

function connect(address) {
  const fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)

  syscalls.connect(fd, 80, address)

  syscalls.write(fd, "GET " + url + " HTTP/1.1\r\n" +
                     "Connection: close\r\n" +
                     "\r\n")

  let data
  while ((data = syscalls.read(fd, 1024)).length > 0) {
    syscalls.write(1, data)
  }

  syscalls.close(fd)
}