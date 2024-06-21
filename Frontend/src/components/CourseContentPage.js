import React, { useState, useEffect } from 'react';
import './CourseContentPage.css';
import spinner from './spinner.gif'; // Ensure this path is correct

const CourseContentPage = ({ prompt, chapters, content, navigateTo }) => {
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentSubchapterIndex, setCurrentSubchapterIndex] = useState(0);
    const [detailedContent, setDetailedContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!chapters) return <p>No course content available</p>;

    const chapterNames = Object.keys(chapters);
    const currentChapterName = chapterNames[currentChapterIndex];
    const subchapters = chapters[currentChapterName];
    const currentSubchapter = subchapters[currentSubchapterIndex];

    const handleNext = () => {
        if (currentSubchapterIndex < subchapters.length - 1) {
            setCurrentSubchapterIndex(currentSubchapterIndex + 1);
        } else if (currentChapterIndex < chapterNames.length - 1) {
            setCurrentChapterIndex(currentChapterIndex + 1);
            setCurrentSubchapterIndex(0);
        }
        setDetailedContent(null);  // Reset detailed content when navigating
    };

    const handlePrev = () => {
        if (currentSubchapterIndex > 0) {
            setCurrentSubchapterIndex(currentSubchapterIndex - 1);
        } else if (currentChapterIndex > 0) {
            setCurrentChapterIndex(currentChapterIndex - 1);
            setCurrentSubchapterIndex(chapters[chapterNames[currentChapterIndex - 1]].length - 1);
        }
        setDetailedContent(null);  // Reset detailed content when navigating
    };

    const goToCourse = (chapterIndex, subchapterIndex) => {
        setCurrentChapterIndex(chapterIndex);
        setCurrentSubchapterIndex(subchapterIndex);
        setDetailedContent(null);  // Reset detailed content when navigating
    };

    const handleTakeExam = () => {
        navigateTo("exam", { chapterName: currentChapterName, subchapterName: currentSubchapter });
    };

    const handleDigDeeper = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/dig-deeper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    chapter_name: currentChapterName, 
                    subchapter_name: currentSubchapter, 
                    prompt 
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDetailedContent(data);
            setIsLoading(false);
        } catch (error) {
            console.error('There was an error fetching the detailed content:', error);
            setIsLoading(false);
        }
    };

    const currentPage = currentChapterIndex * subchapters.length + currentSubchapterIndex + 1;
    const totalPages = chapterNames.reduce((acc, chapter) => acc + chapters[chapter].length, 0);

    return (
        <div className="course-content-container">
            <div className="toc">
                <h2>Table of Contents</h2>
                {chapterNames.map((chapterName, chapterIndex) => (
                    <div key={chapterIndex}>
                        <h3>{chapterName}</h3>
                        <ul>
                            {chapters[chapterName].map((subchapter, subchapterIndex) => (
                                <li key={subchapterIndex} onClick={() => goToCourse(chapterIndex, subchapterIndex)}>
                                    {subchapter}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="course-content-page">
                <div className="header">
                    <h1>Created Courses</h1>
                </div>
                <div className="course-content">
                    <h2>{currentChapterName}</h2>
                    <h3>{currentSubchapter}</h3>
                    {isLoading ? (
                        <div className="loading">
                            <img src={spinner} alt="Loading..." className="spinner" />
                        </div>
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: detailedContent || content[`${currentChapterName}-${currentSubchapter}`] || '<p>Loading...</p>'
                            }}
                        />
                    )}
                    <button onClick={handleTakeExam} className="exam-button">Take Exam</button>
                    <button onClick={handleDigDeeper} className="dig-deeper-button" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Dig Deeper'}
                    </button>
                </div>
                <div className="pagination">
                    <button onClick={handlePrev} disabled={currentChapterIndex === 0 && currentSubchapterIndex === 0}>
                        &lt; Previous
                    </button>
                    <span>
                        Page: {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentChapterIndex === chapterNames.length - 1 && currentSubchapterIndex === subchapters.length - 1}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseContentPage;
