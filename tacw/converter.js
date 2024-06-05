/**
 * Handles the form submission to convert YouTube URL to WAV.
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

    // Simulate conversion process
    resultDiv.innerHTML = '<p>Converting... please wait</p>';

    // Simulate a delay for conversion
    setTimeout(() => {
        resultDiv.innerHTML = '<p>Conversion complete! <a href="response.json" download>Download WAV</a></p>';
    }, 3000);
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
