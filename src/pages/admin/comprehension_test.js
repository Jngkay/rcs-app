import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/adminLayout";
import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore";

export default function ComprehensionTest() {
  const db = getFirestore();

  const [grade, setGrade] = useState("grade_4");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStories = async () => {
    setLoading(true);
    setStories([]);

    try {
      const storiesRef = collection(db, "gst_collection", grade, "stories");
      const storySnapshot = await getDocs(storiesRef);

      const storyList = [];

      for (const storyDoc of storySnapshot.docs) {
        const storyData = storyDoc.data();

        // Fetch questions
        const questionsRef = collection(
          db,
          "gst_collection",
          grade,
          "stories",
          storyDoc.id,
          "questions"
        );

        const qSnapshot = await getDocs(questionsRef);
        const questions = qSnapshot.docs.map((q) => ({
          id: q.id,
          ...q.data(),
        }));

        storyList.push({
          id: storyDoc.id,
          ...storyData,
          questions: questions,
        });
      }

      setStories(storyList);
    } catch (error) {
      console.error("Error fetching comprehension tests:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, [grade]);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Comprehension Test</h1>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>

      {/* Grade Selector */}
      <div className="mb-4">
        <label className="font-semibold text-black">Select Grade Level:</label>
        <select
          className="border p-2 ml-3 rounded"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="grade_4">Grade 4</option>
          <option value="grade_5">Grade 5</option>
          <option value="grade_6">Grade 6</option>
        </select>
      </div>

      <button>
        Add Story
      </button>

      {/* Content Section */}
      {loading && <p className="text-black">Loading comprehension tests...</p>}

      {!loading && stories.length === 0 && (
        <p className="text-gray-600">No tests found for this grade.</p>
      )}

      <div className="space-y-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-5 border rounded-lg shadow-sm bg-white text-black"
          >
            <h2 className="text-xl font-bold mb-2">{story.title}</h2>

            <p className="text-gray-700 mb-3">
              {story.content}
            </p>

            <p className="mb-2">
              <strong>Word Count:</strong> {story.word_count}
            </p>

            <h3 className="font-semibold mt-4">Questions</h3>

            <div className="mt-2 space-y-3">
              {story.questions.map((q) => (
             <div key={q.id} className="border p-3 rounded">
                <p className="font-semibold text-lg">
                  {q.order}. {q.question_text}
                </p>

                <ul className="mt-2 space-y-1">
                  {[0, 1, 2, 3].map((i) => {
                    const choice = q.choices[i];
                    if (!choice) return null;

                    return (
                      <li
                        key={i}
                        className={`p-2 rounded border ${
                          choice.is_correct
                            ? "bg-green-100 border-green-500 font-semibold"
                            : "bg-gray-100"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {choice.text}

                        {choice.is_correct && (
                          <span className="ml-2 text-green-700 font-bold">(Correct Answer)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
