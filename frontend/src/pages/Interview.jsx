import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Interview() {
    // ==========================
    // APP SETTINGS
    // ==========================

    const [currentView, setCurrentView] = useState("interview");

    const [role, setRole] = useState("AI/ML Engineer");
    const [difficulty, setDifficulty] = useState("Easy");
    const [category, setCategory] = useState("Technical");
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);

    // ==========================
    // RESUME
    // ==========================

    const [resume, setResume] = useState(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    // ==========================
    // RESUME ANALYSIS
    // ==========================

    const [resumeAnalysis, setResumeAnalysis] = useState("");
    const [analyzingResume, setAnalyzingResume] = useState(false);

    // ==========================
    // QUESTION
    // ==========================

    const [question, setQuestion] = useState(
        "Why should we hire you?"
    );

    const [questionLoading, setQuestionLoading] = useState(false);

    // ==========================
    // CANDIDATE ANSWER
    // ==========================

    const [practiceAnswer, setPracticeAnswer] = useState("");

    // ==========================
    // EVALUATION
    // ==========================

    const [evaluation, setEvaluation] = useState("");
    const [evaluating, setEvaluating] = useState(false);

    const [
        currentQuestionEvaluated,
        setCurrentQuestionEvaluated,
    ] = useState(false);

    // ==========================
    // AI ANSWER
    // ==========================

    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    // ==========================
    // FOLLOW-UP QUESTION
    // ==========================

    const [isFollowUpQuestion, setIsFollowUpQuestion] =
        useState(false);

    const [followUpLoading, setFollowUpLoading] =
        useState(false);

    const [followUpUsed, setFollowUpUsed] = useState(false);

    // ==========================
    // SPEECH
    // ==========================

    const [listening, setListening] = useState(false);

    const [speakingQuestion, setSpeakingQuestion] =
        useState(false);

    const recognitionRef = useRef(null);
    const speechRef = useRef(null);

    // ==========================
    // INTERVIEW SESSION
    // ==========================

    const [sessionQuestions, setSessionQuestions] =
        useState([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

    const [sessionActive, setSessionActive] =
        useState(false);

    const [startingInterview, setStartingInterview] =
        useState(false);

    const [interviewResults, setInterviewResults] =
        useState([]);

    // ==========================
    // FINAL REPORT
    // ==========================

    const [finalReport, setFinalReport] = useState("");

    const [generatingReport, setGeneratingReport] =
        useState(false);

    const [interviewCompleted, setInterviewCompleted] =
        useState(false);

    // ==========================
    // HISTORY
    // ==========================

    const [interviewHistory, setInterviewHistory] =
        useState([]);

    // ==========================
    // LOAD HISTORY
    // ==========================

    useEffect(() => {
        try {
            const savedHistory =
                localStorage.getItem("interviewHistory");

            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);

                if (Array.isArray(parsedHistory)) {
                    setInterviewHistory(parsedHistory);
                }
            }
        } catch (error) {
            console.log("History error:", error);
        }
    }, []);

    // ==========================
    // CLEANUP
    // ==========================

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (error) {
                    console.log(error);
                }
            }

            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ==========================
    // STYLES
    // ==========================

    const styles = {
        page: {
            minHeight: "100vh",
            background:
                "linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)",
            color: "#f8fafc",
            fontFamily:
                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },

        layout: {
            display: "flex",
            minHeight: "100vh",
        },

        sidebar: {
            width: "260px",
            background: "rgba(15, 23, 42, 0.96)",
            borderRight: "1px solid #1e293b",
            padding: "28px 20px",
            boxSizing: "border-box",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            overflowY: "auto",
        },

        logoBox: {
            marginBottom: "35px",
        },

        logo: {
            fontSize: "23px",
            fontWeight: "800",
            margin: 0,
        },

        logoSubtitle: {
            color: "#94a3b8",
            fontSize: "13px",
            marginTop: "7px",
            lineHeight: "1.5",
        },

        navButton: {
            width: "100%",
            padding: "13px 15px",
            border: "none",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            textAlign: "left",
            marginBottom: "10px",
        },

        main: {
            flex: 1,
            marginLeft: "260px",
            padding: "35px",
            boxSizing: "border-box",
            minWidth: 0,
        },

        container: {
            maxWidth: "1250px",
            margin: "0 auto",
        },

        header: {
            marginBottom: "30px",
        },

        title: {
            fontSize: "32px",
            margin: 0,
            fontWeight: "800",
        },

        subtitle: {
            color: "#94a3b8",
            marginTop: "8px",
            lineHeight: "1.6",
        },

        card: {
            background: "rgba(30, 41, 59, 0.82)",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            boxSizing: "border-box",
        },

        sectionTitle: {
            marginTop: 0,
            marginBottom: "8px",
            fontSize: "20px",
        },

        sectionDescription: {
            color: "#94a3b8",
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "14px",
            lineHeight: "1.6",
        },

        input: {
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            fontSize: "15px",
            boxSizing: "border-box",
            outline: "none",
        },

        textarea: {
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            fontSize: "16px",
            boxSizing: "border-box",
            outline: "none",
            resize: "vertical",
            lineHeight: "1.7",
        },

        button: {
            padding: "12px 18px",
            color: "white",
            border: "none",
            borderRadius: "9px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "700",
        },

        label: {
            display: "block",
            marginBottom: "9px",
            fontWeight: "700",
            color: "#e2e8f0",
        },

        output: {
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
            minHeight: "130px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.8",
            color: "#e2e8f0",
            boxSizing: "border-box",
        },

        badge: {
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
        },
    };

    // ==========================
    // HISTORY
    // ==========================

    const saveHistory = (history) => {
        setInterviewHistory(history);

        localStorage.setItem(
            "interviewHistory",
            JSON.stringify(history)
        );
    };

    const extractScore = (report) => {
        if (!report) {
            return 0;
        }

        const match = report.match(
            /OVERALL SCORE:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i
        );

        if (!match) {
            return 0;
        }

        return Number(match[1]);
    };

    const deleteHistoryItem = (id) => {
        const updatedHistory = interviewHistory.filter(
            (item) => item.id !== id
        );

        saveHistory(updatedHistory);
    };

    const clearHistory = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all interview history?"
        );

        if (confirmed) {
            saveHistory([]);
        }
    };

    // ==========================
    // SPEECH FUNCTIONS
    // ==========================

    const stopSpeakingQuestion = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        speechRef.current = null;
        setSpeakingQuestion(false);
    };

    const stopVoiceAnswer = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log(error);
            }

            recognitionRef.current = null;
        }

        setListening(false);
    };

    const speakQuestion = (text = question) => {
        if (!text?.trim()) {
            return;
        }

        if (!("speechSynthesis" in window)) {
            alert("Text-to-speech is not supported.");
            return;
        }

        stopVoiceAnswer();
        window.speechSynthesis.cancel();

        const speak = () => {
            const speech = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            const preferredVoice =
                voices.find(
                    (voice) =>
                        voice.name.includes("Samantha") &&
                        voice.lang.startsWith("en")
                ) ||
                voices.find(
                    (voice) =>
                        voice.name.includes("Google US English")
                ) ||
                voices.find(
                    (voice) =>
                        voice.lang === "en-US"
                );

            if (preferredVoice) {
                speech.voice = preferredVoice;
            }

            speech.lang = "en-US";
            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;

            speech.onstart = () => {
                setSpeakingQuestion(true);
            };

            speech.onend = () => {
                setSpeakingQuestion(false);
                speechRef.current = null;
            };

            speech.onerror = () => {
                setSpeakingQuestion(false);
                speechRef.current = null;
            };

            speechRef.current = speech;
            window.speechSynthesis.speak(speech);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                speak();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            speak();
        }
    };

    // ==========================
    // RESET QUESTION
    // ==========================

    const resetQuestionState = () => {
        setPracticeAnswer("");
        setEvaluation("");
        setAnswer("");
        setCurrentQuestionEvaluated(false);
    };

    // ==========================
    // UPLOAD RESUME
    // ==========================

    const uploadResume = async () => {
        if (!resume) {
            setUploadMessage("Please choose a PDF resume first.");
            return;
        }

        setUploading(true);
        setUploadMessage("");
        setResumeAnalysis("");
        setResumeUploaded(false);

        const formData = new FormData();

        formData.append("file", resume);

        try {
            const response = await axios.post(
                `${API_URL}/upload-resume`,
                formData
            );

            setUploadMessage(response.data.message);
            setResumeUploaded(true);
        } catch (error) {
            console.log(error);

            setUploadMessage(
                error.response?.data?.detail ||
                "Resume upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    // ==========================
    // ANALYZE RESUME
    // ==========================

    const analyzeResume = async () => {
        if (!resumeUploaded) {
            alert("Please upload your resume first.");
            return;
        }

        if (!role.trim()) {
            alert("Please enter a job role.");
            return;
        }

        setAnalyzingResume(true);
        setResumeAnalysis("");

        try {
            const response = await axios.post(
                `${API_URL}/analyze-resume`,
                {
                    role,
                }
            );

            setResumeAnalysis(response.data.analysis);
        } catch (error) {
            console.log(error);

            setResumeAnalysis(
                error.response?.data?.detail ||
                "Could not analyze resume."
            );
        } finally {
            setAnalyzingResume(false);
        }
    };

    // ==========================
    // GENERATE SINGLE QUESTION
    // ==========================

    const generateQuestion = async () => {
        if (!role.trim()) {
            alert("Please enter a job role.");
            return;
        }

        stopSpeakingQuestion();
        stopVoiceAnswer();

        setQuestionLoading(true);

        resetQuestionState();

        setIsFollowUpQuestion(false);
        setFollowUpUsed(false);

        try {
            const response = await axios.post(
                `${API_URL}/generate-question`,
                {
                    role,
                    difficulty,
                    category,
                }
            );

            const generatedQuestion = response.data.question;

            setQuestion(generatedQuestion);

            setTimeout(() => {
                speakQuestion(generatedQuestion);
            }, 300);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Could not generate question."
            );
        } finally {
            setQuestionLoading(false);
        }
    };

    // ==========================
    // START INTERVIEW
    // ==========================

    const startInterview = async () => {
        if (!role.trim()) {
            alert("Please enter a job role.");
            return;
        }

        stopSpeakingQuestion();
        stopVoiceAnswer();

        setStartingInterview(true);

        setSessionQuestions([]);
        setCurrentQuestionIndex(0);
        setInterviewResults([]);

        resetQuestionState();

        setFinalReport("");
        setInterviewCompleted(false);

        setIsFollowUpQuestion(false);
        setFollowUpUsed(false);

        try {
            const response = await axios.post(
                `${API_URL}/start-interview`,
                {
                    role,
                    difficulty,
                    category,
                    number_of_questions: Number(numberOfQuestions),
                }
            );

            const questions = response.data.questions;

            if (!questions?.length) {
                alert("No questions were generated.");
                return;
            }

            setSessionQuestions(questions);
            setCurrentQuestionIndex(0);
            setQuestion(questions[0]);
            setSessionActive(true);

            setTimeout(() => {
                speakQuestion(questions[0]);
            }, 500);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Could not start interview."
            );
        } finally {
            setStartingInterview(false);
        }
    };

    // ==========================
    // VOICE ANSWER
    // ==========================

    const startVoiceAnswer = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Speech recognition is not supported. Please use Google Chrome."
            );

            return;
        }

        if (currentQuestionEvaluated) {
            return;
        }

        stopSpeakingQuestion();

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {
            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                if (event.results[i].isFinal) {
                    transcript +=
                        event.results[i][0].transcript + " ";
                }
            }

            if (transcript.trim()) {
                setPracticeAnswer((previous) => {
                    const space = previous.trim() ? " " : "";

                    return (
                        previous +
                        space +
                        transcript.trim()
                    );
                });
            }
        };

        recognition.onerror = (event) => {
            console.log(
                "Speech recognition error:",
                event.error
            );

            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;

        recognition.start();
    };

    // ==========================
    // GENERATE AI ANSWER
    // ==========================

    const generateAnswer = async () => {
        if (!question.trim()) {
            alert("No question is available.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/answer`,
                {
                    question,
                    role,
                }
            );

            setAnswer(response.data.answer);
        } catch (error) {
            console.log(error);

            setAnswer(
                error.response?.data?.detail ||
                "Could not generate AI answer."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // EVALUATE ANSWER
    // ==========================

    const evaluateAnswer = async () => {
        if (!practiceAnswer.trim()) {
            alert("Please answer the question first.");
            return;
        }

        stopVoiceAnswer();

        setEvaluating(true);
        setEvaluation("");

        try {
            const response = await axios.post(
                `${API_URL}/evaluate-answer`,
                {
                    question,
                    candidate_answer: practiceAnswer,
                    role,
                }
            );

            const evaluationText =
                response.data.evaluation;

            setEvaluation(evaluationText);

            setCurrentQuestionEvaluated(true);

            if (sessionActive) {
                setInterviewResults((previous) => [
                    ...previous,
                    {
                        question,
                        candidate_answer: practiceAnswer,
                        evaluation: evaluationText,
                    },
                ]);
            }
        } catch (error) {
            console.log(error);

            setEvaluation(
                error.response?.data?.detail ||
                "Could not evaluate answer."
            );
        } finally {
            setEvaluating(false);
        }
    };

    // ==========================
    // FOLLOW-UP
    // ==========================

    const generateFollowUp = async () => {
        if (!currentQuestionEvaluated) {
            alert("Evaluate your answer first.");
            return;
        }

        if (!practiceAnswer.trim()) {
            alert("Candidate answer is missing.");
            return;
        }

        setFollowUpLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/generate-follow-up`,
                {
                    role,
                    original_question: question,
                    candidate_answer: practiceAnswer,
                    difficulty,
                }
            );

            const followUp =
                response.data.follow_up_question;

            setQuestion(followUp);

            resetQuestionState();

            setIsFollowUpQuestion(true);
            setFollowUpUsed(true);

            setTimeout(() => {
                speakQuestion(followUp);
            }, 400);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Could not generate follow-up question."
            );
        } finally {
            setFollowUpLoading(false);
        }
    };

    // ==========================
    // NEXT QUESTION
    // ==========================

    const nextQuestion = () => {
        stopSpeakingQuestion();
        stopVoiceAnswer();

        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= sessionQuestions.length) {
            return;
        }

        const next = sessionQuestions[nextIndex];

        setCurrentQuestionIndex(nextIndex);
        setQuestion(next);

        resetQuestionState();

        setIsFollowUpQuestion(false);
        setFollowUpUsed(false);

        setTimeout(() => {
            speakQuestion(next);
        }, 400);
    };

    // ==========================
    // FINISH INTERVIEW
    // ==========================

    const finishInterview = async () => {
        if (!interviewResults.length) {
            alert("No evaluated answers are available.");
            return;
        }

        stopSpeakingQuestion();
        stopVoiceAnswer();

        setGeneratingReport(true);

        try {
            const response = await axios.post(
                `${API_URL}/final-report`,
                {
                    role,
                    difficulty,
                    category,
                    interview_results: interviewResults,
                }
            );

            const report = response.data.final_report;

            setFinalReport(report);

            setSessionActive(false);
            setInterviewCompleted(true);

            const historyItem = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                role,
                difficulty,
                category,
                score: extractScore(report),
                report,
            };

            saveHistory([
                historyItem,
                ...interviewHistory,
            ]);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Could not generate final report."
            );
        } finally {
            setGeneratingReport(false);
        }
    };

    // ==========================
    // CLEAR INTERVIEW
    // ==========================

    const clearAll = () => {
        stopSpeakingQuestion();
        stopVoiceAnswer();

        setQuestion("Why should we hire you?");

        resetQuestionState();

        setSessionQuestions([]);
        setCurrentQuestionIndex(0);
        setSessionActive(false);
        setInterviewResults([]);

        setFinalReport("");
        setInterviewCompleted(false);

        setIsFollowUpQuestion(false);
        setFollowUpUsed(false);
    };

    // ==========================
    // NEW INTERVIEW
    // ==========================

    const startNewInterview = () => {
        clearAll();
        setCurrentView("interview");
    };

    // ==========================
    // DASHBOARD VALUES
    // ==========================

    const scores = interviewHistory
        .map((item) => Number(item.score))
        .filter((score) => score > 0);

    const averageScore =
        scores.length > 0
            ? (
                scores.reduce(
                    (total, score) => total + score,
                    0
                ) / scores.length
            ).toFixed(1)
            : "0.0";

    const bestScore =
        scores.length > 0
            ? Math.max(...scores)
            : 0;

    const isLastQuestion =
        sessionActive &&
        currentQuestionIndex ===
        sessionQuestions.length - 1;

    const progress =
        sessionActive && sessionQuestions.length > 0
            ? ((currentQuestionIndex + 1) /
                sessionQuestions.length) *
            100
            : 0;

    // ==========================
    // UI
    // ==========================

    return (
        <div style={styles.page}>
            <div style={styles.layout}>
                {/* ========================== */}
                {/* SIDEBAR */}
                {/* ========================== */}

                <aside style={styles.sidebar}>
                    <div style={styles.logoBox}>
                        <h1 style={styles.logo}>
                            🎤 InterviewAI
                        </h1>

                        <p style={styles.logoSubtitle}>
                            AI-powered interview preparation
                            platform
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setCurrentView("interview")
                        }
                        style={{
                            ...styles.navButton,
                            background:
                                currentView === "interview"
                                    ? "#2563eb"
                                    : "transparent",
                        }}
                    >
                        🎯 Mock Interview
                    </button>

                    <button
                        onClick={() =>
                            setCurrentView("resume")
                        }
                        style={{
                            ...styles.navButton,
                            background:
                                currentView === "resume"
                                    ? "#2563eb"
                                    : "transparent",
                        }}
                    >
                        📄 Resume Analysis
                    </button>

                    <button
                        onClick={() =>
                            setCurrentView("dashboard")
                        }
                        style={{
                            ...styles.navButton,
                            background:
                                currentView === "dashboard"
                                    ? "#2563eb"
                                    : "transparent",
                        }}
                    >
                        📊 Performance
                    </button>

                    <div
                        style={{
                            marginTop: "35px",
                            padding: "16px",
                            background: "#0f172a",
                            borderRadius: "12px",
                            border: "1px solid #1e293b",
                        }}
                    >
                        <div
                            style={{
                                color: "#94a3b8",
                                fontSize: "12px",
                            }}
                        >
                            CURRENT ROLE
                        </div>

                        <div
                            style={{
                                marginTop: "7px",
                                fontWeight: "700",
                                lineHeight: "1.5",
                            }}
                        >
                            {role || "No role selected"}
                        </div>
                    </div>
                </aside>

                {/* ========================== */}
                {/* MAIN */}
                {/* ========================== */}

                <main style={styles.main}>
                    <div style={styles.container}>
                        {/* ========================== */}
                        {/* INTERVIEW VIEW */}
                        {/* ========================== */}

                        {currentView === "interview" && (
                            <>
                                <div style={styles.header}>
                                    <h1 style={styles.title}>
                                        Mock Interview
                                    </h1>

                                    <p style={styles.subtitle}>
                                        Practice realistic interview
                                        questions, answer by voice or
                                        text, and receive AI-powered
                                        feedback.
                                    </p>
                                </div>

                                {/* INTERVIEW SETTINGS */}

                                <div
                                    style={{
                                        ...styles.card,
                                        marginBottom: "24px",
                                    }}
                                >
                                    <h2 style={styles.sectionTitle}>
                                        Interview Setup
                                    </h2>

                                    <p
                                        style={
                                            styles.sectionDescription
                                        }
                                    >
                                        Configure your target role and
                                        interview preferences.
                                    </p>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "18px",
                                        }}
                                    >
                                        <div>
                                            <label
                                                style={styles.label}
                                            >
                                                Job Role
                                            </label>

                                            <input
                                                value={role}
                                                onChange={(e) =>
                                                    setRole(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    sessionActive
                                                }
                                                style={styles.input}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                style={styles.label}
                                            >
                                                Difficulty
                                            </label>

                                            <select
                                                value={difficulty}
                                                onChange={(e) =>
                                                    setDifficulty(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    sessionActive
                                                }
                                                style={styles.input}
                                            >
                                                <option>
                                                    Easy
                                                </option>
                                                <option>
                                                    Medium
                                                </option>
                                                <option>
                                                    Hard
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                style={styles.label}
                                            >
                                                Category
                                            </label>

                                            <select
                                                value={category}
                                                onChange={(e) =>
                                                    setCategory(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    sessionActive
                                                }
                                                style={styles.input}
                                            >
                                                <option>HR</option>
                                                <option>
                                                    Technical
                                                </option>
                                                <option>
                                                    Behavioral
                                                </option>
                                                <option>
                                                    Project-Based
                                                </option>
                                                <option>
                                                    Resume-Based
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                style={styles.label}
                                            >
                                                Questions
                                            </label>

                                            <select
                                                value={
                                                    numberOfQuestions
                                                }
                                                onChange={(e) =>
                                                    setNumberOfQuestions(
                                                        Number(
                                                            e.target
                                                                .value
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    sessionActive
                                                }
                                                style={styles.input}
                                            >
                                                <option value={5}>
                                                    5 Questions
                                                </option>

                                                <option value={10}>
                                                    10 Questions
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            marginTop: "22px",
                                        }}
                                    >
                                        <button
                                            onClick={startInterview}
                                            disabled={
                                                startingInterview ||
                                                sessionActive
                                            }
                                            style={{
                                                ...styles.button,
                                                background:
                                                    "#16a34a",
                                            }}
                                        >
                                            {startingInterview
                                                ? "Starting Interview..."
                                                : sessionActive
                                                    ? "Interview Running"
                                                    : "🚀 Start Mock Interview"}
                                        </button>

                                        {!sessionActive &&
                                            !interviewCompleted && (
                                                <button
                                                    onClick={
                                                        generateQuestion
                                                    }
                                                    disabled={
                                                        questionLoading
                                                    }
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            "#7c3aed",
                                                    }}
                                                >
                                                    {questionLoading
                                                        ? "Generating..."
                                                        : "✨ Generate Single Question"}
                                                </button>
                                            )}
                                    </div>
                                </div>

                                {/* SESSION PROGRESS */}

                                {sessionActive && (
                                    <div
                                        style={{
                                            ...styles.card,
                                            marginBottom: "24px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems: "center",
                                                gap: "15px",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <strong>
                                                    Question{" "}
                                                    {currentQuestionIndex +
                                                        1}{" "}
                                                    of{" "}
                                                    {
                                                        sessionQuestions.length
                                                    }
                                                </strong>
                                            </div>

                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    background:
                                                        isFollowUpQuestion
                                                            ? "#581c87"
                                                            : "#1e3a8a",
                                                    color:
                                                        isFollowUpQuestion
                                                            ? "#e9d5ff"
                                                            : "#bfdbfe",
                                                }}
                                            >
                                                {isFollowUpQuestion
                                                    ? "AI Follow-Up"
                                                    : category}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                height: "9px",
                                                background:
                                                    "#0f172a",
                                                borderRadius:
                                                    "999px",
                                                marginTop: "17px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${progress}%`,
                                                    background:
                                                        "#2563eb",
                                                    transition:
                                                        "width 0.3s ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!interviewCompleted && (
                                    <>
                                        {/* QUESTION */}

                                        <div
                                            style={{
                                                ...styles.card,
                                                marginBottom: "24px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    gap: "15px",
                                                    flexWrap: "wrap",
                                                    marginBottom:
                                                        "16px",
                                                }}
                                            >
                                                <div>
                                                    <h2
                                                        style={
                                                            styles.sectionTitle
                                                        }
                                                    >
                                                        {isFollowUpQuestion
                                                            ? "AI Follow-Up Question"
                                                            : "Interview Question"}
                                                    </h2>

                                                    <p
                                                        style={{
                                                            ...styles.sectionDescription,
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        Read carefully
                                                        and answer as
                                                        you would in a
                                                        real interview.
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        speakQuestion(
                                                            question
                                                        )
                                                    }
                                                    disabled={
                                                        speakingQuestion
                                                    }
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            "#2563eb",
                                                    }}
                                                >
                                                    {speakingQuestion
                                                        ? "🔊 Speaking..."
                                                        : "🔊 Listen"}
                                                </button>
                                            </div>

                                            <textarea
                                                value={question}
                                                onChange={(e) =>
                                                    setQuestion(
                                                        e.target.value
                                                    )
                                                }
                                                readOnly={
                                                    sessionActive
                                                }
                                                rows={4}
                                                style={
                                                    styles.textarea
                                                }
                                            />
                                        </div>

                                        {/* CANDIDATE ANSWER */}

                                        <div
                                            style={{
                                                ...styles.card,
                                                marginBottom: "24px",
                                            }}
                                        >
                                            <h2
                                                style={
                                                    styles.sectionTitle
                                                }
                                            >
                                                Your Answer
                                            </h2>

                                            <p
                                                style={
                                                    styles.sectionDescription
                                                }
                                            >
                                                Type your response or
                                                use voice recognition
                                                to practice speaking.
                                            </p>

                                            <textarea
                                                value={
                                                    practiceAnswer
                                                }
                                                onChange={(e) =>
                                                    setPracticeAnswer(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    currentQuestionEvaluated
                                                }
                                                placeholder="Enter your interview answer here..."
                                                rows={7}
                                                style={
                                                    styles.textarea
                                                }
                                            />

                                            {listening && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "14px",
                                                        padding:
                                                            "12px 15px",
                                                        background:
                                                            "#450a0a",
                                                        color:
                                                            "#fecaca",
                                                        borderRadius:
                                                            "9px",
                                                        fontWeight:
                                                            "700",
                                                    }}
                                                >
                                                    🔴 Listening...
                                                    Speak clearly.
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "12px",
                                                    flexWrap: "wrap",
                                                    marginTop: "18px",
                                                }}
                                            >
                                                {!listening ? (
                                                    <button
                                                        onClick={
                                                            startVoiceAnswer
                                                        }
                                                        disabled={
                                                            currentQuestionEvaluated
                                                        }
                                                        style={{
                                                            ...styles.button,
                                                            background:
                                                                "#ea580c",
                                                        }}
                                                    >
                                                        🎙️ Speak
                                                        Answer
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={
                                                            stopVoiceAnswer
                                                        }
                                                        style={{
                                                            ...styles.button,
                                                            background:
                                                                "#dc2626",
                                                        }}
                                                    >
                                                        ⏹ Stop
                                                        Recording
                                                    </button>
                                                )}

                                                <button
                                                    onClick={
                                                        evaluateAnswer
                                                    }
                                                    disabled={
                                                        evaluating ||
                                                        currentQuestionEvaluated
                                                    }
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            "#0891b2",
                                                    }}
                                                >
                                                    {evaluating
                                                        ? "Evaluating..."
                                                        : currentQuestionEvaluated
                                                            ? "✓ Answer Evaluated"
                                                            : "📊 Evaluate Answer"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* FEEDBACK */}

                                        {(evaluation ||
                                            evaluating) && (
                                                <div
                                                    style={{
                                                        ...styles.card,
                                                        marginBottom:
                                                            "24px",
                                                    }}
                                                >
                                                    <h2
                                                        style={
                                                            styles.sectionTitle
                                                        }
                                                    >
                                                        AI Feedback
                                                    </h2>

                                                    <p
                                                        style={
                                                            styles.sectionDescription
                                                        }
                                                    >
                                                        Review your score,
                                                        strengths,
                                                        improvements, and
                                                        suggested response.
                                                    </p>

                                                    <div
                                                        style={
                                                            styles.output
                                                        }
                                                    >
                                                        {evaluating
                                                            ? "Analyzing your answer..."
                                                            : evaluation}
                                                    </div>

                                                    {currentQuestionEvaluated && (
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                gap: "12px",
                                                                flexWrap:
                                                                    "wrap",
                                                                marginTop:
                                                                    "18px",
                                                            }}
                                                        >
                                                            {!isFollowUpQuestion &&
                                                                !followUpUsed && (
                                                                    <button
                                                                        onClick={
                                                                            generateFollowUp
                                                                        }
                                                                        disabled={
                                                                            followUpLoading
                                                                        }
                                                                        style={{
                                                                            ...styles.button,
                                                                            background:
                                                                                "#7c3aed",
                                                                        }}
                                                                    >
                                                                        {followUpLoading
                                                                            ? "Generating Follow-Up..."
                                                                            : "🔁 Ask AI Follow-Up"}
                                                                    </button>
                                                                )}

                                                            {sessionActive &&
                                                                !isLastQuestion && (
                                                                    <button
                                                                        onClick={
                                                                            nextQuestion
                                                                        }
                                                                        style={{
                                                                            ...styles.button,
                                                                            background:
                                                                                "#2563eb",
                                                                        }}
                                                                    >
                                                                        Next
                                                                        Question
                                                                        →
                                                                    </button>
                                                                )}

                                                            {sessionActive &&
                                                                isLastQuestion && (
                                                                    <button
                                                                        onClick={
                                                                            finishInterview
                                                                        }
                                                                        disabled={
                                                                            generatingReport
                                                                        }
                                                                        style={{
                                                                            ...styles.button,
                                                                            background:
                                                                                "#dc2626",
                                                                        }}
                                                                    >
                                                                        {generatingReport
                                                                            ? "Generating Report..."
                                                                            : "🏁 Finish Interview"}
                                                                    </button>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        {/* AI ANSWER */}

                                        <div
                                            style={{
                                                ...styles.card,
                                                marginBottom: "24px",
                                            }}
                                        >
                                            <h2
                                                style={
                                                    styles.sectionTitle
                                                }
                                            >
                                                AI Suggested Answer
                                            </h2>

                                            <p
                                                style={
                                                    styles.sectionDescription
                                                }
                                            >
                                                Generate a
                                                resume-aware sample
                                                answer for comparison
                                                and learning.
                                            </p>

                                            <div
                                                style={
                                                    styles.output
                                                }
                                            >
                                                {loading
                                                    ? "Generating AI answer..."
                                                    : answer ||
                                                    "Your AI-generated suggested answer will appear here."}
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "12px",
                                                    flexWrap: "wrap",
                                                    marginTop: "18px",
                                                }}
                                            >
                                                <button
                                                    onClick={
                                                        generateAnswer
                                                    }
                                                    disabled={loading}
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            "#2563eb",
                                                    }}
                                                >
                                                    {loading
                                                        ? "Generating..."
                                                        : "✨ Generate Answer"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigator.clipboard.writeText(
                                                            answer
                                                        )
                                                    }
                                                    disabled={!answer}
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            answer
                                                                ? "#16a34a"
                                                                : "#475569",
                                                        cursor:
                                                            answer
                                                                ? "pointer"
                                                                : "not-allowed",
                                                    }}
                                                >
                                                    📋 Copy Answer
                                                </button>

                                                <button
                                                    onClick={clearAll}
                                                    style={{
                                                        ...styles.button,
                                                        background:
                                                            "#dc2626",
                                                    }}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* FINAL REPORT */}

                                {interviewCompleted && (
                                    <div style={styles.card}>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                marginBottom: "25px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "50px",
                                                }}
                                            >
                                                🏆
                                            </div>

                                            <h1>
                                                Interview Completed
                                            </h1>

                                            <p
                                                style={{
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                Review your complete
                                                AI performance report
                                                below.
                                            </p>
                                        </div>

                                        <div
                                            style={
                                                styles.output
                                            }
                                        >
                                            {finalReport}
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "center",
                                                gap: "12px",
                                                flexWrap: "wrap",
                                                marginTop: "22px",
                                            }}
                                        >
                                            <button
                                                onClick={
                                                    startNewInterview
                                                }
                                                style={{
                                                    ...styles.button,
                                                    background:
                                                        "#16a34a",
                                                }}
                                            >
                                                🔄 New Interview
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setCurrentView(
                                                        "dashboard"
                                                    )
                                                }
                                                style={{
                                                    ...styles.button,
                                                    background:
                                                        "#2563eb",
                                                }}
                                            >
                                                📊 View Performance
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ========================== */}
                        {/* RESUME VIEW */}
                        {/* ========================== */}

                        {currentView === "resume" && (
                            <>
                                <div style={styles.header}>
                                    <h1 style={styles.title}>
                                        Resume Analysis
                                    </h1>

                                    <p style={styles.subtitle}>
                                        Upload any PDF resume and
                                        analyze its relevance to your
                                        selected job role.
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(300px, 1fr))",
                                        gap: "24px",
                                        alignItems: "start",
                                    }}
                                >
                                    <div style={styles.card}>
                                        <h2
                                            style={
                                                styles.sectionTitle
                                            }
                                        >
                                            Upload Resume
                                        </h2>

                                        <p
                                            style={
                                                styles.sectionDescription
                                            }
                                        >
                                            Select your target role
                                            and upload a text-based PDF
                                            resume.
                                        </p>

                                        <label
                                            style={styles.label}
                                        >
                                            Target Job Role
                                        </label>

                                        <input
                                            value={role}
                                            onChange={(e) =>
                                                setRole(
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                ...styles.input,
                                                marginBottom:
                                                    "20px",
                                            }}
                                        />

                                        <label
                                            style={styles.label}
                                        >
                                            Resume PDF
                                        </label>

                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={(e) => {
                                                setResume(
                                                    e.target.files?.[0] ||
                                                    null
                                                );

                                                setResumeUploaded(
                                                    false
                                                );

                                                setResumeAnalysis(
                                                    ""
                                                );

                                                setUploadMessage("");
                                            }}
                                            style={{
                                                ...styles.input,
                                                marginBottom:
                                                    "16px",
                                            }}
                                        />

                                        <button
                                            onClick={uploadResume}
                                            disabled={uploading}
                                            style={{
                                                ...styles.button,
                                                width: "100%",
                                                background:
                                                    "#7c3aed",
                                            }}
                                        >
                                            {uploading
                                                ? "Uploading Resume..."
                                                : "📤 Upload Resume"}
                                        </button>

                                        {uploadMessage && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        "15px",
                                                    padding:
                                                        "12px",
                                                    background:
                                                        resumeUploaded
                                                            ? "#052e16"
                                                            : "#450a0a",
                                                    color:
                                                        resumeUploaded
                                                            ? "#bbf7d0"
                                                            : "#fecaca",
                                                    borderRadius:
                                                        "9px",
                                                }}
                                            >
                                                {uploadMessage}
                                            </div>
                                        )}

                                        {resumeUploaded && (
                                            <button
                                                onClick={
                                                    analyzeResume
                                                }
                                                disabled={
                                                    analyzingResume
                                                }
                                                style={{
                                                    ...styles.button,
                                                    width: "100%",
                                                    background:
                                                        "#0891b2",
                                                    marginTop:
                                                        "15px",
                                                }}
                                            >
                                                {analyzingResume
                                                    ? "Analyzing Resume..."
                                                    : "🔍 Analyze Resume & Job Match"}
                                            </button>
                                        )}
                                    </div>

                                    <div style={styles.card}>
                                        <h2
                                            style={
                                                styles.sectionTitle
                                            }
                                        >
                                            AI Analysis Result
                                        </h2>

                                        <p
                                            style={
                                                styles.sectionDescription
                                            }
                                        >
                                            Review your job match,
                                            relevant skills, missing
                                            skills, strengths, and
                                            recommendations.
                                        </p>

                                        <div
                                            style={{
                                                ...styles.output,
                                                minHeight: "400px",
                                            }}
                                        >
                                            {analyzingResume
                                                ? "AI is analyzing the resume against the selected job role..."
                                                : resumeAnalysis ||
                                                "Upload and analyze a resume to view the AI assessment."}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ========================== */}
                        {/* DASHBOARD VIEW */}
                        {/* ========================== */}

                        {currentView === "dashboard" && (
                            <>
                                <div style={styles.header}>
                                    <h1 style={styles.title}>
                                        Performance Dashboard
                                    </h1>

                                    <p style={styles.subtitle}>
                                        Track completed mock
                                        interviews and review your
                                        performance history.
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(220px, 1fr))",
                                        gap: "20px",
                                        marginBottom: "30px",
                                    }}
                                >
                                    <div style={styles.card}>
                                        <div
                                            style={{
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Total Interviews
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "38px",
                                                fontWeight: "800",
                                                marginTop: "10px",
                                            }}
                                        >
                                            {
                                                interviewHistory.length
                                            }
                                        </div>
                                    </div>

                                    <div style={styles.card}>
                                        <div
                                            style={{
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Average Score
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "38px",
                                                fontWeight: "800",
                                                marginTop: "10px",
                                            }}
                                        >
                                            {averageScore}
                                            <span
                                                style={{
                                                    fontSize:
                                                        "18px",
                                                    color:
                                                        "#94a3b8",
                                                }}
                                            >
                                                /10
                                            </span>
                                        </div>
                                    </div>

                                    <div style={styles.card}>
                                        <div
                                            style={{
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Best Score
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "38px",
                                                fontWeight: "800",
                                                marginTop: "10px",
                                            }}
                                        >
                                            {bestScore}
                                            <span
                                                style={{
                                                    fontSize:
                                                        "18px",
                                                    color:
                                                        "#94a3b8",
                                                }}
                                            >
                                                /10
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        gap: "15px",
                                        flexWrap: "wrap",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <div>
                                        <h2
                                            style={{
                                                margin: 0,
                                            }}
                                        >
                                            Interview History
                                        </h2>

                                        <p
                                            style={{
                                                color: "#94a3b8",
                                                marginBottom: 0,
                                            }}
                                        >
                                            Review your previous
                                            interview reports.
                                        </p>
                                    </div>

                                    {interviewHistory.length >
                                        0 && (
                                            <button
                                                onClick={clearHistory}
                                                style={{
                                                    ...styles.button,
                                                    background:
                                                        "#dc2626",
                                                }}
                                            >
                                                Delete All History
                                            </button>
                                        )}
                                </div>

                                {interviewHistory.length === 0 && (
                                    <div
                                        style={{
                                            ...styles.card,
                                            textAlign: "center",
                                            padding: "50px 25px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "45px",
                                            }}
                                        >
                                            📊
                                        </div>

                                        <h2>
                                            No Interview History
                                        </h2>

                                        <p
                                            style={{
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Complete your first mock
                                            interview to start
                                            tracking your progress.
                                        </p>

                                        <button
                                            onClick={() =>
                                                setCurrentView(
                                                    "interview"
                                                )
                                            }
                                            style={{
                                                ...styles.button,
                                                background:
                                                    "#2563eb",
                                            }}
                                        >
                                            Start Mock Interview
                                        </button>
                                    </div>
                                )}

                                {interviewHistory.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                ...styles.card,
                                                marginBottom:
                                                    "18px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: "20px",
                                                    flexWrap: "wrap",
                                                    alignItems:
                                                        "center",
                                                }}
                                            >
                                                <div>
                                                    <h2
                                                        style={{
                                                            marginTop: 0,
                                                            marginBottom:
                                                                "8px",
                                                        }}
                                                    >
                                                        {item.role}
                                                    </h2>

                                                    <div
                                                        style={{
                                                            color:
                                                                "#94a3b8",
                                                            fontSize:
                                                                "14px",
                                                        }}
                                                    >
                                                        {item.date}
                                                    </div>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            gap: "8px",
                                                            flexWrap:
                                                                "wrap",
                                                            marginTop:
                                                                "12px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                ...styles.badge,
                                                                background:
                                                                    "#172554",
                                                                color:
                                                                    "#bfdbfe",
                                                            }}
                                                        >
                                                            {
                                                                item.difficulty
                                                            }
                                                        </span>

                                                        <span
                                                            style={{
                                                                ...styles.badge,
                                                                background:
                                                                    "#3b0764",
                                                                color:
                                                                    "#e9d5ff",
                                                            }}
                                                        >
                                                            {
                                                                item.category
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color:
                                                                "#94a3b8",
                                                            fontSize:
                                                                "13px",
                                                        }}
                                                    >
                                                        SCORE
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "30px",
                                                            fontWeight:
                                                                "800",
                                                            marginTop:
                                                                "5px",
                                                        }}
                                                    >
                                                        {item.score}
                                                        /10
                                                    </div>
                                                </div>
                                            </div>

                                            <details
                                                style={{
                                                    marginTop:
                                                        "20px",
                                                }}
                                            >
                                                <summary
                                                    style={{
                                                        cursor:
                                                            "pointer",
                                                        fontWeight:
                                                            "700",
                                                    }}
                                                >
                                                    View Complete
                                                    Report
                                                </summary>

                                                <div
                                                    style={{
                                                        ...styles.output,
                                                        marginTop:
                                                            "15px",
                                                    }}
                                                >
                                                    {item.report}
                                                </div>
                                            </details>

                                            <button
                                                onClick={() =>
                                                    deleteHistoryItem(
                                                        item.id
                                                    )
                                                }
                                                style={{
                                                    ...styles.button,
                                                    background:
                                                        "#7f1d1d",
                                                    marginTop:
                                                        "18px",
                                                }}
                                            >
                                                Delete Interview
                                            </button>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Interview;