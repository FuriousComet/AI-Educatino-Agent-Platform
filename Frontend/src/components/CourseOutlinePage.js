import React, { useState, useEffect } from 'react';

const CourseOutlinePage = ({ prompt, navigateTo, setChapters }) => {
    const [outline, setOutline] = useState(null);

    useEffect(() => {
        const fetchOutline = async () => {
            try {
                const response = await fetch('http://localhost:5000/generate-chapters', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const parsedOutline = JSON.parse(data);
                setOutline(parsedOutline);
                setChapters(parsedOutline); // Set the chapters state in the parent component
                console.log("Fetched Outline:", parsedOutline); // Debug output
            } catch (error) {
                console.error('There was an error fetching the outline:', error);
            }
        };
        fetchOutline();
    }, [prompt, setChapters]);

    const handleNext = () => {
        navigateTo("finalView");
    };

    return (
        <div className="course-outline-page">
            <h1>Course Outline for "{prompt}"</h1>
            {outline ? (
                <div>
                    {Object.entries(outline).map(([chapterName, subchapters], chapterIndex) => (
                        <div key={chapterIndex} className="chapter">
                            <h2>{chapterName}</h2>
                            <ul>
                                {subchapters.map((subchapter, subchapterIndex) => (
                                    <li key={subchapterIndex}>Course {subchapterIndex + 1}: {subchapter}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <button onClick={handleNext}>View Final Course</button>
        </div>
    );
};

export default CourseOutlinePage;
