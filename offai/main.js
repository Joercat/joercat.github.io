const status = document.getElementById('status');
const log = document.getElementById('log');

// Create the worker from a real file, not a blob
const worker = new Worker('worker.js', { type: 'module' });

worker.onmessage = (e) => {
    if (e.data.status === 'ready') {
        status.innerText = "READY";
    } else if (e.data.status === 'progress') {
        status.innerText = `Loading: ${Math.round(e.data.progress)}%`;
    } else if (e.data.answer) {
        log.innerText += "\nAI: " + e.data.answer;
    }
};

worker.onerror = (err) => {
    console.error("Worker Error:", err);
    log.innerText += "\nERROR: Check Console";
};

// Start the download
worker.postMessage({ init: true });
