# Implementing `nc` (netcat) command

# Time

# Goal(s)
Implement the `nc` command


# Tips
Read the man page for `nc` to get familiar with it.

```sh
man nc 
```

You can also try the real command in your terminal
```sh
echo 'hello' | nc localhost:3000
```


Read the man page for `select` (TODO) need to ease into this topic more smoothly.
```
man 2 select
```







# Example Usage

```sh
node nc.js 0.0.0.0 3000
```




# Bonus
Get Domain names to work. You'll need to use the `dns` module to resolve the domain names to their actual IP addresses
```sh
node nc.js localhost 3000
# or
node nc.js google.com 80
```