import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";

export default function Lessons() {
  const [moduleData, setModuleData] = useState(null);
  const [teacherRecommendation, setTeacherRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrGenerateRecommendation = async () => {
      try {
        const uid = localStorage.getItem("uuid");
        if (!uid) {
          setError("User not found.");
          setIsLoading(false);
          return;
        }

        // 1. Check if a learning module already exists
        const moduleRef = doc(db, "user_learning_modules", uid);
        const moduleSnap = await getDoc(moduleRef);

        if (moduleSnap.exists()) {
          const data = moduleSnap.data();
          if (data.overview || data.ai_recommendation) {
            setModuleData(data);
            if (data.teacher_recommendation) {
              setTeacherRecommendation(data.teacher_recommendation);
            }
            setIsLoading(false);
            return;
          }
        }

        // 2. If it doesn't exist, we need to generate it.
        const indAssessmentRef = doc(db, "user_individual_assessment", uid);
        const indAssessmentSnap = await getDoc(indAssessmentRef);

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!indAssessmentSnap.exists() || !userSnap.exists()) {
          setError("You haven't completed the Individualized Assessment yet.");
          setIsLoading(false);
          return;
        }

        const indData = indAssessmentSnap.data();
        const userData = userSnap.data();

        // Extract reading scores
        const wordLevel = userData.individualized_score || "Unknown";
        const compLevel = userData.individualized_comprehension_percentage || "Unknown";
        const wpm = userData.word_per_minute || 0;

        // Extract incorrect answers
        const incorrectAnswers = indData.answers?.filter(ans => !ans.is_correct) || [];

        let mistakesText = "";
        if (incorrectAnswers.length > 0) {
          mistakesText = incorrectAnswers.map(ans =>
            `- Question: "${ans.question_text}" | Student answered: "${ans.selected_text || 'No answer'}" | Correct: "${ans.correct_text}"`
          ).join("\n");
        } else {
          mistakesText = "The student answered all questions correctly.";
        }

        const promptText = `
          You are a friendly and encouraging reading tutor for a grade school student. The student just finished their reading assessment.
          Here are their reading scores:
          - Word Reading Score: ${wordLevel}
          - Comprehension Percentage: ${compLevel}%
          - Reading Rate: ${wpm} WPM

          They struggled with the following questions in their test:
          ${mistakesText}

          Based on these scores and their specific mistakes, generate a helpful reading plan for them.
          CRITICAL INSTRUCTION: You MUST use very simple, easy-to-understand words suitable for an elementary school child. Do not use complex vocabulary or academic jargon. Speak to them directly in a warm, friendly voice.
          
          You MUST respond ONLY with a valid JSON object using the following exact structure without markdown code blocks:
          {
            "overview": "A warm, super simple, encouraging paragraph telling them how they did and gently explaining what they need to work on based on their mistakes.",
            "targeted_strategies": [
              { "title": "Strategy 1 Title (simple words)", "description": "Very easy explanation of an actionable strategy 1" },
              { "title": "Strategy 2 Title (simple words)", "description": "Very easy explanation of an actionable strategy 2" },
              { "title": "Strategy 3 Title (simple words)", "description": "Very easy explanation of an actionable strategy 3" }
            ],
            "recommended_materials": [
              { "title": "Specific Storybook Title 1", "description": "Simple description of why this specific, actual storybook is fun and helps" },
              { "title": "Specific Storybook Title 2", "description": "Simple description of why this specific, actual storybook is fun and helps" },
              { "title": "Specific Storybook Title 3", "description": "Simple description of why this specific, actual storybook is fun and helps" }
            ]
          }
        `;

        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OpenAI API key is missing. Contact Admin.");
        }

        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a comprehensive, expert reading tutor." },
              { role: "user", content: promptText }
            ],
            max_tokens: 1500,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );

        let content = response.data.choices[0].message.content.trim();
        let generatedJson = {};

        try {
          generatedJson = JSON.parse(content);
        } catch (e) {
          console.error("Failed to parse OpenAI JSON response", e);
          generatedJson = {
            overview: content,
            targeted_strategies: [],
            recommended_materials: []
          };
        }

        const newData = {
          student_id: uid,
          overview: generatedJson.overview || generatedJson.ai_recommendation || "Overview unavailable",
          targeted_strategies: generatedJson.targeted_strategies || [],
          recommended_materials: generatedJson.recommended_materials || [],
          teacher_recommendation: "",
          created_at: new Date(),
          updated_at: new Date()
        };

        // Save it to Firestore
        await setDoc(moduleRef, newData);
        setModuleData(newData);
      } catch (err) {
        console.error("Error generating learning module:", err);
        setError("An error occurred while generating your recommendations. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrGenerateRecommendation();
  }, []);

  return (
    <MainLayout>
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div className="pb-15">
          <h1 className="text-4xl font-bold">Your Personalized Learning Plan</h1>
          {/* <p className="mt-2 text-white/80 text-sm font-light">Manage your your personalized learning plan</p> */}
          <p>Check your lessons to improve your reading comprehension.</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2"></h2>

        {isLoading ? (
          <div className="bg-white p-12 rounded-xl shadow text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 text-xl font-semibold">AI is analyzing your performance and generating specialized recommendations...</p>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border-l-4 border-red-500 p-6 text-red-700 text-lg shadow-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Overview Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 p-8 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow">Performance Overview</span>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed font-medium">
                {moduleData?.overview || moduleData?.ai_recommendation}
              </p>
            </div>

            {/* Targeted Strategies - 3 Cards Grid */}
            {moduleData?.targeted_strategies && moduleData.targeted_strategies.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  Targeted Reading Strategies
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {moduleData.targeted_strategies.map((strategy, idx) => (
                    <div key={idx} className="bg-white border-t-4 border-blue-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h4 className="font-bold text-xl text-blue-900 mb-3">{strategy.title}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">{strategy.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Materials - 3 Cards Grid */}
            {moduleData?.recommended_materials && moduleData.recommended_materials.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  Recommended Reading Materials
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {moduleData.recommended_materials.map((material, idx) => (
                    <div key={idx} className="bg-white border-t-4 border-green-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h4 className="font-bold text-xl text-green-900 mb-3">{material.title}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">{material.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Recommendation Box (Conditional) */}
            {teacherRecommendation && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 p-8 rounded-2xl shadow-md mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-yellow-600 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow">Teacher's Note</span>
                </div>
                <div className="prose max-w-none text-gray-800 whitespace-pre-line leading-relaxed text-lg font-medium">
                  {teacherRecommendation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </MainLayout>
  );
}
