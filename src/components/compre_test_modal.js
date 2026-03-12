import React, { useState, useEffect } from "react";
import {
   getFirestore,
   collection,
   addDoc,
   updateDoc,
   doc,
   getDocs,
   deleteDoc
} from "firebase/firestore";

export default function CompreTestModal({ grade, storyData, onClose, onSuccess }) {
  const db = getFirestore();

  const [story, setStory] = useState(
  storyData
    ? {
        title: storyData.title,
        content: storyData.content,
        word_count: storyData.word_count,
      }
    : { title: "", content: "", word_count: "" }
    );

    const [questions, setQuestions] = useState(
    storyData ? storyData.questions || [] : []
    );

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        order: questions.length + 1,
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
  };

  const setCorrectAnswer = (qIndex, choiceIndex) => {
    const updated = [...questions];
    updated[qIndex].choices = updated[qIndex].choices.map((c, i) => ({
      ...c,
      is_correct: i === choiceIndex,
    }));
    setQuestions(updated);
  };

  const deleteQuestion = (qIndex) => {
    const confirmDelete = window.confirm("Delete this question?");
    if (!confirmDelete) return;

    const updated = questions.filter((_, index) => index !== qIndex);

    // 🔥 Recalculate order numbers
    const reordered = updated.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    setQuestions(reordered);
  };

  const handleSave = async () => {
    try {
        if (storyData) {
        // ✏️ EDIT MODE

        const storyRef = doc(
            db,
            "gst_collection",
            grade,
            "stories",
            storyData.id
        );

        // 1️⃣ Update story document
        await updateDoc(storyRef, story);

        // 2️⃣ Delete old questions
        const questionsRef = collection(
            db,
            "gst_collection",
            grade,
            "stories",
            storyData.id,
            "questions"
        );

        const qSnapshot = await getDocs(questionsRef);
        for (const qDoc of qSnapshot.docs) {
            await deleteDoc(qDoc.ref);
        }

        // 3️⃣ Re-add updated questions
        for (const q of questions) {
            await addDoc(questionsRef, q);
        }

        alert("Story updated successfully!");

        } else {
        // ➕ ADD MODE

        const storyRef = await addDoc(
            collection(db, "gst_collection", grade, "stories"),
            story
        );

        for (const q of questions) {
            await addDoc(
            collection(
                db,
                "gst_collection",
                grade,
                "stories",
                storyRef.id,
                "questions"
            ),
            q
            );
        }

        alert("Story added successfully!");
        }

        onSuccess();

    } catch (error) {
        console.error("Error saving story:", error);
    }
}

return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    
    {/* Modal Container */}
    <div className="bg-white w-[95%] max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden min-h-0" style={{ height: "70%" }}>

      {/* Header (Fixed) */}
      <div className="p-4 border-b shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">
            {storyData ? "Edit Story" : "Add New Story"}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 text-lg font-bold"
          >
            ✕
          </button>
        </div>
      </div>

        {/* 🔥 SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 text-black">

             <input
            type="text"
            placeholder="Story Title"
            className="border p-2 w-full mb-3"
            value={story.title}
            onChange={(e) =>
              setStory({ ...story, title: e.target.value })
            }
          />

          <textarea
            placeholder="Story Content"
            className="border p-2 w-full mb-3"
            rows="4"
            value={story.content}
            onChange={(e) =>
              setStory({ ...story, content: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Word Count"
            className="border p-2 w-full mb-3"
            value={story.word_count}
            onChange={(e) =>
              setStory({ ...story, word_count: e.target.value })
            }
          />

          <h3 className="font-semibold mt-4">Questions</h3>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border p-4 mt-3 rounded relative">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">
                  Question {q.order}
                </p>

                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
              <input
                type="text"
                placeholder="Question Text"
                className="border p-2 w-full mb-3"
                value={q.question_text}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].question_text = e.target.value;
                  setQuestions(updated);
                }}
              />

              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                    className="border p-2 flex-1"
                    value={choice.text}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIndex].choices[cIndex].text = e.target.value;
                      setQuestions(updated);
                    }}
                  />

                  <button
                    onClick={() => setCorrectAnswer(qIndex, cIndex)}
                    className={`ml-2 px-3 py-1 rounded ${
                      choice.is_correct
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {choice.is_correct ? "Correct" : "Set Correct"}
                  </button>
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          >
            Add Question
          </button>

        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0 flex justify-end gap-3">
            <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
            >
            Cancel
            </button>

            <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-4 py-2 rounded"
            >
            Save Story
            </button>
        </div>
        </div>
    </div>
    );
}