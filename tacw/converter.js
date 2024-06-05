document.getElementById('convertForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var youtubeUrl = document.getElementById('youtubeUrl').value;
    var resultsDiv = document.getElementById('result');
   
    fetch('https://www.convertmp3.io/download/?video=' + youtubeUrl)
        .then(response => response.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'audio.wav';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            resultsDiv.innerText = 'Downloaded successfully!';
        })
        .catch(error => {
            resultsDiv.innerText = 'Error downloading the video. Please try again later.';
        });
});
