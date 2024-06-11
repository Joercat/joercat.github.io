function decryptData(data) {
    // Simple base64 decoding as a placeholder for decryption
    return atob(data);
}

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const encryptedData = params.get('data');
    if (encryptedData) {
        const decryptedUrl = decryptData(encryptedData);
        const contentFrame = document.getElementById('contentFrame');
        contentFrame.src = decryptedUrl;
    }
});
