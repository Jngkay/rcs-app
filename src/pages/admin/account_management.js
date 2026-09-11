import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

import AdminLayout from "../../layout/adminLayout";

export default function AccountManagement() {
  const db = getFirestore();

  const [selectedRole, setSelectedRole] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state (default 10 rows)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when switching roles or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchTerm]);

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

  // Filter students based on search term
  const filteredStudents = students.filter((s) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const email = (s.email || "").toLowerCase();
    const grade = (s.grade_level || "").toString().toLowerCase();
    return name.includes(query) || email.includes(query) || grade.includes(query);
  });

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter((t) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const name = `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase();
    const email = (t.email || "").toLowerCase();
    const empId = (t.employee_id || "").toString().toLowerCase();
    return name.includes(query) || email.includes(query) || empId.includes(query);
  });

  // Pagination calculations for Students
  const totalStudents = filteredStudents.length;
  const totalStudentPages = Math.ceil(totalStudents / rowsPerPage) || 1;
  const studentStartIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStudents = filteredStudents.slice(studentStartIndex, studentStartIndex + rowsPerPage);

  // Pagination calculations for Teachers
  const totalTeachers = filteredTeachers.length;
  const totalTeacherPages = Math.ceil(totalTeachers / rowsPerPage) || 1;
  const teacherStartIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTeachers = filteredTeachers.slice(teacherStartIndex, teacherStartIndex + rowsPerPage);

  return (
    <AdminLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Management</h1>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md mt-8">
        {/* Toggle Buttons & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedRole("students")}
              className={`px-4 py-2 rounded font-semibold transition ${selectedRole === "students"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-blue-500 hover:bg-blue-400"
                }`}
            >
              Students ({filteredStudents.length})
            </button>

            <button
              onClick={() => setSelectedRole("teachers")}
              className={`px-4 py-2 rounded font-semibold transition ${selectedRole === "teachers"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-blue-500 hover:bg-blue-400"
                }`}
            >
              Teachers ({filteredTeachers.length})
            </button>
          </div>

          {/* Search Bar Input with Icon/Button */}
          <div className="relative flex items-center w-full sm:w-80">
            <input
              type="text"
              placeholder={`Search ${selectedRole === "students" ? "students by name/email/grade" : "teachers by name/email/id"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm shadow-sm"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-gray-500 hover:text-gray-700 font-bold text-sm"
                title="Clear Search"
              >
                ✕
              </button>
            ) : (
              <button className="absolute right-2.5 text-blue-600 p-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        {selectedRole === "students" && (
          <>
            <table className="w-full mt-6 bg-white text-center text-black rounded-lg overflow-hidden">
              <thead className="border-b bg-blue-50 text-blue-900 font-semibold">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Grade Level</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3">{s.grade_level}</td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan="4">
                      {searchTerm ? `No students found matching "${searchTerm}".` : "No students found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Students Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-blue-500/30 gap-4 text-sm text-white">
                <div>
                  Showing <span className="font-bold">{studentStartIndex + 1}</span> to{" "}
                  <span className="font-bold">
                    {Math.min(studentStartIndex + rowsPerPage, totalStudents)}
                  </span>{" "}
                  of <span className="font-bold">{totalStudents}</span> entries
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold">Rows per page:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border border-white/40 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-white"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-medium transition ${currentPage === page
                            ? "bg-white text-blue-600 font-bold shadow-sm"
                            : "border border-white/40 hover:bg-white/20 text-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalStudentPages))}
                      disabled={currentPage === totalStudentPages}
                      className="px-3 py-1 rounded border border-white/40 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Teachers Table */}
        {selectedRole === "teachers" && (
          <>
            <table className="w-full mt-6 bg-white text-center text-black rounded-lg overflow-hidden">
              <thead className="border-b bg-blue-50 text-blue-900 font-semibold">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Employee No.</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.length > 0 ? (
                  paginatedTeachers.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">
                        {t.first_name} {t.last_name}
                      </td>
                      <td className="p-3">{t.email}</td>
                      <td className="p-3">{t.employee_id}</td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan="4">
                      {searchTerm ? `No teachers found matching "${searchTerm}".` : "No teachers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Teachers Pagination Controls */}
            {filteredTeachers.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-blue-500/30 gap-4 text-sm text-white">
                <div>
                  Showing <span className="font-bold">{teacherStartIndex + 1}</span> to{" "}
                  <span className="font-bold">
                    {Math.min(teacherStartIndex + rowsPerPage, totalTeachers)}
                  </span>{" "}
                  of <span className="font-bold">{totalTeachers}</span> entries
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold">Rows per page:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border border-white/40 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-white"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalTeacherPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-medium transition ${currentPage === page
                            ? "bg-white text-blue-600 font-bold shadow-sm"
                            : "border border-white/40 hover:bg-white/20 text-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalTeacherPages))}
                      disabled={currentPage === totalTeacherPages}
                      className="px-3 py-1 rounded border border-white/40 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
