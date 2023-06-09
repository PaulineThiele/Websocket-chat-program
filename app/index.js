// Connect Client to Server 
(async function() {

    const ws = await connectToServer();    

    // receive Websocket Message
    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
        //create textfield through function createtextfield()
        if(messageBody.val != null)
        {
            receiveTextMessage(messageBody);
        }
    };      
    
    ws.onclose = () => {
        console.log("closed");
    };
    
    // Cursorbewegung erkennen und durch Json datei an Server senden 
    document.body.onmousemove = (evt) => {
        const messageBody = { x: evt.clientX, y: evt.clientY };
        ws.send(JSON.stringify(messageBody));
    };

    // es soll nur für mich eine Textbox erscheinen an Stelle x/y
    // in diese schreibe ich meinen Text
    // wenn ich enter drücke soll der Text an der Stelle als Textfeld in der richtigen Farbe erscheinen 
    document.body.onclick = (evt) => { 
        var X = evt.clientX;
        var Y = evt.clientY;
        createInputText(X,Y);
    };

    //Bestätigungsfunktion für eine Verbindung zwischen Client und Server  
    async function connectToServer() {    
        const ws = new WebSocket('ws://localhost:7071/ws');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);
                }
            }, 10);
        });   
    }

    function getOrCreateCursorFor(messageBody) {
        const sender = messageBody.sender;
        const existing = document.querySelector(`[data-sender='${sender}']`);
        if (existing) {
            return existing;
        }
        
        // wenn kein Cursor gefunden wurde, dann Template clonen und mit Daten füllen 
        const template = document.getElementById('cursor');
        const cursor = template.content.firstElementChild.cloneNode(true);
        const svgPath = cursor.getElementsByTagName('path')[0];    
            
        cursor.setAttribute("data-sender", sender);
        svgPath.setAttribute('fill', `hsl(${messageBody.color}, 50%, 50%)`);    
        document.body.appendChild(cursor);

        return cursor;
    }

    function sendTextMessage(X, Y, inputfield)
    {
        document.getElementById("inputfield").remove();

        const messageBody = { x: X, y: Y, val: inputfield };
        ws.send(JSON.stringify(messageBody));
    }

    function receiveTextMessage(messageBody)
    {
        const textmessage = document.createElement("p");
        textmessage.setAttribute("id", "textmessage");
        textmessage.innerText = messageBody.val;
        textmessage.style.color = `hsl(${messageBody.color},50%,50%)`;
        textmessage.style.position = "absolute"; 
        textmessage.style.fontSize = "large";
        textmessage.style.left = messageBody.x+"px"; 
        textmessage.style.top = messageBody.y+"px";
        document.body.appendChild(textmessage); 
        
        return textmessage;
    }

    function createInputText(X,Y)
    {
        var inputfield = document.createElement("input");
        inputfield.setAttribute("type", "text");
        inputfield.setAttribute("id", "inputfield");
        inputfield.setAttribute("size", 30);
        inputfield.setAttribute("placeholder", "enter your text here");
        inputfield.style.position = "absolute"; 

        document.body.appendChild(inputfield);
        inputfield.style.left = X+"px";
        inputfield.style.top = Y+"px";
        
        document.getElementById("inputfield").focus();

        inputfield.addEventListener("keypress", function(event){
            if(event.key === "Enter"){
                event.preventDefault();
                sendTextMessage(X, Y, inputfield.value); 
            }
        });
    }

    function leaveChat()
    {
        window.close();
    }
})();
