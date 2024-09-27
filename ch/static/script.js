
const socket = io();
const chatMessages = document.getElementById('chat-messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('message', (data) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${data.username}: ${data.message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (username && message) {
        socket.emit('message', { username, message });
        messageInput.value = '';
    }
}

// Load previous messages
fetch('/get_messages')
    .then(response => response.json())
    .then(messages => {
        messages.forEach(data => {
            const messageElement = document.createElement('p');
            messageElement.textContent = `${data.username}: ${data.message}`;
            chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
