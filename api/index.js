// create new websocket server 
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7071 });

// create map to store clients metadata (ID, color)
const clients = new Map();
const allMessagesArray = [];

// if client is connectetd to server  
wss.on('connection', (ws, req) => {
    const id = uuidv4();                              //creates individual ID
    const color = Math.floor(Math.random() * 360);    //number between 0 & 1 --> * 360 --> color on the HSV spectrum 
    const metadata = { id, color, ip: req.socket.remoteAddress };

    clients.set(ws, metadata);                        //add new client to map
    allMessagesArray.forEach(message => ws.send(JSON.stringify(message)));

    ws.on('message', (messageAsString) => {           //if the server receives a new message 
      const message = JSON.parse(messageAsString);    //read json data
      const metadata = clients.get(ws);               //read metadata from map

      //add ID and color to the message  
      message.sender = metadata.id;
      message.color = metadata.color;

      allMessagesArray.push(message);

      //send message to all clients
      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify(message));
      });

      ws.on('close', () => {
        if(clients.has(ws)){
          const metadata = clients.get(ws);
          clients.delete(ws);
          console.log("Client with IP address "+ metadata.ip +" has left the session.");
          
          //checks if all clients left 
          if(clients.size === 0){
          console.log("Session ended for all clients.");
          wss.close();
          }
        }
      })
    });  
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log("wss up");