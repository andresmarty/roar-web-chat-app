document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

    document.querySelector('#buttonChannel').disabled = true
    document.querySelector('#buttonMessage').disabled = true

    // should emit a "submit channel" event
    document.querySelector('#buttonChannel').onclick = () => {        
        const channel = document.getElementById('inputChannel').value;
        socket.emit('submit channel', {'channel': channel});
        };
    });

    document.querySelector('#inputChannel').onkeyup = () => {
        if (document.querySelector('#inputChannel').value.length > 0)
            document.querySelector('#buttonChannel').disabled = false;
        else
            document.querySelector('#buttonChannel').disabled = true;
    };

    document.querySelector('#inputMessage').onkeyup = () => {
        if (document.querySelector('#inputMessage').value.length > 0)
            document.querySelector('#buttonMessage').disabled = false;
        else
            document.querySelector('#buttonMessage').disabled = true;
    };

    function createMessage(message, user, time) {
        const horaHTML = document.createElement('p');
        now = new Date (time);
        horaHTML.setAttribute("class", "hora");
        horaHTML.innerHTML = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        const userHTML = document.createElement('p');
        userHTML.setAttribute("class", "user")
        userHTML.innerHTML = `${user}`+ ":";

        const messageHTML = document.createElement('p');
        messageHTML.setAttribute("class", "chat1")
        messageHTML.innerHTML = `${message}`;

        const div = document.createElement('div');
        div.append(userHTML);
        div.append(horaHTML);
        div.append(messageHTML);

        const li = document.createElement('li');
        document.querySelector('#messages').append(div);
    }

    function toggle(event) {
        console.log(event.srcElement["id"])
        const foto = document.getElementById('fotoPrincipal');
        foto.setAttribute("class", "hide");

        const chat = document.getElementById('chatRoom');
        chat.classList.remove("hide");
        chat.setAttribute("class", "container-chat")

        actualChannel = document.querySelector('#header').innerHTML

        const newChannel = event.srcElement["id"]
        document.querySelector("#header").innerHTML = newChannel

        if (newChannel != actualChannel) {
            socket.emit('join', {'channel':newChannel})
            socket.emit('leave', {'channel':actualChannel})

            var ul = document.getElementById("messages");
                while(ul.firstChild) ul.removeChild(ul.firstChild);
        }else{
            var ul = document.getElementById("messages");
            while(ul.firstChild) ul.removeChild(ul.firstChild);
        }
        //ajax request when clicking the channel
        const request = new XMLHttpRequest();
        request.open('GET', `/channel/${newChannel}`);

        request.onload = () => {
            const data = JSON.parse(request.responseText);

            if (data) {
                data.channel.messages.forEach((message)=>createMessage(message.message, message.user, message.time))
            }
        }

        request.send()
        //Traer mensajes del servidor guardados.
    };

    // When a new channel is announced, add to the unordered list
    socket.on('announce channel', data => {
        const a = document.createElement('button');
        a.setAttribute("class", "linkChannel btn btn-link");
        a.innerHTML = `${data.channel}`;
        a.id = a.innerHTML
        
        const div = document.createElement('div');
        div.setAttribute("class", "container-channel");
        div.setAttribute("id", "nav")
        div.appendChild(a);
        document.querySelector('#channel').append(div);

        a.onclick = toggle;
    });

    document.querySelectorAll('.linkChannel').forEach(linkChannel => {
        linkChannel.onclick =  toggle;
    });

    // should emit a "submit message" event
    document.querySelector('#buttonMessage').onclick = () => {
        const message = document.getElementById('inputMessage').value;
        const channel = document.getElementById("header").innerHTML;
        const time = Date.now()
        
        socket.emit('submit message', {'message':message, 'channel': channel, 'time': time});
    };
    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {
        createMessage(data.message, data.user, data.time);
    })
});

