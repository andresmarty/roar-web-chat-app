document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

    // should emit a "submit channel" event
    document.querySelector('#buttonChannel').onclick = () => {
        const channel = document.getElementById('inputChannel').value;
        socket.emit('submit channel', {'channel': channel});
        };
    });

    function toggle() {
        const foto = document.getElementById('fotoPrincipal');
        foto.setAttribute("class", "hide");

        const chat = document.getElementById('chatRoom');
        chat.classList.remove("hide");
        chat.setAttribute("class", "container-chat")
    };

    // When a new channel is announced, add to the unordered list
    socket.on('announce channel', data => {
        const a = document.createElement('button');
        a.setAttribute("class", "linkChannel btn btn-link");
        a.innerHTML = `${data.channel}`;
        a.setAttribute = ("id" ,"data.channel");

        const div = document.createElement('div');
        div.setAttribute("class", "container-channel");
        div.setAttribute("id", "nav")
        div.appendChild(a);
        document.querySelector('#channel').append(div);

        a.onclick = toggle; 
    });

    document.querySelectorAll('.linkChannel').forEach(linkChannel => {
        linkChannel.onclick = toggle;
    });

    // should emit a "submit message" event
    document.querySelector('#buttonMessage').onclick = () => {
        const message = document.getElementById('inputMessage').value; 
        socket.emit('submit message', {'message':message, 'channel': channel});
    };
    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {
        const messageChannel = data.channel
        const currentChannel =  document. //buscar el current channel de alguna manera
        const li = document.createElement('li');

        if (messageChannel == currentChannel) {
            li.innerHTML = `${data.message}`;
            document.querySelector('#messages').append(li);
        }
        
    })
});