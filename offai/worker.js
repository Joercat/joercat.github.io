import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

let generator;

self.onmessage = async (e) => {
    if (e.data.init) {
        try {
            generator = await pipeline('text-generation', 'onnx-community/SmolLM-135M-Instruct', {
                dtype: 'q4',
                device: 'webgpu', // Will fallback to wasm automatically
                progress_callback: (p) => {
                    if (p.status === 'progress') {
                        self.postMessage({ status: 'progress', progress: p.progress });
                    }
                }
            });
            self.postMessage({ status: 'ready' });
        } catch (err) {
            console.error(err);
        }
    }
};
