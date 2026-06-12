import React, { useState, useEffect } from "react";
import TeacherLayout from "../../layout/teacherLayout";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Students() {
    const teacher_id = localStorage.getItem("uuid");

    const [classes, setClasses] = useState([]);
    const [selectedClassCode, setSelectedClassCode] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("gst");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentGstData, setStudentGstData] = useState(null);
    const [studentIndData, setStudentIndData] = useState(null);
    const [studentModuleData, setStudentModuleData] = useState(null);
    const [teacherNotes, setTeacherNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [loadingAssessment, setLoadingAssessment] = useState(false);
    const [selectedStudentName, setSelectedStudentName] = useState("");
    const [feedbackModal, setFeedbackModal] = useState({ show: false, message: "", isError: false });

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch teacher's classes
            const classesQuery = query(
                collection(db, "classes"),
                where("teacher_id", "==", teacher_id)
            );
            const classesSnapshot = await getDocs(classesQuery);
            const teacherClasses = classesSnapshot.docs.map(doc => doc.data());
            setClasses(teacherClasses);

            const teacherClassCodes = teacherClasses.map(c => c.class_code);

            // 2. Fetch all students
            const studentsQuery = query(
                collection(db, "users"),
                where("role", "==", "student")
            );
            const studentsSnapshot = await getDocs(studentsQuery);
            const allStudents = studentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 3. Filter students who belong to any of this teacher's classes
            const myStudents = allStudents.filter(student =>
                teacherClassCodes.includes(student.classCode)
            );

            setStudents(myStudents);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teacher_id) {
            fetchData();
        }
    }, [teacher_id]);

    const getStudentStatus = (student) => {
        if (!student.gst_assessment_attempted) return "PENDING_GST";
        if (student.gst_score >= 14) return "INDEPENDENT";
        if (student.individualized_assessment_attempted) return "COMPLETED_IND";
        return "NEEDS_IND";
    };

    // Filter students based on dropdown selections
    let displayedStudents = selectedClassCode === "ALL"
        ? students
        : students.filter(s => s.classCode === selectedClassCode);

    if (selectedStatus !== "ALL") {
        displayedStudents = displayedStudents.filter(s => getStudentStatus(s) === selectedStatus);
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING_GST":
                return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold">Pending</span>;
            case "INDEPENDENT":
                return <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-bold">Independent</span>;
            case "COMPLETED_IND":
                return <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-bold">Completed</span>;
            case "NEEDS_IND":
                return <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-bold">To Assess</span>;
            default:
                return null;
        }
    };

    const handleViewAssessment = async (student) => {
        setSelectedStudent(student);
        setSelectedStudentName(`${student.first_name} ${student.last_name}`);
        setAssessmentModalOpen(true);
        setActiveTab("gst");
        setLoadingAssessment(true);
        setStudentGstData(null);
        setStudentIndData(null);
        setStudentModuleData(null);
        setTeacherNotes("");

        try {
            const gstDocRef = doc(db, "user_gst", student.id);
            const gstDocSnap = await getDoc(gstDocRef);
            if (gstDocSnap.exists()) {
                setStudentGstData(gstDocSnap.data());
            }

            const indDocRef = doc(db, "user_individual_assessment", student.id);
            const indDocSnap = await getDoc(indDocRef);
            if (indDocSnap.exists()) {
                setStudentIndData(indDocSnap.data());
            }

            const modDocRef = doc(db, "user_learning_modules", student.id);
            const modDocSnap = await getDoc(modDocRef);
            if (modDocSnap.exists()) {
                setStudentModuleData(modDocSnap.data());
                setTeacherNotes(modDocSnap.data().teacher_recommendation || "");
            }
        } catch (error) {
            console.error("Error fetching assessment details:", error);
        } finally {
            setLoadingAssessment(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedStudent) return;
        setIsSavingNotes(true);
        try {
            const modDocRef = doc(db, "user_learning_modules", selectedStudent.id);
            await setDoc(modDocRef, { teacher_recommendation: teacherNotes }, { merge: true });

            setStudentModuleData(prev => ({ ...prev, teacher_recommendation: teacherNotes }));
            setFeedbackModal({ show: true, message: "Teacher notes saved successfully!", isError: false });
        } catch (err) {
            console.error("Error saving notes", err);
            setFeedbackModal({ show: true, message: "Failed to save notes.", isError: true });
        } finally {
            setIsSavingNotes(false);
        }
    };

    return (
        <TeacherLayout>
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Student Management</h1>
                    <p className="text-sm mt-1 text-blue-100">View and manage student accounts and GST results</p>
                </div>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="books"
                    className="w-32"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-6 gap-6">

                    {/* Status Filter */}
                    <div className="flex items-center gap-3">
                        <label className="font-semibold text-gray-700">Status:</label>
                        <select
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            <option value="PENDING_GST">Pending</option>
                            <option value="INDEPENDENT">Independent</option>
                            <option value="NEEDS_IND">To Assess</option>
                            <option value="COMPLETED_IND">Completed</option>
                        </select>
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-3">
                        <label className="font-semibold text-gray-700">Class:</label>
                        <select
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={selectedClassCode}
                            onChange={(e) => setSelectedClassCode(e.target.value)}
                        >
                            <option value="ALL">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.class_code} value={cls.class_code}>
                                    {cls.subject_name} ({cls.class_code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center py-4 text-gray-500">Loading students...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-blue-100 text-blue-800">
                                    <th className="p-3 border-b">Name</th>
                                    <th className="p-3 border-b">Grade Level</th>
                                    <th className="p-3 border-b">Class Code</th>
                                    <th className="p-3 border-b text-center">GST Score</th>
                                    <th className="p-3 border-b text-center">Status</th>
                                    <th className="p-3 border-b text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedStudents.length > 0 ? (
                                    displayedStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 border-b">
                                            <td className="p-3 font-medium">{student.first_name} {student.last_name}</td>
                                            <td className="p-3">{student.grade_level}</td>
                                            <td className="p-3 font-mono text-sm text-gray-600">{student.classCode}</td>
                                            <td className="p-3 text-center font-bold">
                                                {student.gst_assessment_attempted ? `${student.gst_score} / ${student.gst_total_questions || '-'}` : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                {getStatusBadge(getStudentStatus(student))}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleViewAssessment(student)}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition text-sm">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            No students found for this selection.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assessment Details Modal */}
            {assessmentModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 justify-center items-center flex py-10">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
                            <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-xl sticky top-0 z-10">
                                <h2 className="text-2xl font-bold text-blue-800">Assessment Details - {selectedStudentName}</h2>
                                <button
                                    onClick={() => setAssessmentModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-800 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="flex border-b bg-gray-100 sticky top-[80px] z-10">
                                <button
                                    className={`flex-1 py-3 font-semibold text-center transition ${activeTab === 'gst' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    onClick={() => setActiveTab('gst')}
                                >
                                    GST
                                </button>
                                <button
                                    className={`flex-1 py-3 font-semibold text-center transition ${activeTab === 'ind' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    onClick={() => setActiveTab('ind')}
                                >
                                    Individualized Assessment
                                </button>
                                <button
                                    className={`flex-1 py-3 font-semibold text-center transition ${activeTab === 'orp' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    onClick={() => setActiveTab('orp')}
                                >
                                    Oral Reading Profile
                                </button>
                                <button
                                    className={`flex-1 py-3 font-semibold text-center transition ${activeTab === 'modules' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    onClick={() => setActiveTab('modules')}
                                >
                                    Learning Modules
                                </button>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-b-xl">
                                {loadingAssessment ? (
                                    <p className="text-center text-gray-500 py-10">Loading answers...</p>
                                ) : (
                                    <div>
                                        {/* GST Section */}
                                        {activeTab === 'gst' && (
                                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Group Screening Test Data</h3>
                                                {studentGstData ? (
                                                    <div>
                                                        <p className="mb-4 font-semibold text-lg text-blue-700">
                                                            Score: {studentGstData.score} / {studentGstData.total_questions}
                                                        </p>
                                                        <div className="space-y-4">
                                                            {studentGstData.answers?.map((ans, idx) => (
                                                                <div key={idx} className={`p-4 rounded-md border-l-4 ${ans.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                                                    <p className="font-medium text-gray-800"><span className="text-sm text-gray-500">Q{idx + 1}.</span> {ans.question_text}</p>
                                                                    <div className="mt-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        <p><span className="font-semibold text-gray-600">Student's Answer:</span> {ans.selected_text || <span className="italic text-gray-400">No answer</span>}</p>
                                                                        {!ans.is_correct && (
                                                                            <p className="text-green-700 font-semibold"><span className="text-gray-600">Correct Answer:</span> {ans.correct_text}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No GST data found for this student.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Individualized Assessment Section */}
                                        {activeTab === 'ind' && (
                                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Comprehension Questions</h3>
                                                {studentIndData ? (
                                                    <div>
                                                        <div className="space-y-4 mt-4">
                                                            {studentIndData.answers?.map((ans, idx) => (
                                                                <div key={idx} className={`p-4 rounded-md border-l-4 ${ans.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                                                    <p className="font-medium text-gray-800"><span className="text-sm text-gray-500">Q{idx + 1}.</span> {ans.question_text}</p>
                                                                    <p className="text-xs text-gray-500 mt-1 mb-2">Story: {ans.story_title}</p>
                                                                    <div className="mt-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        <p><span className="font-semibold text-gray-600">Student's Answer:</span> {ans.selected_text || <span className="italic text-gray-400">No answer</span>}</p>
                                                                        {!ans.is_correct && (
                                                                            <p className="text-green-700 font-semibold"><span className="text-gray-600">Correct Answer:</span> {ans.correct_text}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {(!studentIndData.answers || studentIndData.answers.length === 0) && (
                                                                <p className="text-gray-500 italic">No comprehension answers recorded.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No individualized assessment data found.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Oral Reading Profile Section */}
                                        {activeTab === 'orp' && (
                                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Overall Profile Metrics</h3>
                                                {selectedStudent.individualized_assessment_attempted ? (
                                                    <div className="space-y-6 text-lg">
                                                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                                                            <span className="font-semibold text-gray-700">Word Reading Level:</span>
                                                            <div className="text-right">
                                                                <span className="font-medium mr-3">{selectedStudent.individualized_score}%</span>
                                                                <span className="text-blue-700 font-bold">{selectedStudent.word_reading_level || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                                                            <span className="font-semibold text-gray-700">Comprehension Level:</span>
                                                            <div className="text-right">
                                                                <span className="font-medium mr-3">{selectedStudent.individualized_comprehension_percentage || 0}%</span>
                                                                <span className="text-blue-700 font-bold">{selectedStudent.comprehension_level || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                                                            <span className="font-semibold text-gray-700">Reading Rate:</span>
                                                            <span className="font-medium text-gray-800">{selectedStudent.word_per_minute || 0} words per minute</span>
                                                        </div>

                                                        <div className="mt-8 pt-4 border-t">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="text-xl font-bold text-gray-800">Final Oral Reading Profile:</h3>
                                                                <span className={`text-2xl font-black ${selectedStudent.oral_reading_profile === 'Independent' ? 'text-green-600' :
                                                                    selectedStudent.oral_reading_profile === 'Instructional' ? 'text-blue-600' : 'text-red-500'
                                                                    }`}>
                                                                    {selectedStudent.oral_reading_profile || "Pending"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">This student has not yet completed the individualized assessment.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Learning Modules Section */}
                                        {activeTab === 'modules' && (
                                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Personalized Learning Modules</h3>

                                                {(studentModuleData?.overview || studentModuleData?.ai_recommendation) ? (
                                                    <div className="mb-6 space-y-6">
                                                        {/* Overview Card */}
                                                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
                                                            <h4 className="font-bold text-blue-800 mb-2 uppercase text-sm tracking-wide">Performance Overview</h4>
                                                            <div className="prose text-gray-800 whitespace-pre-line">
                                                                {studentModuleData.overview || studentModuleData.ai_recommendation}
                                                            </div>
                                                        </div>

                                                        {/* Targeted Strategies */}
                                                        {studentModuleData.targeted_strategies && studentModuleData.targeted_strategies.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide">🎯 Targeted Strategies</h4>
                                                                <div className="grid md:grid-cols-3 gap-4">
                                                                    {studentModuleData.targeted_strategies.map((strat, i) => (
                                                                        <div key={i} className="bg-white border text-sm p-4 rounded-lg shadow-sm">
                                                                            <h5 className="font-bold text-blue-900 mb-1">{strat.title}</h5>
                                                                            <p className="text-gray-600">{strat.description}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Recommended Materials */}
                                                        {studentModuleData.recommended_materials && studentModuleData.recommended_materials.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide">📚 Recommended Materials</h4>
                                                                <div className="grid md:grid-cols-3 gap-4">
                                                                    {studentModuleData.recommended_materials.map((mat, i) => (
                                                                        <div key={i} className="bg-white border text-sm p-4 rounded-lg shadow-sm">
                                                                            <h5 className="font-bold text-green-900 mb-1">{mat.title}</h5>
                                                                            <p className="text-gray-600">{mat.description}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-4 border-t border-gray-100">
                                                            <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Teacher's Additional Recommendation (Optional)</h4>
                                                            <textarea
                                                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[150px]"
                                                                placeholder="Add your manual recommendations, assignments, or notes for the student..."
                                                                value={teacherNotes}
                                                                onChange={(e) => setTeacherNotes(e.target.value)}
                                                            />
                                                            <button
                                                                onClick={handleSaveNotes}
                                                                disabled={isSavingNotes}
                                                                className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition disabled:opacity-50"
                                                            >
                                                                {isSavingNotes ? "Saving..." : "Save Teacher Notes"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-gray-500 italic mb-4">No AI recommendation has been generated yet.</p>
                                                        <p className="text-sm text-gray-400">The student needs to log into their 'Lessons' page to trigger the AI generation.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {feedbackModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform animate-fadeIn">
                        {feedbackModal.isError ? (
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl font-bold">!</span>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {feedbackModal.isError ? "Error" : "Success"}
                        </h2>
                        <p className="text-gray-600 mb-8">{feedbackModal.message}</p>
                        <button
                            onClick={() => setFeedbackModal({ show: false, message: "", isError: false })}
                            className={`w-full font-bold py-3 px-8 rounded-full shadow transition ${feedbackModal.isError ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
