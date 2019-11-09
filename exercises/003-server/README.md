# server

# Goals
Create a basic TCP server that is listening on port 3000 on the address `0.0.0.0`.


# Example Usage

```sh
# terminal tab 1
node server.js



# terminal tab 2 ...use a client to talk with the server
>echo 'hello' | nc localhost 3000



# or another way is to directly use `nc`.
nc localhost 3000 # hit enter and type your message
hello
```



# Tip
Read the man pages for these system calls in this order.

1. `socket`
2. `bind`
3. `accept`
4. `listen`




# Questions to Ponder
TODO: add more details...this is my first pass at cleanup

# Bonus
- have your server return a successful response back to your browser.

