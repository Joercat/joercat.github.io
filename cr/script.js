var name = '';

function sendMessage() {
    var message = document.getElementById('messageInput').value;
    if (message.trim() === '') {
        alert('Please enter a message.');
        return;
    }

    if (!name) {
        name = document.getElementById('nameInput').value.trim();
        if (name === '') {
            alert('Please enter your name.');
            return;
        }
    }

    var messageData = {
        name: name,
        message: message
    };

    // Simulate sending message to server (in real application, this would be done via AJAX or WebSocket)
    appendMessage(messageData);

    // Clear message input
    document.getElementById('messageInput').value = '';
}

function appendMessage(messageData) {
    var chatbox = document.getElementById('chatbox');
    var messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${messageData.name}:</strong> ${messageData.message}`;
    chatbox.appendChild(messageElement);

    // Scroll to bottom of chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
}
