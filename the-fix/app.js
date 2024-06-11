function encryptData(data) {
    // Simple base64 encoding as a placeholder for encryption
    return btoa(data);
}

function decryptData(data) {
    // Simple base64 decoding as a placeholder for decryption
    return atob(data);
}

function openUrl() {
    const url = prompt("Enter the URL to embed:");
    if (url) {
        const encryptedUrl = encryptData(url);
        const iframe = document.getElementById('embeddedFrame');
        iframe.src = `iframe.html?data=${encryptedUrl}`;
    }
}
