function sendMessage() {
    var message = document.getElementById('messageInput').value;
    var sender = "<?php echo $_SESSION['username']; ?>"; // Get current user's username
    appendMessage(sender, message);
    document.getElementById('messageInput').value = '';
}

function appendMessage(sender, message) {
    var chatbox = document.getElementById('chatbox');
    var messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    var senderElement = document.createElement('span');
    senderElement.classList.add('message-sender');
    senderElement.innerText = sender + ": ";

    var messageElement = document.createElement('span');
    messageElement.classList.add('message-text');
    messageElement.innerText = message;

    messageContainer.appendChild(senderElement);
    messageContainer.appendChild(messageElement);

    chatbox.appendChild(messageContainer);
}
