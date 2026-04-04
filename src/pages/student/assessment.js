import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import useRecorder from "./use_recorder";
import SpeechResult from "./assessment_result";
import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Assessment() {
  const {
    isRecording,
    isProcessing,
    result,
    error,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  const [testStep, setTestStep] = useState("reading"); // "reading" | "questions" | "analysis"
  const [paragraph, setParagraph] = useState("Loading...");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyId, setStoryId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comprehensionScore, setComprehensionScore] = useState(0);

  const [oralReadingScore, setOralReadingScore] = useState(0);
  const [readingRate, setReadingRate] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchParagraphAndQuestions = async () => {
      try {
        const uid = localStorage.getItem("uuid");
        if (!uid) {
          setParagraph("User not found.");
          return;
        }

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const gstScore = userData.gst_score || 0;

          const currentGrade = parseInt((userData.grade_level || "4").toString().replace(/[^0-9]/g, '')) || 4;
          let targetGrade = currentGrade;

          if (gstScore >= 0 && gstScore <= 7) {
            targetGrade = currentGrade - 3;
          } else if (gstScore >= 8 && gstScore <= 13) {
            targetGrade = currentGrade - 2;
          }

          if (targetGrade < 2) {
            targetGrade = 2;
          }

          const storiesRef = collection(db, "individualized_assessment", targetGrade.toString(), "stories");
          const storiesSnap = await getDocs(storiesRef);

          if (!storiesSnap.empty) {
            // Just grab the first available story under that grade level
            const storyDoc = storiesSnap.docs[0];
            const docData = storyDoc.data();
            setParagraph(docData.passage || docData.content || docData.text || docData.paragraph || "No passage content found in document.");
            setStoryTitle(docData.title || "Unknown Story");
            setStoryId(storyDoc.id);

            // Fetch questions from that specific story's subcollection
            const qRef = collection(db, "individualized_assessment", targetGrade.toString(), "stories", storyDoc.id, "questions");
            const qSnap = await getDocs(qRef);
            let qList = qSnap.docs.map(q => ({ id: q.id, ...q.data() }));
            qList.sort((a, b) => (a.order || 0) - (b.order || 0));
            setQuestions(qList);
          } else {
            setParagraph(`No stories found for calculated target grade level ${targetGrade}.`);
          }
        } else {
          setParagraph("User data could not be loaded.");
        }
      } catch (error) {
        console.error("Error fetching individualized passage:", error);
        setParagraph("Artificial intelligence is transforming the way people interact with technology.");
      }
    };

    fetchParagraphAndQuestions();
  }, []);

  const handleRetry = () => {
    resetRecording();
  };

  const handleSaveResult = async (oralScore, wpm) => {
    setOralReadingScore(parseFloat(oralScore) || 0);
    setReadingRate(wpm || 0);

    try {
      const uid = localStorage.getItem("uuid");
      if (!uid) return;

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        individualized_score: parseFloat(oralScore),
        word_per_minute: wpm,
        individualized_assessment_attempted: true
      });

      if (questions.length > 0) {
        setTestStep("questions");
      } else {
        setTestStep("analysis"); // Auto-bypass if no questions exist
      }
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Failed to save result. Please try again.");
    }
  };

  const currentQuestion = questions[currentQIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleSelectChoice = (qId, choiceIndex) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceIndex }));
  };

  const getWordReadingLevel = (score) => {
    if (score >= 97) return "Independent";
    if (score >= 90) return "Instructional";
    return "Frustration";
  };

  const getComprehensionLevel = (score) => {
    if (score >= 80) return "Independent";
    if (score >= 59) return "Instructional";
    return "Frustration";
  };

  const getOverallProfile = (wordLevel, compLevel) => {
    // Taking the lowest bound constraint automatically
    const levels = { "Independent": 3, "Instructional": 2, "Frustration": 1 };
    const minVal = Math.min(levels[wordLevel] || 1, levels[compLevel] || 1);
    if (minVal === 3) return "Independent";
    if (minVal === 2) return "Instructional";
    return "Frustration";
  };

  const calculateComprehensionScore = async () => {
    let correctCount = 0;
    const userAnswers = [];

    questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      const correctIndex = q.choices?.findIndex((choice) => choice.is_correct === true);
      const isCorrect = selectedIndex === correctIndex;

      if (isCorrect) {
        correctCount++;
      }

      userAnswers.push({
        question_id: q.id,
        question_text: q.question_text || "",
        story_id: storyId || null,
        story_title: storyTitle || "Unknown Story",
        selected_index: selectedIndex !== undefined ? selectedIndex : null,
        selected_text: selectedIndex !== undefined && q.choices[selectedIndex] ? q.choices[selectedIndex].text : null,
        is_correct: isCorrect,
        correct_index: correctIndex,
        correct_text: correctIndex !== -1 && q.choices[correctIndex] ? q.choices[correctIndex].text : null,
      });
    });
    setComprehensionScore(correctCount);

    const percentage = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

    const wordLevel = getWordReadingLevel(oralReadingScore);
    const compLevel = getComprehensionLevel(percentage);
    const overall = getOverallProfile(wordLevel, compLevel);

    setProfileData({
      wordReadingLevel: wordLevel,
      comprehensionLevel: compLevel,
      overallProfile: overall,
    });

    try {
      const uid = localStorage.getItem("uuid");
      const firstName = localStorage.getItem("firstName") || "Unknown Student";
      if (!uid) return;

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        individualized_comprehension_score: correctCount,
        individualized_comprehension_percentage: percentage,
        word_reading_level: wordLevel,
        comprehension_level: compLevel,
        oral_reading_profile: overall
      });

      await setDoc(doc(db, "user_individual_assessment", uid), {
        student_id: uid,
        student_name: firstName,
        timestamp: new Date(),
        // word_reading_score: oralReadingScore,
        // word_reading_level: wordLevel,
        // comprehension_score: correctCount,
        // comprehension_level: compLevel,
        // reading_rate: readingRate,
        // overall_profile: overall,
        answers: userAnswers
      });
      console.log("Detailed individual assessment stored.");

    } catch (err) {
      console.error("Error saving comprehension score:", err);
    }
  };

  const handleNextQuestion = async () => {
    if (!isAnswered) return;
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      await calculateComprehensionScore();
      setTestStep("analysis");
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 3000);
    }
  };

  return (
    <MainLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Individualized Assessment</h1>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>

      <div className="w-full bg-white shadow-lg rounded-lg p-8 mt-6 min-h-[500px] flex flex-col">
        {testStep === "reading" && (
          <>
            <div className="border-t border-blue-500 mb-6"></div>

            <div className="border rounded-md p-6 bg-gray-50 flex-1">
              <h2 className="text-blue-700 font-semibold text-lg border-l-4 border-blue-500 pl-3 mb-4">
                Read the paragraph below
              </h2>

              <div className="bg-white shadow-inner border rounded-md p-6 text-gray-800 text-lg md:text-xl leading-relaxed mb-8">
                {paragraph}
              </div>

              <div className="flex justify-center mt-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 text-lg rounded-full font-semibold transition shadow-md"
                  >
                    {isProcessing ? 'Processing Speech...' : 'START READING'}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 text-lg rounded-full font-semibold animate-pulse shadow-md"
                  >
                    STOP RECORDING
                  </button>
                )}
              </div>

              {error && <div className="mt-6 text-red-500 font-semibold text-center">{error}</div>}
            </div>

            {result && paragraph !== "Loading..." && (
              <div className="mt-8">
                <SpeechResult
                  originalText={paragraph}
                  spokenText={result}
                  duration={duration}
                  onSave={handleSaveResult}
                  onRetry={handleRetry}
                />
              </div>
            )}
          </>
        )}

        {testStep === "questions" && questions.length > 0 && currentQuestion && (
          <div className="flex flex-col flex-1 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              Comprehension Question {currentQIndex + 1} of {questions.length}
            </h2>
            <p className="mt-2 text-2xl mb-8 leading-relaxed font-medium">
              {currentQuestion.question_text}
            </p>

            <ul className="space-y-4 flex-1 mb-8">
              {currentQuestion.choices?.map((choice, idx) => {
                if (!choice || !choice.text || choice.text.trim() === "") return null;
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <li
                    key={idx}
                    onClick={() => handleSelectChoice(currentQuestion.id, idx)}
                    className={`border-2 p-5 rounded-lg cursor-pointer transition text-xl shadow-sm ${isSelected
                        ? "bg-blue-500 text-white border-blue-500 shadow-md"
                        : "hover:bg-blue-50 bg-gray-50 border-gray-200"
                      }`}
                  >
                    {choice.text}
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-end mt-auto pt-6 border-t border-gray-100">
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className={`px-12 py-4 text-xl rounded-full font-semibold transition shadow-md ${!isAnswered
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {currentQIndex < questions.length - 1 ? "NEXT QUESTION" : "SUBMIT ANSWERS"}
              </button>
            </div>
          </div>
        )}

        {testStep === "analysis" && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center animate-fadeIn w-full">

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-3xl font-bold text-gray-700">Analyzing Performance...</h2>
                <p className="text-gray-500 mt-2">Correlating Word Reading and Comprehension metrics...</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 transform transition-all duration-700 ease-out">
                <h2 className="text-3xl font-bold text-center text-blue-800 mb-8 pb-4 border-b">
                  Oral Reading Profile
                </h2>

                <div className="space-y-6 text-xl">
                  <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-700">Word reading score:</span>
                    <div className="text-right">
                      <span className="font-medium mr-4">{oralReadingScore}%</span>
                      <span className="text-blue-700 font-bold">{profileData.wordReadingLevel}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-700">Comprehension score:</span>
                    <div className="text-right">
                      <span className="font-medium mr-4">
                        {questions.length > 0 ? Math.round((comprehensionScore / questions.length) * 100) : 0}%
                      </span>
                      <span className="text-blue-700 font-bold">{profileData.comprehensionLevel}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-700">Reading Rate:</span>
                    <span className="font-medium text-gray-800">{readingRate} words per minute</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Overall Profile:</h3>
                    <span className={`text-4xl font-black ${profileData.overallProfile === 'Independent' ? 'text-green-600' :
                        profileData.overallProfile === 'Instructional' ? 'text-blue-600' : 'text-red-500'
                      }`}>
                      {profileData.overallProfile}
                    </span>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <button
                    onClick={() => navigate("../pages/student/dashboard")}
                    className="w-full sm:w-auto px-12 py-4 bg-green-600 text-white text-xl rounded-full font-bold hover:bg-green-700 transition shadow-xl"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </MainLayout>
  );
}
