import os
import requests
import config
import json
import time
import openai
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

openai.api_key = config.OPENAI_KEY
serpapi_api_key = config.SERPAPI_KEY

def send_request(endpoint, headers, payload):
    for _ in range(5):  # Retry up to 5 times
        try:
            response = requests.post(endpoint, headers=headers, json=payload, stream=True)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print("Request Error:", e)
            time.sleep(5)
    raise requests.exceptions.RequestException("Failed to connect after multiple attempts.")

def search_image(query):
    params = {
        "engine": "google",
        "q": query,
        "tbm": "isch",
        "api_key": serpapi_api_key
    }
    response = requests.get("https://serpapi.com/search", params=params)
    if response.status_code == 200:
        images = response.json().get('images_results', [])
        if images:
            return images[0]['original']
    return None

@app.route('/generate-chapters', methods=['POST'])
def generate_chapters():
    data = request.json
    prompt = data['prompt']
    prompt_message = f"Generate a list of chapters and subchapters for a course on {prompt} in JSON format. Do not include any explanation or code formatting. Format it in this way: {{'chapter_name': ['subchapters']}}. Please include between 5 and 10 subchapters per chapter. Use this format exactly."
    request_payload = [
        {"role": "system", "content": prompt_message},
        {"role": "user", "content": "generate with 4 space indents"},
    ]
    payload = {
        "model": "gpt-4",
        "messages": request_payload,
        "max_tokens": 4000
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Chapters Response:", gpt_response)  # Debug response
    
    try:
        json_response = json.loads(gpt_response)
        # Ensure that the response is in the correct format
        if isinstance(json_response, dict):
            for chapter, subchapters in json_response.items():
                if not isinstance(subchapters, list):
                    raise ValueError(f"Subchapters for {chapter} are not in a list format")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Failed to decode JSON response: {e}")
        return jsonify({"error": "Failed to decode JSON response from OpenAI"}), 500

    return jsonify(json_response)

@app.route('/generate-content', methods=['POST'])
def generate_content():
    data = request.json
    chapter_name = data['chapter_name']
    subchapter_name = data['subchapter_name']
    prompt = data['prompt']
    prompt_message = f"Generate the content for a subchapter in a course. The chapter title is {chapter_name}. The title of the subchapter is {subchapter_name}. The course is about {prompt}. Please only include the requested data. Format the content in HTML. Additionally, include suggestions for images where appropriate by wrapping the suggestions in [IMAGE: ...]."
    request_payload = [
        {"role": "system", "content": prompt_message},
        {"role": "user", "content": "Do not include the chapter title, the subchapter title, or the course title in the data, only the chapter content."},
    ]
    payload = {
        "model": "gpt-4",
        "messages": request_payload,
        "max_tokens": 4000
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Content Response:", gpt_response)  # Debug response

    # Process the content to generate images where needed
    content_parts = gpt_response.split('[IMAGE:')
    final_content = content_parts[0]
    for part in content_parts[1:]:
        image_prompt, rest_of_content = part.split(']', 1)
        image_url = search_image(image_prompt.strip())
        if image_url:
            final_content += f'<img src="{image_url}" alt="{image_prompt.strip()}"/>' + rest_of_content
        else:
            final_content += f'[IMAGE: {image_prompt.strip()}]' + rest_of_content

    return jsonify(final_content)

@app.route('/dig-deeper', methods=['POST'])
def dig_deeper():
    data = request.json
    chapter_name = data['chapter_name']
    subchapter_name = data['subchapter_name']
    prompt = data['prompt']
    prompt_message = f"""
    Generate a more detailed and comprehensive content for the subchapter '{subchapter_name}' in the chapter '{chapter_name}' of the course on '{prompt}'. 
    Include:
    1. Detailed explanations of key concepts
    2. Examples and case studies
    3. Step-by-step guides
    4. Visual aids such as diagrams or images

    Format the content in HTML and include suggestions for images where appropriate by wrapping the suggestions in [IMAGE: ...].
    """
    request_payload = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt_message},
    ]
    payload = {
        "model": "gpt-4",
        "messages": request_payload,
        "max_tokens": 8000
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Detailed Content Response:", gpt_response)  # Debug response

    # Process the detailed content to generate images where needed
    content_parts = gpt_response.split('[IMAGE:')
    final_content = content_parts[0]
    for part in content_parts[1:]:
        image_prompt, rest_of_content = part.split(']', 1)
        image_url = search_image(image_prompt.strip())
        if image_url:
            final_content += f'<img src="{image_url}" alt="{image_prompt.strip()}"/>' + rest_of_content
        else:
            final_content += f'[IMAGE: {image_prompt.strip()}]' + rest_of_content

    return jsonify(final_content)

@app.route('/generate-exam', methods=['POST'])
def generate_exam():
    data = request.json
    chapter_name = data['chapter_name']
    subchapter_name = data['subchapter_name']
    prompt = data['prompt']
    
    prompt_message = f"""
    Generate an exam for the subchapter '{subchapter_name}' in the chapter '{chapter_name}' of the course on '{prompt}'. 
    Include three types of questions:
    1. Selection problems (multiple-choice) - 5 questions
    2. Fill-in-the-blank problems - 5 questions
    3. Entry problems (short answer) - 5 questions

    Format the response as a JSON array with the following structure:
    [
        {{
            "type": "selection",
            "question": "question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correct_answer": "option1"
        }},
        {{
            "type": "fill-in-the-blank",
            "question": "question text with __blank__",
            "correct_answer": "answer"
        }},
        {{
            "type": "entry",
            "question": "question text",
            "correct_answer": "answer"
        }}
    ]
    """
    
    request_payload = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt_message},
    ]
    
    payload = {
        "model": "gpt-4",
        "messages": request_payload,
        "max_tokens": 2000
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Exam Questions Response:", gpt_response)  # Debug response
    
    try:
        json_response = json.loads(gpt_response)
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON response: {e}")
        return jsonify({"error": "Failed to decode JSON response from OpenAI"}), 500

    return jsonify(json_response)

@app.route('/evaluate-exam', methods=['POST'])
def evaluate_exam():
    data = request.json
    questions = data['questions']
    user_answers = data['answers']

    correct_answers = {q['question']: q['correct_answer'] for q in questions}
    results = {q['question']: (user_answers[q['question']] == q['correct_answer']) for q in questions}
    score = sum(results.values())
    total_questions = len(questions)
    score_5_point = (score / total_questions) * 5

    # Generate explanations for correct answers
    explanations = {}
    for question in questions:
        explanation_prompt = f"Explain the correct answer for the following question:\nQuestion: {question['question']}\nCorrect Answer: {question['correct_answer']}"
        request_payload = [
            {"role": "system", "content": "You are a knowledgeable assistant."},
            {"role": "user", "content": explanation_prompt},
        ]
        payload = {
            "model": "gpt-4",
            "messages": request_payload,
            "max_tokens": 500
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai.api_key}"
        }
        endpoint = "https://api.openai.com/v1/chat/completions"
        response = send_request(endpoint, headers, payload)
        explanation_response = response['choices'][0]['message']['content']
        explanations[question['question']] = explanation_response

    return jsonify({
        'results': results,
        'score': round(score_5_point, 1),
        'total': total_questions,
        'explanations': explanations
    })

if __name__ == '__main__':
    app.run(debug=True)
