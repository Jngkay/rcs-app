import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function Scores() {
  const [userData, setUserData] = useState(null);
  const [userIndData, setUserIndData] = useState(null);
  const [gstHistory, setGstHistory] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("phase1");
  const [activeTryIndex, setActiveTryIndex] = useState(0);
  const [indHistory, setIndHistory] = useState([]);
  const [activeIndTryIndex, setActiveIndTryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const uid = localStorage.getItem("uuid");
        if (!uid) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
          const indRef = doc(db, "user_individual_assessment", uid);
          const indSnap = await getDoc(indRef);
          if (indSnap.exists()) {
            setUserIndData(indSnap.data());
          }

          // Fetch historical GST attempts
          const gstAttemptsRef = collection(db, "user_gst_attempts");
          const q = query(gstAttemptsRef, where("student_id", "==", uid));
          const gstAttemptsSnap = await getDocs(q);
          let attempts = [];
          gstAttemptsSnap.forEach((doc) => attempts.push(doc.data()));
          attempts.sort((a, b) => {
              const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
              const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
              return tA - tB;
          });
          setGstHistory(attempts);
          if (attempts.length > 0) {
            setActiveTryIndex(attempts.length - 1);
          }

          // Fetch historical IND attempts
          const indAttemptsRef = collection(db, "user_ind_attempts");
          const qInd = query(indAttemptsRef, where("student_id", "==", uid));
          const indAttemptsSnap = await getDocs(qInd);
          let indAttempts = [];
          indAttemptsSnap.forEach((doc) => indAttempts.push(doc.data()));
          indAttempts.sort((a, b) => {
              const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
              const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
              return tA - tB;
          });
          setIndHistory(indAttempts);
          if (indAttempts.length > 0) {
            setActiveIndTryIndex(indAttempts.length - 1);
          }

        } else {
          setError("No user data found.");
        }
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to fetch score data.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <MainLayout>
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Score Breakdown</h1>
          {/* <p className="mt-2 text-white/80 text-sm font-light">View and manage student accounts and GST results</p> */}
          <p className="text-sm mt-1 text-blue-100">Check how well did you do in the assessment</p>
        </div>
        <img
          src={require("../../assets/scores.png")}
          alt="student"
          className="w-32 drop-shadow-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-sm text-red-700">
          {error}
        </div>
      ) : (
        <div>

          {/* Main Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-xl overflow-hidden shadow-sm">
            <button
              className={`flex-1 py-4 font-bold text-lg text-center transition-colors ${activeMainTab === 'phase1' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveMainTab('phase1')}
            >
              Phase 1: Group Screening Test
            </button>
            <button
              className={`flex-1 py-4 font-bold text-lg text-center transition-colors ${activeMainTab === 'phase2' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveMainTab('phase2')}
            >
              Phase 2: Individualized Assessment
            </button>
          </div>

          <div className="min-h-[400px]">
            {/* ================= PHASE 1 CONTENT ================= */}
            {activeMainTab === 'phase1' && (
              <>
                {!userData?.gst_assessment_attempted ? (
                  <div className="bg-white p-8 rounded-b-xl shadow-md text-center text-gray-500 italic">
                    You haven't taken the Group Screening Test (GST) yet.
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-b-xl shadow-md border-t-4 border-blue-500 animate-fadeIn">
                    
                    {gstHistory.length > 0 ? (
                      <>
                        {/* Internal History Tabs */}
                        {gstHistory.length > 1 && (
                          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-md w-fit">
                            {gstHistory.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTryIndex(idx)}
                                className={`px-6 py-2 font-bold rounded-md transition ${activeTryIndex === idx ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                              >
                                Try {idx + 1} {idx === gstHistory.length - 1 ? "(Latest)" : ""}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 items-center">
                          <div className="flex flex-col">
                            <span className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Raw Score</span>
                            <span className="text-6xl font-extrabold text-blue-600 mt-2">
                              {gstHistory[activeTryIndex]?.score} <span className="text-3xl text-gray-400">/ {gstHistory[activeTryIndex]?.total_questions || 20}</span>
                            </span>
                          </div>
                          <div>
                            {gstHistory[activeTryIndex]?.score >= 14 ? (
                              <div className="bg-green-50 p-6 rounded-lg border border-green-100 h-full flex flex-col justify-center">
                                <h3 className="font-bold text-green-800 text-xl mb-2">Excellent Result!</h3>
                                <p className="text-green-700">You passed the threshold for the GST. You will continue receiving regular classroom instruction without needing further reading remediation.</p>
                              </div>
                            ) : (
                              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 h-full flex flex-col justify-center">
                                <h3 className="font-bold text-yellow-800 text-xl mb-2">Further Assessment Required</h3>
                                <p className="text-yellow-700">Based on your score, you were routed to take the Individualized Reading Assessment to better map your reading abilities.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      // Fallback just in case history is completely empty for an older record
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col">
                          <span className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Raw Score</span>
                          <span className="text-6xl font-extrabold text-blue-600 mt-2">
                            {userData.gst_score} <span className="text-3xl text-gray-400">/ {userData.gst_total_questions}</span>
                          </span>
                        </div>
                        <div>
                          {userData.gst_score >= 14 ? (
                            <div className="bg-green-50 p-6 rounded-lg border border-green-100 h-full flex flex-col justify-center">
                              <h3 className="font-bold text-green-800 text-xl mb-2">Excellent Result!</h3>
                              <p className="text-green-700">You passed the threshold for the GST.</p>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 h-full flex flex-col justify-center">
                              <h3 className="font-bold text-yellow-800 text-xl mb-2">Further Assessment Required</h3>
                              <p className="text-yellow-700">You were routed to take the Individualized Reading Assessment.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ================= PHASE 2 CONTENT ================= */}
            {activeMainTab === 'phase2' && (
              <div className="bg-white p-8 rounded-b-xl shadow-md border-t-4 border-indigo-500 animate-fadeIn">
                {!(userData?.gst_assessment_attempted && userData?.gst_score < 14) ? (
                  <div className="bg-gray-50 p-6 rounded border text-center text-gray-500 italic">
                    You do not need to take the Individualized Assessment based on your GST score.
                  </div>
                ) : !userData?.individualized_assessment_attempted ? (
                  <div className="bg-gray-50 p-6 rounded border text-center text-gray-500 italic">
                    You have not completed the Individualized Assessment yet. Please go to your Dashboard to take it.
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-3">
                      Individualized Reading Assessment Results
                    </h2>

                    {indHistory.length > 1 && (
                      <div className="flex gap-2 mb-8 bg-indigo-50 p-1 rounded-md w-fit">
                        {indHistory.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveIndTryIndex(idx)}
                            className={`px-6 py-2 font-bold rounded-md transition ${activeIndTryIndex === idx ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            Try {idx + 1} {idx === indHistory.length - 1 ? "(Latest)" : ""}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                          <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Word Reading Score</span>
                          <span className="text-3xl font-bold text-gray-800">{indHistory[activeIndTryIndex]?.individualized_score || userData.individualized_score || 0}</span>
                        </div>
                        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                          <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Comprehension Level</span>
                          <span className="text-3xl font-bold text-gray-800">{indHistory[activeIndTryIndex]?.individualized_comprehension_percentage || userData.individualized_comprehension_percentage || 0}%</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                          <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Reading Fluency (WPM)</span>
                          <span className="text-3xl font-bold text-gray-800">{indHistory[activeIndTryIndex]?.word_per_minute || userData.word_per_minute || 0} <span className="text-lg text-gray-500 font-normal">Words/Min</span></span>
                        </div>
                        <div className="bg-blue-600 p-5 rounded-lg text-white shadow-md transform hover:scale-105 transition">
                          <span className="uppercase tracking-wide text-blue-200 text-xs font-bold block mb-1">Final Reading Profile</span>
                          <span className="text-2xl font-bold">{indHistory[activeIndTryIndex]?.oral_reading_profile || userData.oral_reading_profile || "Pending"}</span>
                        </div>
                      </div>

                      {(indHistory[activeIndTryIndex]?.audio_recording_url || userIndData?.audio_recording_url) && (
                        <div className="col-span-1 md:col-span-2 mt-4 bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Your Reading Recording</h3>
                          <audio controls src={indHistory[activeIndTryIndex]?.audio_recording_url || userIndData?.audio_recording_url} className="w-full max-w-md mx-auto" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </MainLayout>
  );
}
