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

export default function CompreTestModal({ grade, storyData, onClose, onSuccess, collectionName = "gst_collection" }) {
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
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: null,
    onClose: null
  });

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
    setFeedbackModal({
      show: true,
      title: "Delete Question",
      message: "Are you sure you want to delete this question?",
      isError: false,
      onConfirm: () => executeDeleteQuestion(qIndex)
    });
  };

  const executeDeleteQuestion = (qIndex) => {
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
          String(collectionName),
          String(grade),
          "stories",
          String(storyData.id)
        );

        // 1️⃣ Update story document
        await updateDoc(storyRef, story);

        // 2️⃣ Delete old questions
        const questionsRef = collection(
          db,
          String(collectionName),
          String(grade),
          "stories",
          String(storyData.id),
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

        setFeedbackModal({
          show: true,
          title: "Success",
          message: "Story updated successfully!",
          isError: false,
          onConfirm: null,
          onClose: onSuccess
        });

      } else {
        // ➕ ADD MODE

        const storyRef = await addDoc(
          collection(db, String(collectionName), String(grade), "stories"),
          story
        );

        for (const q of questions) {
          await addDoc(
            collection(
              db,
              String(collectionName),
              String(grade),
              "stories",
              String(storyRef.id),
              "questions"
            ),
            q
          );
        }

        setFeedbackModal({
          show: true,
          title: "Success",
          message: "Story added successfully!",
          isError: false,
          onConfirm: null,
          onClose: onSuccess
        });
      }

    } catch (error) {
      console.error("Error saving story:", error);
      setFeedbackModal({
        show: true,
        title: "Error",
        message: "Failed to save story. Error: " + error.message + "\n\n(If it says 'Missing Permissions', please update your Firestore Rules to allow writing to the individualized_assessment collection!)",
        isError: true,
        onConfirm: null
      });
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
                    className={`ml-2 px-3 py-1 rounded ${choice.is_correct
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

      {/* Feedback / Confirmation Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn" style={{ zIndex: 9999 }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center text-black">
            {feedbackModal.isError ? (
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                !
              </div>
            ) : feedbackModal.onConfirm ? (
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                ?
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            <h2 className="text-xl font-bold mb-2">{feedbackModal.title}</h2>
            <p className="text-gray-600 mb-6">{feedbackModal.message}</p>
            <div className="flex justify-center gap-3">
              {feedbackModal.onConfirm ? (
                <>
                  <button
                    onClick={() => setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null, onClose: null })}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      feedbackModal.onConfirm();
                      setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null, onClose: null });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (feedbackModal.onClose) {
                      feedbackModal.onClose();
                    }
                    setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null, onClose: null });
                  }}
                  className={`px-6 py-2 rounded font-semibold text-white transition ${feedbackModal.isError ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}