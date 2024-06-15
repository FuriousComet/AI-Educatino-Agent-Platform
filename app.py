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

OPENAI_API_KEY = config.OPENAI_KEY

# Proxy settings
proxies = {
    "http": "http://14a2a8e06348d:1842948cf0@161.77.82.100:12323",
    "https": "http://14a2a8e06348d:1842948cf0@161.77.82.100:12323",
}


def send_request_with_proxy(endpoint, headers, payload):
    for _ in range(5):  # Retry up to 5 times
        try:
            response = requests.post(endpoint, headers=headers, json=payload, proxies=proxies, stream=True)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ProxyError as e:
            print("Proxy Error. Retrying in 5 seconds...", e)
            time.sleep(5)
        except requests.exceptions.RequestException as e:
            print("Request Error:", e)
            break
    raise requests.exceptions.ProxyError("Failed to connect to the proxy after multiple attempts.")

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
        "model": "gpt-4o",
        "messages": request_payload,
        "max_tokens": 4000
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request_with_proxy(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Chapters Response:", gpt_response)  # Debug response
    return jsonify(gpt_response)

@app.route('/generate-content', methods=['POST'])
def generate_content():
    data = request.json
    chapter_name = data['chapter_name']
    subchapter_name = data['subchapter_name']
    prompt = data['prompt']
    prompt_message = f"Generate the content for a subchapter in a course. The chapter title is {chapter_name}. The title of the subchapter is {subchapter_name}. The course is about {prompt}. Please only include the requested data. Format the content in HTML."
    request_payload = [
        {"role": "system", "content": prompt_message},
        {"role": "user", "content": "Do not include the chapter title, the subchapter title, or the course title in the data, only the chapter content."},
    ]
    payload = {
        "model": "gpt-4o",
        "messages": request_payload,
        "max_tokens": 4000
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    endpoint = "https://api.openai.com/v1/chat/completions"
    response = send_request_with_proxy(endpoint, headers, payload)
    gpt_response = response['choices'][0]['message']['content']
    print("Content Response:", gpt_response)  # Debug response
    return jsonify(gpt_response)

@app.route('/generate-exam', methods=['POST'])
def generate_exam():
    data = request.json
    chapter_name = data['chapter_name']
    subchapter_name = data['subchapter_name']
    prompt = data['prompt']
    
    prompt_message = f"""
    Generate an exam for the subchapter '{subchapter_name}' in the chapter '{chapter_name}' of the course on '{prompt}'. 
    Include three types of questions:
    1. Selection problems (multiple-choice) - 3 questions
    2. Fill-in-the-blank problems - 3 questions
    3. Entry problems (short answer) - 3 questions

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
    response = send_request_with_proxy(endpoint, headers, payload)
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
        response = send_request_with_proxy(endpoint, headers, payload)
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