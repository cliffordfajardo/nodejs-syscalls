# Implenting the `cat` command

# Goal(s)
Implement the `cat` command in a file called `cat.js`.


# Tip
Read the man page for the `cat` command to get an understanding of what `cat` is supposed to do.

```
man cat
```


Additionally, you could also just try using cat yourseld on a text file (any human readable file) by using the command:
```
cat my-file1.txt
```


# Example Usage

```
node cat.js my-file.txt
```


# Questions to ponder:
What syscalls do you think you will need to read the file contents?
What syscalld do you think you will need to write back the contents of the file back to STD out?





# Bonus
Allow users to pass multiple arguments to `cat` like so, which will print out the contents of the first file and the second file in sequentially.

```
node cat-v2.js myfile1.txt myfile2.txt
```
