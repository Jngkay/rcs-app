import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Scores() {
  const [userData, setUserData] = useState(null);
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
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-10">
        <div className="pb-15">
          <h1 className="text-4xl font-bold">Your Score Breakdown</h1>
          {/* <p className="mt-2 text-white/80 text-sm font-light">Manage your your score breakdown</p> */}
          <p>Check how well did do in the assessment</p>
        </div>
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
        <div className="space-y-8 max-w-4xl mx-auto">

          {/* Phase 1: GST Score */}
          {!userData?.gst_assessment_attempted ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500 italic">
              You haven't taken the Group Screening Test (GST) yet.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Phase 1</span>
                Group Screening Test (GST)
              </h2>
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
            </div>
          )}

          {/* Phase 2: Individualized Assessment */}
          {userData?.gst_assessment_attempted && userData?.gst_score < 14 && (
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-500">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">Phase 2</span>
                Individualized Reading Assessment
              </h2>

              {!userData?.individualized_assessment_attempted ? (
                <div className="bg-gray-50 p-6 rounded border text-center text-gray-500 italic">
                  You have not completed the Individualized Assessment yet. Please go to your Dashboard to take it.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                      <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Word Reading Score</span>
                      <span className="text-3xl font-bold text-gray-800">{userData.individualized_score || 0}</span>
                    </div>
                    <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                      <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Comprehension Level</span>
                      <span className="text-3xl font-bold text-gray-800">{userData.individualized_comprehension_percentage || 0}%</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                      <span className="text-indigo-800 uppercase tracking-wide text-xs font-bold block mb-1">Reading Fluency (WPM)</span>
                      <span className="text-3xl font-bold text-gray-800">{userData.word_per_minute || 0} <span className="text-lg text-gray-500 font-normal">Words/Min</span></span>
                    </div>
                    <div className="bg-blue-600 p-5 rounded-lg text-white shadow-md transform hover:scale-105 transition">
                      <span className="uppercase tracking-wide text-blue-200 text-xs font-bold block mb-1">Final Reading Profile</span>
                      <span className="text-2xl font-bold">{userData.oral_reading_profile || "Pending"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </MainLayout>
  );
}
