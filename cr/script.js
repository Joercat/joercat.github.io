function sendMessage() {
    var message = document.getElementById('messageInput').value;
    // You would typically send this message to a server for broadcasting to other users
    appendMessage(message);
    document.getElementById('messageInput').value = '';
}

function appendMessage(message) {
    var chatbox = document.getElementById('chatbox');
    var messageElement = document.createElement('div');
    messageElement.innerText = message;
    chatbox.appendChild(messageElement);
}
