// create new websocket server 
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7071 });

// create map to store clients metadata (ID, Farbe) --> like a dictionary
const clients = new Map();

const allMessagesArray = []; // was zur hölle tut es??

// Verbindung eines neuen Clients mit dem Websocketserver & Speicherung der Metadaten des Clients 
wss.on('connection', (ws, req) => {
    const id = uuidv4();                              //generieren einer individuellen ID
    const color = Math.floor(Math.random() * 360);    // Zahl zwischen 0 & 1 --> multipliziert mit 360 --> Farbe auf dem HSV Farbraum 
    const metadata = { id, color, ip: req.socket.remoteAddress };                   // object mit ID und color 

    clients.set(ws, metadata);      //add new client to map
    allMessagesArray.forEach(message => ws.send(JSON.stringify(message)));

    ws.on('message', (messageAsString) => {           //wird aufgerufen, wenn der Server eine Nachricht emfängt 
      const message = JSON.parse(messageAsString);    //Nachricht aus Json Datei auslesen 
      const metadata = clients.get(ws);               //Metadaten des Clients aus Map rauslesen

      // die beiden Inhalte (ID & color) des Clients an die Nachricht hängen 
      message.sender = metadata.id;
      message.color = metadata.color;
      console.log(message);

      allMessagesArray.push(message);

      // an alle anderen verbundenen Clients wird die Nachricht geschickt
      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify(message));
      });

      ws.on('close', () => {
        clients.delete(ws);
        console.log("Client with IP address "+ metadata.ip +" has left the session.");

        //überprüfen ob alle Clients das Browserfenster geschlossen haben 
        if(clients.size === 0){
          console.log("Session ended for all clients.");
          wss.close();
        }
      })
    });  
});

// wenn Client die Verbindung schließt, alle metadaten dieses Clients von der Map entfernen
//wss.on("close", (ws) => {
  //clients.delete(ws);
  //console.log("user disconnected");
//});

//Funktion zum Erstellen einer individuellen ID 
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log("wss up");
//wss.close();