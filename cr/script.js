function setUsername() {
    var username = document.getElementById('usernameInput').value;
    if (username.trim() !== '') {
        // Send username to server (PHP script)
        var formData = new FormData();
        formData.append('username', username);

        fetch('chatroom.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                window.location.replace('chatroom.html');
            } else {
                alert('Failed to set username');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to set username');
        });
    } else {
        alert('Please enter a valid username');
    }
}

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
