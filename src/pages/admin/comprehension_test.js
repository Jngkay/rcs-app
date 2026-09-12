import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/adminLayout";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import CompreTestModal from "../../components/compre_test_modal";

export default function ComprehensionTest() {
  const db = getFirestore();

  const [grade, setGrade] = useState("grade_4");
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: null
  });

  const filteredStories = stories.filter((story) => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = story.title ? story.title.toLowerCase().includes(searchLower) : false;
    const contentMatch = story.content ? story.content.toLowerCase().includes(searchLower) : false;
    return titleMatch || contentMatch;
  });

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

  const handleDeleteStory = (storyId) => {
    setFeedbackModal({
      show: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this story?",
      isError: false,
      onConfirm: () => executeDeleteStory(storyId)
    });
  };

  const executeDeleteStory = async (storyId) => {
    try {
      // 1️⃣ Delete all questions subcollection
      const questionsRef = collection(
        db,
        "gst_collection",
        grade,
        "stories",
        storyId,
        "questions"
      );

      const questionSnapshot = await getDocs(questionsRef);

      for (const qDoc of questionSnapshot.docs) {
        await deleteDoc(qDoc.ref);
      }

      // 2️⃣ Delete story document
      await deleteDoc(
        doc(db, "gst_collection", grade, "stories", storyId)
      );

      setFeedbackModal({
        show: true,
        title: "Success",
        message: "Story deleted successfully!",
        isError: false,
        onConfirm: null
      });

      // 3️⃣ Refresh list
      fetchStories();

    } catch (error) {
      console.error("Error deleting story:", error);
      setFeedbackModal({
        show: true,
        title: "Error",
        message: "Failed to delete story: " + error.message,
        isError: true,
        onConfirm: null
      });
    }
  };

  useEffect(() => {
    fetchStories();
  }, [grade]);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Group Screening Test Passages</h1>
          <p className="text-sm mt-1 text-blue-100">Manage GST passages</p>
        </div>
        <img
          src={require("../../assets/book.png")}
          alt="book"
          className="w-32 drop-shadow-md"
        />
      </div>

      {/* Top Bar Controls: Grade Selector, Search Bar & Add Story Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="font-semibold text-black text-sm mr-2">Select Grade Level:</label>
            <select
              className="border border-slate-300 p-2 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="grade_4">Grade 4</option>
              <option value="grade_5">Grade 5</option>
              <option value="grade_6">Grade 6</option>
            </select>
          </div>

          {/* Search Input Bar with Icon / Button */}
          <div className="relative flex items-center w-full sm:w-72">
            <input
              type="text"
              placeholder="Search stories by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2] text-sm shadow-sm"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-sm"
                title="Clear Search"
              >
                ✕
              </button>
            ) : (
              <button className="absolute right-2.5 text-[#0580b2] p-1 pointer-events-none" title="Search">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <span>+ Add Story</span>
        </button>
      </div>

      {showModal && (
        <CompreTestModal
          grade={grade}
          storyData={selectedStory}   // null if adding
          onClose={() => {
            setShowModal(false);
            setSelectedStory(null);
          }}
          onSuccess={() => {
            fetchStories();
            setShowModal(false);
            setSelectedStory(null);
          }}
        />
      )}

      {/* Centered Loader Icon Only */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0580b2] rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && stories.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500 shadow-sm">
          No story tests found for this grade. Click "+ Add Story" to create one.
        </div>
      )}

      {!loading && stories.length > 0 && filteredStories.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500 shadow-sm">
          No stories found matching "{searchTerm}".
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
          >
            <div>
              {/* Passage Title */}
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug mb-3">
                {story.title}
              </h3>
              {/* Word Count */}
              <p className="text-sm text-slate-600 mb-6">
                <span className="font-semibold text-slate-800">Word Count:</span> {story.word_count || 0}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedStory(story);
                  setShowModal(true);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded transition-all"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteStory(story.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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
                    onClick={() => setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null })}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      feedbackModal.onConfirm();
                      setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setFeedbackModal({ show: false, title: "", message: "", isError: false, onConfirm: null })}
                  className={`px-6 py-2 rounded font-semibold text-white transition ${feedbackModal.isError ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
