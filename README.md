# Cursor-Chat (for WebSocket presentation)

Used this tutorial as the base:
https://ably.com/blog/web-app-websockets-nodejs

Implemented additional functionality:
* Possibility to leave a message: Click on the page, enter some text and press 'Enter' (text will be in the same color as User/Cursor)
* New users receive/see all messages that have been entered before during an ongoing session


# How it's built (based on the tutorial)

* /app is the browser application
* /api is a node.js web sockets server
* Web app connects to web sockets server
* On connection, each client is assigned an `id` and a `color`.
* On mouse move, coordinate updates are sent to the server
* The server adds the client's `id` and other metadata
* The enhanced message is sent to all the clients.


# Running

```bash
> npm install
> npm run start
```
