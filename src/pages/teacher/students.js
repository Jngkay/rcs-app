import React, { useState, useEffect } from "react";
import TeacherLayout from "../../layout/teacherLayout";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function Students() {
    const teacher_id = localStorage.getItem("uuid");

    const [classes, setClasses] = useState([]);
    const [selectedClassCode, setSelectedClassCode] = useState("ALL");
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

    // Filter students based on dropdown selection
    const displayedStudents = selectedClassCode === "ALL" 
        ? students 
        : students.filter(s => s.classCode === selectedClassCode);

    return (
        <TeacherLayout>
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Students</h1>
                </div>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="books"
                    className="w-32"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Student List</h2>
                    <div className="flex items-center gap-3">
                        <label className="font-semibold text-gray-700">Filter by Class:</label>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-100 text-blue-800">
                                <th className="p-3 border-b">Name</th>
                                <th className="p-3 border-b">Grade Level</th>
                                <th className="p-3 border-b">Class Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedStudents.length > 0 ? (
                                displayedStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 border-b">
                                        <td className="p-3">{student.first_name} {student.last_name}</td>
                                        <td className="p-3">{student.grade_level}</td>
                                        <td className="p-3 font-mono text-sm">{student.classCode}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-4 text-center text-gray-500">
                                        No students found for this selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </TeacherLayout>
    );
}
