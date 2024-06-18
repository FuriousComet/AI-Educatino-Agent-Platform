import React, { useState, useEffect } from 'react';
import './CourseContentPage.css';

const CourseContentPage = ({ prompt, chapters, content, navigateTo }) => {
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentSubchapterIndex, setCurrentSubchapterIndex] = useState(0);

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
    };

    const handlePrev = () => {
        if (currentSubchapterIndex > 0) {
            setCurrentSubchapterIndex(currentSubchapterIndex - 1);
        } else if (currentChapterIndex > 0) {
            setCurrentChapterIndex(currentChapterIndex - 1);
            setCurrentSubchapterIndex(chapters[chapterNames[currentChapterIndex - 1]].length - 1);
        }
    };

    const goToCourse = (chapterIndex, subchapterIndex) => {
        setCurrentChapterIndex(chapterIndex);
        setCurrentSubchapterIndex(subchapterIndex);
    };

    const handleTakeExam = () => {
        navigateTo("exam", { chapterName: currentChapterName, subchapterName: currentSubchapter });
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
                                    {chapterName} - Course {subchapterIndex + 1}: {subchapter}
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
                    <h3>Course {currentSubchapterIndex + 1}: {currentSubchapter}</h3>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: content[`${currentChapterName}-${currentSubchapter}`] || '<p>Loading...</p>'
                        }}
                    />
                    <button onClick={handleTakeExam} className="exam-button">Take Exam</button>
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
