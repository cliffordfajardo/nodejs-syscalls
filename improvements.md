- convert to ES6 (separate branch)

# Preface to students
- increase mental model
- when doing exercises, attempt it even if its the most hackiest code. Don't trick yourself..struggle
  and then when you view it your brain will have a reference point to correct.
  Advise dont just passively accept my solutions.

# Create a wrapper for this code in C.
  - good opportunity to get more familiar with C sycalls
  - good opportunity to create my first package in another language and import into JS)

# Add typescript annotations to my module to enabled autocompletion for students.
- call the parameters in the autocompletes the same as in the man pages. Ex: `read(int fildes, void *buf, size_t nbyte);`
- this would defintely make the DX better. It would let students know what's optional and what isnt. For my I tried experiementing with the C api and learned by trial and error when running my code.
When running the TS definitions you'll learn alot.


Probably a good idea to do 2 exercises with the class? ...get them exposed to some of the most
important syscalls `read`, `open`, `write`. Or have them do it with a partner...faciliate discussions.

# Write tests?
- probably don't need to...code would need to be written in a modular format on students end. Might be a good exercise for me though.
- MAYBE...writing a test that my version of cat also outputs what the real one does.

I ran `cat my-file1.txt my-file2.txt` against mine the first time and realize I implemented it wrong...doesn't realy matter.





# Exercise 1 personal attempt:
I attempted to read from stdin..it took me to a prompt which is good, but after hitting 
enter, I didn't get the result outputed to STDOUT.. I'll need to redirect my result ro STDOUT
```js
syscalls.read(STDIN, 10);
```

If you look at `man 2 open` there's lots of different options for `oflag`
Create examples in solutions?
```
In addition any combination of the following values can be or'ed in oflag:
  O_NONBLOCK      do not block on open or for data to become available
  O_APPEND        append on each write
  O_CREAT         create file if it does not exist
  O_TRUNC         truncate size to 0
```

How can I visualize the open file descriptors? I know in OS class we used `pstree`, `ps aux`
Every program has its own set of FD;s...



Get it to a point where Oz can look at it. Maybe he can look at it in his OS class.
This may not be super useful to python programmers












# Node JS equivalents Table (node - syscalls - c)
fs.open   -> syscalls.open  ->
fs.close  -> syscalls.close ->
fs.read   -> syscalls.read  ->
fs.write  -> syscalls.write ->
fs.close  -> syscalls.close ->


fs.lstat      -> ???? -> lstat
fs.lstatSync  ->
fs.stat       -> ???? -> stat
fs.statSync   -> 
fs.fstat      -> ???? -> fstat
fs.fstatSync  ->

sockets
socket.listen   -> syscalls.listen  -> listen
socket.connect  -> syscalls.connect -> connect
????            -> syscalls.accept  -> accept
socket.bind     -> syscalls.bind    -> bind (only exposed to UDP I think in Node)



????      -> syscalls.select  -> select


child_process.fork  -> syscalls.fork -> fork

fcntl
??????    syscalls.fcntl -> fcntl




https://medium.com/@fun_cuddles/opening-files-in-node-js-considered-harmful-d7de566d499f