import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [step, setStep] = useState("welcome");
  const [loading, setLoading] = useState(true);
  const [testFlow, setTestFlow] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const auth = getAuth();
  const navigate = useNavigate();

  // ===============================
  // Load Profile Info
  // ===============================
  useEffect(() => {
    const f_name = localStorage.getItem("firstName");
    const uid = localStorage.getItem("uuid");

    if (f_name) setFirstName(f_name);

    if (uid) {
      const storage = getStorage();
      const profilePicRef = ref(storage, `userProfile/${uid}.jpg`);
      getDownloadURL(profilePicRef)
        .then((url) => setProfilePic(url))
        .catch(() => { });
    }
  }, []);

  // ===============================
  //  Stories + Questions
  // ===============================
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();

        // 🚫 Block retake of GST
        if (userData.gst_assessment_attempted === true) {
          setScore(userData.gst_score || 0); // show previous score
          setTotalQuestions(userData.gst_total_questions || 0);
          setStep("result");
          setLoading(false);
          return;
        }

        const grade = userSnap.data().grade_level;

        const storiesRef = collection(
          db,
          "gst_collection",
          `grade_${grade}`,
          "stories"
        );

        const storiesSnap = await getDocs(storiesRef);

        let flow = [];

        for (const storyDoc of storiesSnap.docs) {
          const storyData = storyDoc.data();

          // Add story card
          flow.push({
            type: "story",
            title: storyData.title,
            content: storyData.content,
          });

          // Fetch questions
          const qRef = collection(
            db,
            "gst_collection",
            `grade_${grade}`,
            "stories",
            storyDoc.id,
            "questions"
          );

          const qSnap = await getDocs(qRef);

          const qList = qSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          qList.sort((a, b) => (a.order || 0) - (b.order || 0));

          qList.forEach((q) => {
            flow.push({
              type: "question",
              question: q,
              storyTitle: storyData.title,
              storyId: storyDoc.id,
            });
          });
        }

        setTestFlow(flow);
      } catch (error) {
        console.error("Error loading test:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  // ===============================
  // Helpers
  // ===============================
  const currentCard = testFlow[currentIndex];
  const isQuestion = currentCard?.type === "question";

  const isAnswered =
    isQuestion &&
    answers[currentCard?.question?.id] !== undefined;

  // ===============================
  // Select Answer (only one allowed)
  // ===============================
  const handleSelectChoice = (questionId, choiceIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  // ===============================
  // Calculate Score
  // ===============================
  const calculateScore = async () => {
    let correctCount = 0;
    let totalQs = 0;
    const userAnswers = [];

    testFlow.forEach((item) => {
      if (item.type === "question") {
        totalQs++;
        const qId = item.question.id;
        const selectedIndex = answers[qId];

        const correctIndex = item.question.choices.findIndex(
          (choice) => choice.is_correct === true
        );

        const isCorrect = selectedIndex === correctIndex;
        if (isCorrect) {
          correctCount++;
        }

        userAnswers.push({
          question_id: qId,
          question_text: item.question.question_text || "",
          story_id: item.storyId || null,
          story_title: item.storyTitle || "Unknown Story",
          selected_index: selectedIndex !== undefined ? selectedIndex : null,
          selected_text: selectedIndex !== undefined && item.question.choices[selectedIndex] ? item.question.choices[selectedIndex].text : null,
          is_correct: isCorrect,
          correct_index: correctIndex,
          correct_text: correctIndex !== -1 && item.question.choices[correctIndex] ? item.question.choices[correctIndex].text : null,
        });
      }
    });

    setScore(correctCount);
    setTotalQuestions(totalQs);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        gst_score: correctCount,
        gst_total_questions: totalQs,
        gst_assessment_attempted: true
      });

      console.log("GST score saved:", correctCount);

      // Save detailed answers to user_gst
      await setDoc(doc(db, "user_gst", user.uid), {
        student_id: user.uid,
        student_name: firstName || "Unknown Student",
        score: correctCount,
        total_questions: totalQs,
        answers: userAnswers,
        timestamp: new Date()
      });
      console.log("Detailed GST answers saved to user_gst.");

    } catch (error) {
      console.error("Error saving GST score or detailed answers:", error);
    }
  };
  // ===============================
  // Navigation
  // ===============================
  const handleNext = async () => {
    if (isQuestion && !isAnswered) return;

    if (currentIndex < testFlow.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await calculateScore();
      setStep("result");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-2xl font-semibold">Loading test...</p>
        </div>
      </MainLayout>
    );
  }



  return (
    <MainLayout>

      {/* ================= WELCOME ================= */}
      {step === "welcome" && (
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
          <h1 className="text-5xl font-bold">
            Welcome to HenyoReads, {firstName}!
          </h1>
          <br></br>
          <h1 className="text-3xl font-bold">
            You are about to take the Phil- IRI Group Test Screening (GST) assessment.
          </h1>

          <button
            onClick={() => setStep("quiz")}
            className="px-12 py-2 mt-10 bg-yellow-500 text-2xl rounded-full font-semibold hover:bg-yellow-600 transition"
          >
            Take the GST Test
          </button>
        </div>
      )}

      {/* ================= QUIZ ================= */}
      {step === "quiz" && testFlow.length > 0 && (
        <div className="bg-white text-black p-8 rounded-xl shadow-2xl flex flex-col min-h-screen">

          <div className="flex-1">

            {/* STORY CARD */}
            {currentCard.type === "story" && (
              <>
                <h1 className="text-4xl font-bold mb-6">
                  {currentCard.title}
                </h1>
                <p className="text-2xl leading-relaxed">
                  {currentCard.content}
                </p>
              </>
            )}

            {/* QUESTION CARD */}
            {currentCard.type === "question" && (
              <>
                <p className="mt-6 text-2xl">
                  {currentCard.question.question_text}
                </p>

                <ul className="mt-6 space-y-3">
                  {currentCard.question.choices?.map((choice, idx) => {
                    if (!choice || !choice.text || choice.text.trim() === "") return null;
                    const qId = currentCard.question.id;
                    const isSelected = answers[qId] === idx;

                    return (
                      <li
                        key={idx}
                        onClick={() => handleSelectChoice(qId, idx)}
                        className={`border p-3 rounded-md cursor-pointer transition
                          ${isSelected
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-blue-100"
                          }
                        `}
                      >
                        {choice.text}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handleNext}
              disabled={isQuestion && !isAnswered}
              className={`px-16 py-2 text-xl rounded-full font-semibold transition
                ${isQuestion && !isAnswered
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }
              `}
            >
              {currentIndex < testFlow.length - 1 ? "NEXT" : "SUBMIT"}
            </button>
          </div>
        </div>
      )}

      {/* ================= RESULT ================= */}
      {step === "result" && (
        <div className="bg-blue-600 text-white p-8 rounded-xl shadow-md">

          <h1 className="text-5xl font-bold">
            Group Screening Test Completed
          </h1>

          <p className="text-3xl mt-8">
            Your Raw Score:
          </p>

          <p className="text-6xl font-bold mt-4">
            {score} / {totalQuestions || testFlow.filter((item) => item.type === "question").length}
          </p>

          {/* ================= DECISION LOGIC ================= */}

          {score < 14 ? (
            <>
              <div className="mt-10 bg-yellow-400 text-black p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold">
                  Further Assessment Required
                </h2>

                <p className="mt-4 text-lg">
                  Based on your score, you will undergo an
                  <span className="font-bold"> Individualized Assessment </span>
                  to determine your reading level.
                </p>

                <p className="mt-2 text-lg">
                  You will be given graded reading passages.
                  The first passage will depend on your GST raw score.
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate("/pages/student/assessment")}
                  className="px-16 py-3 bg-white text-blue-600 text-xl rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  Proceed to Individualized Assessment
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-10 bg-green-400 text-black p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold">
                  No Further Testing Required
                </h2>

                <p className="mt-4 text-lg">
                  You will continue receiving regular classroom instruction.
                </p>

                <p className="mt-2 text-lg">
                  No reading remediation is required at this time.
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setStep("dashboardHome")}
                  className="px-16 py-3 bg-white text-blue-600 text-xl rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </MainLayout>
  );
}