        class SimpleComputer {
            constructor() {
                this.memory = {};
            }

            add(a, b) {
                return a + b;
            }

            subtract(a, b) {
                return a - b;
            }

            multiply(a, b) {
                return a * b;
            }

            divide(a, b) {
                if (b === 0) {
                    throw new Error("Division by zero");
                }
                return a / b;
            }

            setMemory(key, value) {
                this.memory[key] = value;
            }

            getMemory(key) {
                return this.memory[key] || "Not found";
            }
        }

        const computer = new SimpleComputer();

        function compute(operation) {
            const num1 = parseFloat(document.getElementById("num1").value);
            const num2 = parseFloat(document.getElementById("num2").value);
            let result;

            try {
                switch (operation) {
                    case 'add':
                        result = computer.add(num1, num2);
                        break;
                    case 'subtract':
                        result = computer.subtract(num1, num2);
                        break;
                    case 'multiply':
                        result = computer.multiply(num1, num2);
                        break;
                    case 'divide':
                        result = computer.divide(num1, num2);
                        break;
                }
                displayOutput('calculator', `Result: ${result}`);
            } catch (error) {
                displayOutput('calculator', `Error: ${error.message}`);
            }
        }

        function setMemory() {
            const key = document.getElementById("memoryKey").value;
            const value = parseFloat(document.getElementById("memoryValue").value);
            computer.setMemory(key, value);
            displayOutput('memory', `Stored ${value} in memory at key "${key}"`);
        }

        function getMemory() {
            const key = document.getElementById("memoryKey").value;
            const value = computer.getMemory(key);
            displayOutput('memory', `Value at key "${key}": ${value}`);
        }

        function displayOutput(appName, message) {
            const outputBar = document.getElementById(`${appName}-output`);
            outputBar.innerHTML += `<div>${message}</div>`;
            outputBar.scrollTop = outputBar.scrollHeight;
        }

        function showApp(appName) {
            const app = document.getElementById(appName);
            const loadingScreen = document.createElement('div');
            loadingScreen.className = 'app-loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
            `;
            app.appendChild(loadingScreen);

            setTimeout(() => {
                const progress = loadingScreen.querySelector('.loading-progress');
                progress.style.width = '100%';
            }, 50);

            setTimeout(() => {
                document.querySelectorAll('.app').forEach(a => {
                    a.style.display = 'none';
                });
                app.style.display = 'block';
                loadingScreen.remove();
                if (appName === 'internet') {
                    switchIframe('google');
                }
            }, 900);
        }

        function closeApp(appName) {
            document.getElementById(appName).style.display = 'none';
        }

        function switchIframe(frame) {
            document.getElementById('google-frame').classList.remove('active');
            document.getElementById('cybertoilet-frame').classList.remove('active');
            document.getElementById(`${frame}-frame`).classList.add('active');
            displayOutput('internet', `Switched to ${frame === 'google' ? 'Google' : 'Cyber Toilet'}`);
        }

        function openUnblockedCat() {
            const frame = document.getElementById('game-frame');
            frame.src = 'https://joercat.github.io';
            displayOutput('games', 'Loading Unblocked Cat');
        }

        // Loading screen
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.getElementById('loading-screen').style.display = 'none';
            }, 8000);
        });
