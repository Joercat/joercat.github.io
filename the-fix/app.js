document.addEventListener('DOMContentLoaded', (event) => {
    const iframe = document.getElementById('embeddedFrame');
    const url = 'https://example.com'; // Replace with the desired URL
    const encryptionKey = 'my-secret-key'; // Replace with your encryption key

    // Function to encrypt the URL
    function encryptUrl(url, key) {
        return CryptoJS.AES.encrypt(url, key).toString();
    }

    // Function to decrypt the URL
    function decryptUrl(encryptedUrl, key) {
        const bytes = CryptoJS.AES.decrypt(encryptedUrl, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // Encrypt the URL
    const encryptedUrl = encryptUrl(url, encryptionKey);

    // Create a blob URL for the iframe to decrypt and load the URL
    const blobContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Embedded Frame</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>
        </head>
        <body>
            <script>
                const encryptionKey = '${encryptionKey}';
                const encryptedUrl = '${encryptedUrl}';
                function decryptUrl(encryptedUrl, key) {
                    const bytes = CryptoJS.AES.decrypt(encryptedUrl, key);
                    return bytes.toString(CryptoJS.enc.Utf8);
                }
                const url = decryptUrl(encryptedUrl, encryptionKey);
                window.location.href = url;
            </script>
        </body>
        </html>
    `;
    const blob = new Blob([blobContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    // Set the iframe src to the blob URL
    iframe.src = blobUrl;
});
