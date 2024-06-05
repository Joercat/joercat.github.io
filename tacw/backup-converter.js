/**
 * Handles the form submission to convert YouTube URL to WAV on the server side.
 * @param {Event} event - The form submission event.
 */
document.getElementById('convertForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const youtubeUrl = document.getElementById('youtubeUrl').value;
    const resultDiv = document.getElementById('result');
    
    // Clear previous result
    resultDiv.innerHTML = '';

    // Validate YouTube URL
    if (!isValidYouTubeUrl(youtubeUrl)) {
        resultDiv.innerHTML = '<p style="color: red;">Invalid YouTube URL. Please use another link.</p>';
        return;
    }

    // Send YouTube URL to server for conversion
    fetch('/convert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ youtubeUrl: youtubeUrl })
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.innerHTML = `<p>${data.message}</p>`;
    })
    .catch(error => {
        resultDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again with another URL.</p>';
    });
});

/**
 * Validates the YouTube URL.
 * @param {string} url - The YouTube URL to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
function isValidYouTubeUrl(url) {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
}
