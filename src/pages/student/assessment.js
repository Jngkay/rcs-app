import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import useRecorder from "./use_recorder";
import SpeechResult from "./assessment_result";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Assessment() {
  const {
    isRecording,
    isProcessing,
    result,
    error,
    startRecording,
    stopRecording,
  } = useRecorder();

  const [paragraph, setParagraph] = useState("Loading...");

  useEffect(() => {
    const fetchParagraph = async () => {
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
          
          // Parse grade level safely
          const currentGrade = parseInt((userData.grade_level || "4").toString().replace(/[^0-9]/g, '')) || 4;

          let targetGrade = currentGrade;

          // Logic for individualized assessment based on GST raw score
          if (gstScore >= 0 && gstScore <= 7) {
            targetGrade = currentGrade - 3;
          } else if (gstScore >= 8 && gstScore <= 13) {
            targetGrade = currentGrade - 2;
          }

          // Bound the target grade to a minimum of 2 based on the initial Firestore snapshot lowest passage
          if (targetGrade < 2) {
            targetGrade = 2;
          }

          // Fetch the document matching the target grade ID
          const passageRef = doc(db, "individualized_assessment", targetGrade.toString());
          const passageSnap = await getDoc(passageRef);

          if (passageSnap.exists()) {
            const docData = passageSnap.data();
            setParagraph(docData.passage || docData.content || docData.text || "No passage content found in document.");
          } else {
            setParagraph(`Passage not found for calculated target grade level ${targetGrade}.`);
          }
        } else {
          setParagraph("User data could not be loaded.");
        }
      } catch (error) {
        console.error("Error fetching individualized passage:", error);
        setParagraph("Artificial intelligence is transforming the way people interact with technology.");
      }
    };

    fetchParagraph();
  }, []);

  return (
    <MainLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment</h1>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>
      {/* <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4"> */}
      <div className="w-full bg-white shadow-md rounded-lg p-8 mt-4">

        {/* Title */}
        {/* <h1 className="text-3xl font-bold text-center text-blue-700"> */}
        {/* Echo Analyzer */}
        {/* </h1>
                <p className="text-center text-gray-500 text-sm tracking-widest mt-1 mb-6">
                ADVANCED SPEECH-TO-TEXT PROCESSING
                </p> */}

        {/* Divider */}
        <div className="border-t border-blue-500 mb-6"></div>

        {/* Reading Section */}
        <div className="border rounded-md p-6 bg-gray-50">

          {/* Header */}
          <h2 className="text-blue-700 font-semibold text-lg border-l-4 border-blue-500 pl-3 mb-4">
            Read the paragraph below
          </h2>

          {/* Paragraph */}
          <div className="bg-gray-100 border rounded-md p-4 text-gray-700 text-sm mb-6">
            {paragraph}
          </div>

          {/* Button */}
          <div className="flex justify-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold transition"
              >
                {isProcessing ? 'Processing...' : 'START READING'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-semibold animate-pulse"
              >
                STOP RECORDING
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 text-red-500 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        {result && paragraph !== "Loading..." && (
          <div className="mt-6">
            <SpeechResult originalText={paragraph} spokenText={result} />
          </div>
        )}

        {/* </div> */}
      </div>
    </MainLayout>
  );
}
