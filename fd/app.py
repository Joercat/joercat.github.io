from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__)

# Function to remove extensions from filenames
def remove_extension(file_path):
    base = os.path.splitext(file_path)[0]
    return base

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/remove_extension', methods=['POST'])
def remove_extension_route():
    data = request.json
    file_path = data.get('file_path')
    
    if not file_path:
        return jsonify({'error': 'File path is required'}), 400

    new_file_path = remove_extension(file_path)
    return jsonify({'new_file_path': new_file_path})

if __name__ == '__main__':
    app.run(debug=True)
