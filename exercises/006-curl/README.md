# Implenting the `curl` command

# Goal(s)
Implement the `curl` command, which you can use as a client to talk with the web server you are creating.

`curl` will connect with your server
`curl` will be able to write messages to your server
`curl` will be able to read back messages from your server


# Tip
Read the man page for `curl` to get familiar with it.

```sh
# notice how is shows curl(1) in the page....man 1 curl and man curl are the same.
man curl
```

# Example Usage

```sh
node curl.js 0.0.0.0:3000
```

- link on how to use it.


# Bonus
Get your `curl` program to work for domain names like so. You will need to import the node builtin `dns` module
to resolve `localhost` to it's real IP address.

```sh
node curl.js localhost:3000
```