from flask import Flask, request, send_file, render_template
from pydub import AudioSegment
import os

app = Flask(__name__)

# Ensure the upload folder exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    """
    Render the main page with the upload form.
    """
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_audio():
    """
    Handle the audio file upload and conversion.
    """
    if 'audioFile' not in request.files:
        return "No file part", 400

    file = request.files['audioFile']
    if file.filename == '':
        return "No selected file", 400

    format = request.form['format']
    if format not in ['mp3', 'wav', 'ogg']:
        return "Invalid format", 400

    # Save the uploaded file
    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(input_path)

    # Convert the audio file
    audio = AudioSegment.from_file(input_path)
    output_path = os.path.join(UPLOAD_FOLDER, f"converted.{format}")
    audio.export(output_path, format=format)

    # Send the converted file back to the user
    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
