import React, { useState } from 'react';

const AITeacherInputPage = ({ navigateTo, setPrompt }) => {
    const [input, setInput] = useState("");

    const handleSubmit = () => {
        setPrompt(input);
        navigateTo("courseOutline");
    };

    return (
        <div className="ai-teacher-input-page">
            <h1>What do you want to learn?</h1>
            <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Describe what you want to learn..." 
                rows="5"
                style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
            <button onClick={handleSubmit}>Start AI Teacher Course</button>
        </div>
    );
};

export default AITeacherInputPage;
