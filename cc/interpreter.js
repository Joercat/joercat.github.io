/**
 * Chati Language Interpreter
 * This JavaScript code simulates a basic interpreter for a fictional chat-based programming language named "Chati".
 * It supports commands for sending messages, changing user status, and listing users.
 */

class ChatiInterpreter {
    constructor() {
        this.users = new Map();
        this.currentUser = null;
    }

    /**
     * Executes a Chati command.
     * @param {string} command - The command string to be executed.
     */
    execute(command) {
        const parts = command.split(' ');
        const cmd = parts[0];

        switch (cmd.toLowerCase()) {
            case 'login':
                this.login(parts[1]);
                break;
            case 'logout':
                this.logout();
                break;
            case 'msg':
                this.sendMessage(parts.slice(1).join(' '));
                break;
            case 'list':
                this.listUsers();
                break;
            default:
                console.log(`Unknown command: ${cmd}`);
        }
    }

    /**
     * Logs in a user.
     * @param {string} username - The username of the user to log in.
     */
    login(username) {
        if (!this.users.has(username)) {
            this.users.set(username, { online: true });
            console.log(`${username} logged in successfully.`);
        } else {
            console.log(`${username} is already logged in.`);
        }
        this.currentUser = username;
    }

    /**
     * Logs out the current user.
     */
    logout() {
        if (this.currentUser) {
            console.log(`${this.currentUser} logged out.`);
            this.currentUser = null;
        } else {
            console.log(`No user is currently logged in.`);
        }
    }

    /**
     * Sends a message from the current user.
     * @param {string} message - The message to send.
     */
    sendMessage(message) {
        if (this.currentUser) {
            console.log(`${this.currentUser}: ${message}`);
        } else {
            console.log(`Please log in to send messages.`);
        }
    }

    /**
     * Lists all users.
     */
    listUsers() {
        console.log('Users:');
        this.users.forEach((value, key) => {
            console.log(`${key}: ${value.online ? 'Online' : 'Offline'}`);
        });
    }
}

// Example usage:
const chati = new ChatiInterpreter();
chati.execute('login Alice');
chati.execute('msg Hello, this is Alice!');
chati.execute('login Bob');
chati.execute('msg Hi Alice, this is Bob.');
chati.execute('list');
chati.execute('logout');
chati.execute('msg This should not work.');
