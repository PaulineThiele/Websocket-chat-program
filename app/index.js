(async function() {

    const ws = await connectToServer();    

    // receive Websocket message
    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;

        if(messageBody.val != null)
        {
            receiveTextMessage(messageBody);
        }
    };      
    
    ws.onclose = () => {
        console.log("closed");
    };
    
    //recognized cursor movement 
    document.body.onmousemove = (evt) => {
        const messageBody = { x: evt.clientX, y: evt.clientY };
        ws.send(JSON.stringify(messageBody));
    };

    document.body.onclick = (evt) => { 
        var X = evt.clientX;
        var Y = evt.clientY;
        createInputText(X,Y);
    };

    //connect client to server  
    async function connectToServer() {    
        const ws = new WebSocket('ws://192.168.178.51:7071/ws');
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
        
        //if no cursor was found, clone cursor template and fill with data  
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
})();