from flask import Flask, render_template, request, jsonify, url_for
import os
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs, ApiError
import logging
from logging.handlers import RotatingFileHandler
import time
import httpx

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static'

ELEVENLABS_API_KEY = "4b282da365b69b5ec3b44c0c9eb22e37"

http_client = httpx.Client(timeout=httpx.Timeout(3600.0, connect=60.0))
client = ElevenLabs(api_key=ELEVENLABS_API_KEY, httpx_client=http_client)

# Set up logging
if not app.debug:
    handler = RotatingFileHandler('error.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.ERROR)
    app.logger.addHandler(handler)

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Server Error: {error}, route: {request.url}")
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(Exception)
def unhandled_exception(e):
    app.logger.error(f"Unhandled Exception: {e}, route: {request.url}")
    return jsonify({"error": "Unhandled exception"}), 500

def text_to_speech_file(text: str, voice_id: str, file_path: str) -> str:
    max_chars = 2500  # Assuming the API limit is 5000 characters; adjust if needed
    chunks = [text[i:i + max_chars] for i in range(0, len(text), max_chars)]
    with open(file_path, "wb") as f:
        for chunk in chunks:
            retry_attempts = 3
            for attempt in range(retry_attempts):
                try:
                    response = client.text_to_speech.convert(
                        voice_id=voice_id,
                        optimize_streaming_latency="0",
                        output_format="mp3_22050_32",
                        text=chunk,
                        model_id="eleven_turbo_v2",
                        voice_settings=VoiceSettings(
                            stability=0.0,
                            similarity_boost=1.0,
                            style=0.0,
                            use_speaker_boost=True,
                        ),
                    )
                    for data_chunk in response:
                        if data_chunk:
                            f.write(data_chunk)
                    break  # Exit the retry loop if successful
                except ApiError as e:
                    app.logger.error(f"API Error: {e.body}, Status Code: {e.status_code}")
                    raise
                except Exception as e:
                    app.logger.error(f"Exception on attempt {attempt + 1} for chunk: {e}")
                    time.sleep(5)  # Wait before retrying
                    if attempt == retry_attempts - 1:
                        raise  # Re-raise the exception after final attempt
    return file_path

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            voice_id = request.form['voice_id']
            text_file = request.files['text_file']

            text = text_file.read().decode('utf-8')
            text_file_name = os.path.splitext(text_file.filename)[0]  # Get the file name without extension
            output_file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"download/{text_file_name}.mp3")

            text_to_speech_file(text, voice_id, output_file_path)

            return jsonify({'filepath': url_for('static', filename=f"download/{text_file_name}.mp3", _external=True)})
        except ApiError as e:
            app.logger.error(f"API Error: {e.body}, Status Code: {e.status_code}")
            return jsonify({"error": "API Error"}), 500
        except Exception as e:
            app.logger.error(f"Unhandled Exception: {e}, route: {request.url}")
            return jsonify({"error": "Unhandled Exception"}), 500

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
