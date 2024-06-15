import React, { useState, useEffect } from 'react';
import './ExamPage.css';

const ExamPage = ({ chapterName, subchapterName, prompt, navigateTo }) => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

    useEffect(() => {
        const fetchExamQuestions = async () => {
            try {
                const response = await fetch('http://localhost:5000/generate-exam', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ chapter_name: chapterName, subchapter_name: subchapterName, prompt })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Fetched Exam Questions:", data); // Debug output
                setQuestions(data);
            } catch (error) {
                console.error('There was an error fetching the exam questions:', error);
            }
        };

        fetchExamQuestions();
    }, [chapterName, subchapterName, prompt]);

    const handleAnswerChange = (question, answer) => {
        setUserAnswers(prev => ({ ...prev, [question]: answer }));
    };

    const handleSubmitExam = async () => {
        try {
            const response = await fetch('http://localhost:5000/evaluate-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ questions, answers: userAnswers })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResults(data);
            console.log("Exam Results:", data); // Debug output
        } catch (error) {
            console.error('There was an error submitting the exam:', error);
        }
    };

    const getGrade = (score) => {
        if (score >= 4.5) return "Excellent Understanding";
        if (score >= 3.5) return "Good Understanding";
        if (score >= 2.5) return "Fair Understanding";
        if (score >= 1.5) return "Poor Understanding";
        return "Bad Understanding";
    };

    const renderQuestion = (q, index) => {
        if (q.type === 'selection') {
            return (
                <div key={index} className="question">
                    <p>Problem {index + 1}: {q.question}</p>
                    <div className="options">
                        {q.options.map((option, i) => (
                            <label key={i} className="option">
                                {option}
                                <input
                                    type="radio"
                                    name={q.question}
                                    value={option}
                                    checked={userAnswers[q.question] === option}
                                    onChange={() => handleAnswerChange(q.question, option)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            );
        } else if (q.type === 'fill-in-the-blank') {
            const parts = q.question.split('__blank__');
            return (
                <div key={index} className="question">
                    <p>Problem {index + 1}: 
                        {parts[0]}
                        <input
                            type="text"
                            className="fill-blank"
                            name={q.question}
                            value={userAnswers[q.question] || ''}
                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                        />
                        {parts[1]}
                    </p>
                </div>
            );
        } else if (q.type === 'entry') {
            return (
                <div key={index} className="question">
                    <p>Problem {index + 1}: {q.question}</p>
                    <textarea
                        name={q.question}
                        value={userAnswers[q.question] || ''}
                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                        className="entry-textarea"
                    />
                </div>
            );
        }
    };

    return (
        <div className="exam-page">
            <h1>Exam for {chapterName} - {subchapterName}</h1>
            {questions.length > 0 ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitExam(); }}>
                    {questions.map((q, index) => renderQuestion(q, index))}
                    <button type="submit" className="submit-button">Submit Exam</button>
                </form>
            ) : (
                <p>Loading exam questions...</p>
            )}
            {results && (
                <div className="results">
                    <h2>Results</h2>
                    <p>Score: {results.score}</p>
                    <p>Grade: {getGrade(results.score)}</p>
                    {questions.map((q, index) => (
                        <div key={index} className={results.results[q.question] ? 'correct' : 'incorrect'}>
                            <p>Problem {index + 1}: {q.question} - {results.results[q.question] ? 'Correct' : 'Incorrect'}</p>
                            {showCorrectAnswers && !results.results[q.question] && (
                                <p className="correct-answer">Correct answer: {q.correct_answer}</p>
                            )}
                            {showCorrectAnswers && results.explanations && (
                                <p className="explanation">Explanation: {results.explanations[q.question]}</p>
                            )}
                        </div>
                    ))}
                    <button onClick={() => setShowCorrectAnswers(true)} className="show-answers-button">Show Correct Answers</button>
                </div>
            )}
            <button onClick={() => navigateTo("courseContent")}>Back to Course</button>
        </div>
    );
};

export default ExamPage;
