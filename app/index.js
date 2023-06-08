(async function() {
    const ws = await connectToServer();  

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

    // Receive Websocket-Messages
    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
        // document.getElementById("userCounter").innerText = messageBody.clientCount;
        if (messageBody.messageInput != null) {
            const message = receiveMessage(messageBody);
            message.color = `hsl(${messageBody.color}`;
        }
    };

    ws.onclose = () => {
        console.log("closed");
    };

    document.body.onmousemove = (evt) => {
        const messageBody = { x: evt.clientX, y: evt.clientY };
        ws.send(JSON.stringify(messageBody));
    };

    function getOrCreateCursorFor(messageBody) {
        const sender = messageBody.sender;
        const existing = document.querySelector(`[data-sender='${sender}']`);
        if (existing) {
            return existing;
        }
        const template = document.getElementById('cursor');
        const cursor = template.content.firstElementChild.cloneNode(true);
        const svgPath = cursor.getElementsByTagName('path')[0];    
            
        cursor.setAttribute("data-sender", sender);
        svgPath.setAttribute('fill', `hsl(${messageBody.color}, 50%, 50%)`);    
        document.body.appendChild(cursor);

        return cursor;
    }

    document.body.onclick = (evt) => {
        const inputX = evt.clientX;
        const inputY = evt.clientY;
        if (document.getElementById("inputField") != null) {
            document.getElementById("inputField").remove();
        }  
        createClientInputField(inputX,inputY);
        // const messageBody = { x: evt.clientX, y: evt.clientY, mouseClick : true };
    }

    function receiveMessage(messageBody){
        var message = document.createElement("p");
        message.innerText = messageBody.messageInput;
        message.style.position = "absolute";
        message.style.top =  messageBody.messageY;
        message.style.left =  messageBody.messageX;
        message.style.fontSize = "32px";
        message.style.fontFamily = "monospace";
        message.style.color = `hsl(${messageBody.color},50%,50%)`;
        // message.style.color = `hsl(${messageBody.color}, 50%, 50%)`;
        document.body.appendChild(message);
        // inputField = document.getElementById("inputField");
        // inputField.remove();
        return message;  
    }

    function sendMessage(inputField) {
        var message = document.createElement("p");
        message.innerText = inputField.value;
        message.style.position = "absolute";
        message.style.top = inputField.style.top;
        message.style.left = inputField.style.left;
        document.getElementById("inputField").remove();

        // return message;  
        const messageBody = { messageX: message.style.left, messageY: message.style.top, messageInput: message.innerText };
        ws.send(JSON.stringify(messageBody));
    }

    function createClientInputField(x,y){
        var inputField = document.createElement("input");
        inputField.type = "text";
        inputField.id = "inputField";
        inputField.style.fontSize = "32px";
        inputField.style.position = "absolute";
        inputField.style.fontFamily = "monospace";
        inputField.style.top = `${y}px`;
        inputField.style.left = `${x}px`;

        document.body.appendChild(inputField);
        document.getElementById("inputField").focus(); 
        inputField.addEventListener("keypress", function(event) {
            // If the user presses the "Enter" key on the keyboard
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Trigger the button element with a click
              sendMessage(inputField, inputField.value);
            }
        }); 
    }

})();
