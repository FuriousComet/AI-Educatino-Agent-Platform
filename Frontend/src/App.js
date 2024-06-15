import React, { useState } from 'react';
import CourseOutlinePage from './components/CourseOutlinePage';
import FinalViewPage from './components/FinalViewPage';
import CourseContentPage from './components/CourseContentPage';
import AITeacherInputPage from './components/AITeacherInputPage';
import ExamPage from './components/ExamPage';
import './App.css';

const App = () => {
    const [page, setPage] = useState("input");
    const [prompt, setPrompt] = useState("");
    const [chapters, setChapters] = useState(null);
    const [content, setContent] = useState({});
    const [examDetails, setExamDetails] = useState(null);

    const navigateTo = (page, details = null) => {
        if (page === "exam") {
            setExamDetails(details);
        }
        setPage(page);
    };

    return (
        <div className="app">
            {page === "input" && <AITeacherInputPage navigateTo={navigateTo} setPrompt={setPrompt} />}
            {page === "courseOutline" && <CourseOutlinePage prompt={prompt} navigateTo={navigateTo} setChapters={setChapters} />}
            {page === "finalView" && <FinalViewPage prompt={prompt} chapters={chapters} navigateTo={navigateTo} content={content} setContent={setContent} />}
            {page === "courseContent" && <CourseContentPage prompt={prompt} chapters={chapters} content={content} navigateTo={navigateTo} />}
            {page === "exam" && <ExamPage {...examDetails} prompt={prompt} navigateTo={navigateTo} />}
        </div>
    );
};

export default App;
