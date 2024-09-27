from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

users = {}

@app.route('/')
def index():
    return render_template('chat.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    for user_id, nickname in users.items():
        if request.sid == user_id:
            del users[user_id]
            emit('user_left', {'nickname': nickname}, broadcast=True)
            break

@socketio.on('join')
def handle_join(data):
    users[request.sid] = data['nickname']
    emit('user_joined', {'nickname': data['nickname']}, broadcast=True)

@socketio.on('message')
def handle_message(data):
    emit('message', {'nickname': users[request.sid], 'message': data['message']}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
