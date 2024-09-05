// Connect to the server
const socket = io();

// Function to send a message
function sendMessage() {
    const username = document.getElementById('usernameInput').value;
    const message = document.getElementById('messageInput').value;

    // Emit message to the server
    socket.emit('chat message', { username, message });

    // Clear message input field
    document.getElementById('messageInput').value = '';
}

// Function to append a message to the chatbox
function appendMessage(data) {
    const { username, message } = data;
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatbox.appendChild(messageElement);
}

// Listen for incoming messages from the server
socket.on('chat message', function(data) {
    appendMessage(data);
});
