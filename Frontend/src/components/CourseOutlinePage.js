import React, { useState, useEffect } from 'react';
import spinner from './spinner.gif'; // Make sure the path is correct

const CourseOutlinePage = ({ prompt, navigateTo, setChapters }) => {
    const [outline, setOutline] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchOutline = async () => {
            setIsLoading(true);
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
                // Ensure that data is in the correct format
                if (typeof data === 'object' && data !== null) {
                    for (const [chapterName, subchapters] of Object.entries(data)) {
                        if (!Array.isArray(subchapters)) {
                            throw new Error(`Subchapters for ${chapterName} are not in a list format`);
                        }
                    }
                    setOutline(data);
                    setChapters(data); // Set the chapters state in the parent component
                } else {
                    throw new Error('Invalid data format');
                }
                setIsLoading(false);
                console.log("Fetched Outline:", data); // Debug output
            } catch (error) {
                console.error('There was an error fetching the outline:', error);
                setIsLoading(false);
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
            {isLoading ? (
                <div className="loading">
                    <img src={spinner} alt="Loading..." />
                </div>
            ) : outline ? (
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
