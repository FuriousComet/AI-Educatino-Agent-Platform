import React, { useState, useEffect } from 'react';
import './FinalViewPage.css';

const FinalViewPage = ({ prompt, chapters, navigateTo, content, setContent }) => {
    useEffect(() => {
        const fetchContent = async (chapterName, subchapterName) => {
            try {
                const response = await fetch('http://localhost:5000/generate-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        chapter_name: chapterName, 
                        subchapter_name: subchapterName, 
                        prompt 
                    })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setContent(prev => ({
                    ...prev,
                    [`${chapterName}-${subchapterName}`]: data
                }));
                console.log(`Fetched Content for ${chapterName}-${subchapterName}:`, data); // Debug output
            } catch (error) {
                console.error('There was an error fetching the content:', error);
            }
        };

        if (chapters) {
            Object.entries(chapters).forEach(([chapterName, subchapters]) => {
                subchapters.forEach(subchapter => {
                    fetchContent(chapterName, subchapter);
                });
            });
        }
    }, [prompt, chapters, setContent]);

    const handleStartCourse = () => {
        navigateTo("courseContent");
    };

    return (
        <div className="final-view-page">
            <h1>Final View for "{prompt}"</h1>
            <button onClick={handleStartCourse}>Start Course</button>
            {chapters ? (
                <div className="chapters-container">
                    {Object.entries(chapters).map(([chapterName, subchapters], chapterIndex) => (
                        <div key={chapterIndex} className="chapter-card">
                            <h2 className="chapter-title">{chapterName}</h2>
                            {subchapters.map((subchapter, subchapterIndex) => (
                                <div key={subchapterIndex} className="subchapter-card">
                                    <h3 className="subchapter-title">{`Course ${subchapterIndex + 1}: ${subchapter}`}</h3>
                                    <div className="subchapter-content" dangerouslySetInnerHTML={{ __html: content[`${chapterName}-${subchapter}`] || '<p>Loading...</p>' }} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No chapters available</p>
            )}
        </div>
    );
};

export default FinalViewPage;
