import os
from pytube import YouTube
from pydub import AudioSegment

def download_audio_from_youtube(youtube_url, download_path='downloads'):
    """
    Downloads the audio from a YouTube video and saves it as an MP4 file.

    Args:
        youtube_url (str): The URL of the YouTube video.
        download_path (str): The directory where the audio file will be saved.

    Returns:
        str: The file path of the downloaded audio file.
    """
    # Ensure the download directory exists
    if not os.path.exists(download_path):
        os.makedirs(download_path)

    # Create a YouTube object
    yt = YouTube(youtube_url)

    # Get the audio stream with the highest bitrate
    audio_stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()

    # Download the audio file
    audio_file_path = audio_stream.download(output_path=download_path, filename_prefix='audio_')

    return audio_file_path

def convert_mp4_to_wav(mp4_file_path, wav_file_path):
    """
    Converts an MP4 audio file to a WAV file.

    Args:
        mp4_file_path (str): The file path of the MP4 audio file.
        wav_file_path (str): The file path where the WAV file will be saved.
    """
    # Load the MP4 file
    audio = AudioSegment.from_file(mp4_file_path, format="mp4")

    # Export the audio as a WAV file
    audio.export(wav_file_path, format="wav")

def youtube_to_wav(youtube_url, download_path='downloads'):
    """
    Downloads audio from a YouTube video and converts it to a WAV file.

    Args:
        youtube_url (str): The URL of the YouTube video.
        download_path (str): The directory where the audio file will be saved.

    Returns:
        str: The file path of the converted WAV file.
    """
    # Download the audio from YouTube
    mp4_file_path = download_audio_from_youtube(youtube_url, download_path)

    # Define the WAV file path
    wav_file_path = os.path.splitext(mp4_file_path)[0] + '.wav'

    # Convert the MP4 file to WAV
    convert_mp4_to_wav(mp4_file_path, wav_file_path)

    return wav_file_path

if __name__ == "__main__":
    # Example usage
    youtube_url = 'https://www.youtube.com/watch?v=example_video_id'
    wav_file_path = youtube_to_wav(youtube_url)
    print(f'WAV file saved at: {wav_file_path}')
