document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('embeddedFrame');
    const urlToEmbed = 'https://example.com'; // Replace with the URL you want to embed

    // Encrypt URL using Base32
    const encodedUrl = base32.encode(new TextEncoder().encode(urlToEmbed));
    const decodedUrl = new TextDecoder().decode(base32.decode(encodedUrl));

    // Set iframe source to the decoded URL
    iframe.src = decodedUrl;

    // Create a dedicated worker with encrypted content
    const workerScript = `
        self.onmessage = function(event) {
            const decodedMessage = new TextDecoder().decode(base32.decode(event.data));
            console.log('Worker received message:', decodedMessage);
        };
    `;

    const encodedWorkerScript = base32.encode(new TextEncoder().encode(workerScript));

    const blob = new Blob([new TextDecoder().decode(base32.decode(encodedWorkerScript))], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    // Sending an encrypted message to the worker
    const message = 'Hello, Worker!';
    const encodedMessage = base32.encode(new TextEncoder().encode(message));
    worker.postMessage(encodedMessage);
});
