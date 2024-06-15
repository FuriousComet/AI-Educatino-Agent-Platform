import React, { useState } from 'react';

const AITeacherLecturePage = ({ navigateTo, setAvatar }) => {
    const [prompt, setPrompt] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [voiceId, setVoiceId] = useState("");

    const handleGenerateAvatar = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAvatarUrl(url);
        } catch (error) {
            console.error('There was an error generating the avatar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseAvatar = () => {
        setAvatar(avatarUrl);
        navigateTo("input");
    };

    return (
        <div className="ai-teacher-lecture-page">
            <h1>AI Teacher's Lecture Course</h1>
            <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Enter a prompt to generate an avatar..." 
                rows="5"
                style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
            <label htmlFor="voice_id">Voice Selector:</label>
            <select 
                name="voice_id" 
                id="voice_id"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "16px", margin: "20px 0" }}
            >
                {/* Male voices */}
                <option value="PEeZmvzaJmWyUYt3FFYB">Custom Voice 1- Male, Middle Aged, American, Deep, Narration</option>
                <option value="zYLJaDUXmSywoBxUZK9D">Custom Voice 2 - Male, Middle Aged, American, Deep, Narration</option>
                <option value="pNInz6obpgDQGcFmaJgB">Adam - Male, Middle Aged, American, Deep, Narration</option>
                <option value="ErXwobaYiN019PkySvjV">Antoni - Male, Young, American, Well-rounded, Narration</option>
                <option value="VR6AewLTigWG4xSOukaG">Arnold - Male, Middle Aged, American, Crisp, Narration</option>
                <option value="pqHfZKP75CvOlQylNhV4">Bill - Male, Middle Aged, American, Strong, Documentary</option>
                <option value="nPczCjzI2devNBz1zQrb">Brian - Male, Middle Aged, American, Deep, Narration</option>
                <option value="N2lVS1w4EtoT3dr4eOWO">Callum - Male, Middle Aged, American, Hoarse, Video Games</option>
                <option value="IKne3meq5aSn9XLyUdCD">Charlie - Male, Middle Aged, Australian, Casual, Conversational</option>
                <option value="iP95p4xoKVk53GoZ742B">Chris - Male, Middle Aged, American, Casual, Conversational</option>
                <option value="D38z5RcWu1voky8WS1ja">Fin - Male, Old, Irish, Sailor, Video Games</option>
                <option value="JBFqnCBsd6RMkjVDRZzb">George - Male, Middle Aged, British, Raspy, Narration</option>
                <option value="zcAOhNBS3c14rBihAFp1">Giovanni - Male, Young, English-Italian, Foreigner, Audiobook</option>
                <option value="SOYHLrjzK2X1ezoPC6cr">Harry - Male, Young, American, Anxious, Video Games</option>
                <option value="ZQe5CZNOzWyzPSCn5a3c">James - Male, Old, Australian, Calm, News</option>
                <option value="bVMeCyTHy58xNoL34h3p">Jeremy - Male, Young, American-Irish, Excited, Narration</option>
                <option value="t0jbNlBVZ17f02VDIeMI">Jessie - Male, Old, American, Raspy, Video Games</option>
                <option value="Zlb1dXrM653N07WRdFW3">Joseph - Male, Middle Aged, British, News</option>
                <option value="TxGEqnHWrfWFTfGW9XjX">Josh - Male, Young, American, Deep, Narration</option>
                <option value="flq6f7yk4E4fJM5XTYuZ">Michael - Male, Old, American, Audiobook</option>
                <option value="ODq5zmih8GrVes37Dizd">Patrick - Male, Middle Aged, American, Shouty, Video Games</option>
                <option value="5Q0t7uMcjvnagumLfvZi">Paul - Male, Middle Aged, American, Ground Reporter, News</option>
                <option value="knrPHWnBmmDHMoiMeP3l">Santa Claus - Male, Old, Christmas</option>
                <option value="yoZ06aMxZJJ28mfd3POQ">Sam - Male, Young, American, Raspy, Narration</option>
                <option value="GBv7mTt0atIp3Br8iCZE">Thomas - Male, Young, American, Calm, Meditation</option>
                {/* Female voices */}
                <option value="XB0fDUnXU5powFXDhCwa">Alice - Female, Middle Aged, British, Confident, News</option>
                <option value="AZnzlk1XvdvUeBnXmlld">Domi - Female, Young, American, Strong, Narration</option>
                <option value="ThT5KcBeYPX3keUQqHPh">Dorothy - Female, Young, British, Pleasant, Children’s Stories</option>
                <option value="LcfcDJNUP1GQjkzn1xUU">Emily - Female, Young, American, Calm, Meditation</option>
                <option value="Freya - Female, Young, American"></option>
                <option value="jBpfuIE2acCO8z3wKNLl">Gigi - Female, Young, American, Childish, Animation</option>
                <option value="z9fAnlkpzviPz146aGWa">Glinda - Female, Middle Aged, American, Witch, Video Games</option>
                <option value="oWAxZDx7w5VEj9dCyTzz">Grace - Female, Young, American-Southern, Audiobook</option>
                <option value="pFZP5JQG7iQjIQuC4Bku">Lily - Female, Middle Aged, British, Raspy, Narration</option>
                <option value="XrExE9yKIg1WjnnlVkGX">Matilda - Female, Young, American, Warm, Audiobook</option>
                <option value="zrHiDhphv9ZnVXBqCLjz">Mimi - Female, Young, English-Swedish, Childish, Animation</option>
                <option value="piTKgcLEGmPE4e6mEKli">Nicole - Female, Young, American, Whisper, Audiobook</option>
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel - Female, Young, American, Calm, Narration</option>
                <option value="EXAVITQu4vr4xnSDxMaL">Sarah - Female, Young, American, Soft, News</option>
                <option value="pMsXgVXv3BLzUgSXRplE">Serena - Female, Middle Aged, American, Pleasant, Interactive</option>
            </select>
            <button onClick={handleGenerateAvatar} disabled={loading}>
                {loading ? 'Generating Avatar...' : 'Generate Avatar'}
            </button>
            {avatarUrl && (
                <div className="avatar-result">
                    <h2>Generated Avatar</h2>
                    <img src={avatarUrl} alt="Generated Avatar" />
                    <button onClick={handleUseAvatar}>Let's use this avatar</button>
                </div>
            )}
        </div>
    );
};

export default AITeacherLecturePage;
