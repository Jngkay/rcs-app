import React, { useState, useEffect } from "react";
import TeacherLayout from "../../layout/teacherLayout";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function Students() {
    const teacher_id = localStorage.getItem("uuid");

    const [classes, setClasses] = useState([]);
    const [selectedClassCode, setSelectedClassCode] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <TeacherLayout>
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Assessment Management</h1>
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
                                                <button className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition text-sm">
                                                    Manage
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
        </TeacherLayout>
    );
}
