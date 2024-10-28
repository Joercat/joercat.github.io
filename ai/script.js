const API_KEY = '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';
let currentModel = 'code';

function switchModel(model) {
    currentModel = model;
    document.getElementById('codeBtn').classList.toggle('active', model === 'code');
    document.getElementById('chatBtn').classList.toggle('active', model === 'chat');
    document.getElementById('prompt').placeholder = model === 'code' ? 
        'Ask your coding question...' : 'Ask anything...';
}

function formatCodeResponse(text) {
    const languages = ['javascript', 'python', 'php', 'css', 'html'];
    let formattedText = text;

    languages.forEach(lang => {
        const regex = new RegExp(`\`\`\`${lang}\\s*([\\s\\S]*?)\`\`\``, 'g');
        formattedText = formattedText.replace(regex, (match, code) => {
            return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
        });
    });

    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    return formattedText;
}

function typeText(element, text) {
    let index = 0;
    element.classList.add('typing-effect');
    
    function type() {
        if (index < text.length) {
            element.innerHTML = formatCodeResponse(text.substring(0, index + 1));
            Prism.highlightAllUnder(element);
            index++;
            setTimeout(type, 20);
        } else {
            element.classList.remove('typing-effect');
        }
    }
    type();
}

function addMessage(content, isUser = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (isUser) {
        messageDiv.textContent = content;
    } else {
        typeText(messageDiv, content);
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function cleanAIResponse(response) {
    if (Array.isArray(response)) {
        response = response[0].generated_text;
    }
    
    let cleaned = response
        .replace(/(:param|:type|:returns|:rtype|:raises).*$/gm, '')
        .replace(/""".*?"""/gs, '')
        .replace(/^[^a-zA-Z<]*/, '')
        .trim();

    try {
        const parsed = JSON.parse(cleaned);
        if (parsed.generated_text) {
            cleaned = parsed.generated_text;
        }
    } catch (e) {}

    return cleaned;
}

async function getResponse() {
    const prompt = document.getElementById('prompt');
    const userQuestion = prompt.value.trim();
    
    if (!userQuestion) return;

    addMessage(userQuestion, true);
    prompt.value = '';

    try {
        const modelEndpoint = currentModel === 'code' 
            ? 'https://api-inference.huggingface.co/models/bigcode/santacoder'
            : 'https://api-inference.huggingface.co/models/google/flan-t5-small';

        const response = await fetch(modelEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: userQuestion,
                parameters: {
                    max_length: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });
        
        const data = await response.json();
        let aiResponse = currentModel === 'code' ? cleanAIResponse(data) : 
            (Array.isArray(data) ? data[0].generated_text : data.generated_text);
        
        addMessage(aiResponse);
    } catch (error) {
        addMessage(`Error: ${error.message}`);
    }
}

document.getElementById('prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        getResponse();
    }
});
