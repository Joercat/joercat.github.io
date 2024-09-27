from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

messages = []

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('message')
def handle_message(data):
    messages.append(data)
    emit('message', data, broadcast=True)

@app.route('/get_messages')
def get_messages():
    return jsonify(messages)

if __name__ == '__main__':
    socketio.run(app, debug=True)
