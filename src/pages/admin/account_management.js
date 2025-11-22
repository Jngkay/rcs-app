import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

import AdminLayout from "../../layout/adminLayout";

export default function AccountManagement() {
  const db = getFirestore();

  const [selectedRole, setSelectedRole] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Fetch users on load
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Separate students and teachers
      setStudents(allUsers.filter((u) => u.role === "student"));
      setTeachers(allUsers.filter((u) => u.role === "teacher"));
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reading Comprehension</h1>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>

    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md mt-8">

      {/* Toggle Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedRole("students")}
          className={`px-4 py-2 rounded ${selectedRole === "students" ? "bg-white text-blue-600" : "bg-blue-500"}`}
        >
          Students
        </button>

        <button
          onClick={() => setSelectedRole("teachers")}
          className={`px-4 py-2 rounded ${selectedRole === "teachers" ? "bg-white text-blue-600" : "bg-blue-500"}`}
        >
          Teachers
        </button>
      </div>

      {/* Students Table */}
      {selectedRole === "students" && (
        <table className="w-full mt-6 bg-white text-center text-black rounded-lg">
          <thead className="border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Grade Level</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.first_name} {s.last_name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.grade_level}</td>
                  <td className="p-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2">Edit</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3" colSpan="4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Teachers Table */}
      {selectedRole === "teachers" && (
        <table className="w-full mt-6 bg-white text-center text-black rounded-lg">
          <thead className="border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Employee No.</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-3">{t.first_name} {t.last_name}</td>
                  <td className="p-3">{t.email}</td>
                  <td className="p-3">{t.employee_id}</td>
                  <td className="p-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2">Edit</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3" colSpan="4">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

    </div>
    </AdminLayout>
  );
}
