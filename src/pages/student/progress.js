import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function Progress() {
  const [userData, setUserData] = useState(null);
  const [gstHistory, setGstHistory] = useState([]);
  const [indHistory, setIndHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
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

        } else {
          setError("No user data found.");
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError("Failed to fetch progress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  return (
    <MainLayout>
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="mt-2 text-blue-100 text-sm font-light">Track your reading improvements over time</p>
        </div>
        <img
          src={require("../../assets/scores.png")} // Using the same icon for now, or use something else
          alt="progress"
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
        <div className="space-y-8">

          {/* GST Score Progression Chart */}
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-500 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-8">
              GST Score Progression
            </h2>

            {gstHistory.length === 0 ? (
              <div className="text-center text-gray-500 italic py-8">
                You haven't taken the Group Screening Test (GST) yet.
              </div>
            ) : (
              <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400 font-semibold border-r border-gray-200">
                  <span>20</span>
                  <span>15</span>
                  <span>10</span>
                  <span>5</span>
                  <span>0</span>
                </div>

                {/* Chart Area */}
                <div className="ml-10 h-64 border-b border-gray-200 pb-2 relative mb-6">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-gray-100 w-full h-0"></div>
                    <div className="border-t border-gray-100 w-full h-0"></div>
                    <div className="border-t border-gray-100 w-full h-0"></div>
                    <div className="border-t border-gray-100 w-full h-0"></div>
                    <div className="border-t border-gray-200 w-full h-0"></div>
                  </div>

                  {/* SVG Line */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                      points={gstHistory.map((attempt, idx) => {
                        const maxScore = attempt.total_questions || 20;
                        const p = Math.min((attempt.score / maxScore) * 100, 100);
                        const x = gstHistory.length > 1 ? 5 + (idx / (gstHistory.length - 1)) * 90 : 50;
                        return `${x},${100 - p}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Markers & Tooltips */}
                  {gstHistory.map((attempt, idx) => {
                    const maxScore = attempt.total_questions || 20;
                    const percentage = Math.min((attempt.score / maxScore) * 100, 100);
                    const xPos = gstHistory.length > 1 ? 5 + (idx / (gstHistory.length - 1)) * 90 : 50;
                    const isLatest = idx === gstHistory.length - 1;

                    return (
                      <React.Fragment key={idx}>
                        <div 
                          className="absolute flex flex-col items-center group cursor-default z-10"
                          style={{ left: `${xPos}%`, bottom: `${percentage}%`, transform: 'translate(-50%, 50%)' }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap pointer-events-none z-20">
                            Score: {attempt.score}/{maxScore}
                          </div>
                          
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125
                            ${isLatest ? 'bg-blue-600' : 'bg-blue-400'}`}>
                          </div>
                        </div>

                        {/* X-axis labels (Try numbers) */}
                        <span 
                          className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${isLatest ? 'text-blue-600' : 'text-gray-500'}`}
                          style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
                        >
                          Try {idx + 1}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Phase 2 Progression Charts */}
          {indHistory.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* WPM Chart */}
              <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-500 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-8 text-center">
                  Reading Fluency (WPM)
                </h2>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400 font-semibold border-r border-gray-200">
                    <span>200</span>
                    <span>150</span>
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="ml-10 h-64 border-b border-gray-200 pb-2 relative mb-6">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-200 w-full h-0"></div>
                    </div>
                    
                    {/* SVG Line */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline 
                        points={indHistory.map((attempt, idx) => {
                          const score = attempt.word_per_minute || 0;
                          const p = Math.min((score / 200) * 100, 100);
                          const x = indHistory.length > 1 ? 5 + (idx / (indHistory.length - 1)) * 90 : 50;
                          return `${x},${100 - p}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#6366f1" // indigo-500
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>

                    {indHistory.map((attempt, idx) => {
                      const score = attempt.word_per_minute || 0;
                      const percentage = Math.min((score / 200) * 100, 100);
                      const xPos = indHistory.length > 1 ? 5 + (idx / (indHistory.length - 1)) * 90 : 50;
                      const isLatest = idx === indHistory.length - 1;
                      
                      return (
                        <React.Fragment key={idx}>
                          <div 
                            className="absolute flex flex-col items-center group cursor-default z-10"
                            style={{ left: `${xPos}%`, bottom: `${percentage}%`, transform: 'translate(-50%, 50%)' }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap pointer-events-none z-20">
                              {score} WPM
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125
                              ${isLatest ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                            </div>
                          </div>

                          <span 
                            className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${isLatest ? 'text-indigo-600' : 'text-gray-500'}`}
                            style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
                          >
                            Try {idx + 1}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Word Reading Score Chart */}
              <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-teal-500 animate-fadeIn delay-75">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-8 text-center">
                  Word Reading Score (%)
                </h2>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400 font-semibold border-r border-gray-200">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  <div className="ml-10 h-64 border-b border-gray-200 pb-2 relative mb-6">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-100 w-full h-0"></div>
                      <div className="border-t border-gray-200 w-full h-0"></div>
                    </div>

                    {/* SVG Line */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline 
                        points={indHistory.map((attempt, idx) => {
                          const score = attempt.individualized_score || 0;
                          const p = Math.min(score, 100);
                          const x = indHistory.length > 1 ? 5 + (idx / (indHistory.length - 1)) * 90 : 50;
                          return `${x},${100 - p}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#14b8a6" // teal-500
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>

                    {indHistory.map((attempt, idx) => {
                      const score = attempt.individualized_score || 0;
                      const percentage = Math.min(score, 100);
                      const xPos = indHistory.length > 1 ? 5 + (idx / (indHistory.length - 1)) * 90 : 50;
                      const isLatest = idx === indHistory.length - 1;
                      
                      return (
                        <React.Fragment key={idx}>
                          <div 
                            className="absolute flex flex-col items-center group cursor-default z-10"
                            style={{ left: `${xPos}%`, bottom: `${percentage}%`, transform: 'translate(-50%, 50%)' }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap pointer-events-none z-20">
                              {score}%
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125
                              ${isLatest ? 'bg-teal-600' : 'bg-teal-400'}`}>
                            </div>
                          </div>

                          <span 
                            className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${isLatest ? 'text-teal-600' : 'text-gray-500'}`}
                            style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
                          >
                            Try {idx + 1}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Reading Profile Summary */}
          {userData?.individualized_assessment_attempted && (
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-500 animate-fadeIn delay-100">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                Current Reading Profile
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </div>
                  <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold mb-1">Final Reading Profile</span>
                  <span className="text-2xl font-extrabold text-gray-800">{userData.oral_reading_profile || "Pending"}</span>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <span className="text-blue-800 uppercase tracking-wide text-xs font-bold mb-1">Reading Fluency</span>
                  <span className="text-2xl font-extrabold text-gray-800">{userData.word_per_minute || 0} <span className="text-sm text-gray-500 font-normal">WPM</span></span>
                </div>

                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="text-emerald-800 uppercase tracking-wide text-xs font-bold mb-1">Comprehension</span>
                  <span className="text-2xl font-extrabold text-gray-800">{userData.individualized_comprehension_percentage || 0}%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </MainLayout>
  );
}
