import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

import AdminLayout from "../../layout/adminLayout";

export default function AccountManagement() {
  const db = getFirestore();

  const [selectedRole, setSelectedRole] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  // Edit & Delete Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const [feedback, setFeedback] = useState({ show: false, message: "", isError: false });

  // Pagination state (default 10 rows)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when switching roles, searching, or filtering grade
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchTerm, selectedGrade]);

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    const rawGrade = (user.grade_level || user.grade || "").toString();
    const numMatch = rawGrade.match(/\d+/);
    const gradeVal = numMatch ? numMatch[0] : "4";

    setEditingUser({
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || (selectedRole === "students" ? "student" : "teacher"),
      grade_level: gradeVal,
      employee_id: user.employee_id || ""
    });
    setEditModalOpen(true);
  };

  // Save Edit Handler
  const handleSaveEdit = async () => {
    if (!editingUser || !editingUser.id) return;
    try {
      const userRef = doc(db, "users", editingUser.id);
      const updateData = {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
      };

      if (editingUser.role === "student") {
        const parsedGrade = parseInt(editingUser.grade_level, 10);
        updateData.grade_level = isNaN(parsedGrade) ? editingUser.grade_level : parsedGrade;
      } else if (editingUser.role === "teacher") {
        updateData.employee_id = editingUser.employee_id;
      }

      await updateDoc(userRef, updateData);
      setEditModalOpen(false);
      setEditingUser(null);
      setFeedback({ show: true, message: "Account updated successfully!", isError: false });
      setTimeout(() => setFeedback({ show: false, message: "", isError: false }), 3000);
    } catch (err) {
      console.error("Error updating user:", err);
      setFeedback({ show: true, message: "Failed to update account: " + err.message, isError: true });
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (user) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingUser || !deletingUser.id) return;
    try {
      await deleteDoc(doc(db, "users", deletingUser.id));
      setDeleteModalOpen(false);
      setDeletingUser(null);
      setFeedback({ show: true, message: "Account deleted successfully!", isError: false });
      setTimeout(() => setFeedback({ show: false, message: "", isError: false }), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setFeedback({ show: true, message: "Failed to delete account: " + err.message, isError: true });
    }
  };

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

  // Filter students based on grade filter and search term
  const filteredStudents = students.filter((s) => {
    // Grade Level Filter
    if (selectedGrade !== "all") {
      const studentGrade = (s.grade_level || s.grade || "").toString().toLowerCase();
      const filterNum = selectedGrade.toLowerCase().replace("grade", "").trim();
      if (!studentGrade.includes(filterNum) && !studentGrade.includes(`grade_${filterNum}`)) {
        return false;
      }
    }

    // Search Term Filter
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const email = (s.email || "").toLowerCase();
    const grade = (s.grade_level || s.grade || "").toString().toLowerCase();
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
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Account Management</h1>
          <p className="text-sm mt-1 text-blue-100">View and manage accounts</p>
        </div>
        <img
          src={require("../../assets/admin-panel.png")}
          alt="student"
          className="w-32 drop-shadow-md"
        />
      </div>

      <div className="bg-white p-6 rounded-xl  shadow-inner shadow-lg mt-8">
        {/* Toggle Buttons & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedRole("students")}
              className={`px-4 py-2 rounded font-semibold transition ${selectedRole === "students"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Students ({filteredStudents.length})
            </button>

            <button
              onClick={() => setSelectedRole("teachers")}
              className={`px-4 py-2 rounded font-semibold transition ${selectedRole === "teachers"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Teachers ({filteredTeachers.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Grade Level Filter Button (Students only) */}
            {selectedRole === "students" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-700 whitespace-nowrap hidden sm:inline">Grade:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm shadow-sm font-medium"
                >
                  <option value="all">All Grades</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                </select>
              </div>
            )}

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
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded mr-2 transition-all shadow-sm text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(s)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-all shadow-sm text-xs"
                        >
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
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 gap-4 text-sm text-gray-600">
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
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-gray-700 bg-white"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                          : "border border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalStudentPages))}
                      disabled={currentPage === totalStudentPages}
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-gray-700 bg-white"
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
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded mr-2 transition-all shadow-sm text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(t)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-all shadow-sm text-xs"
                        >
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
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 gap-4 text-sm text-gray-600">
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
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-gray-700 bg-white"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalTeacherPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                          : "border border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalTeacherPages))}
                      disabled={currentPage === totalTeacherPages}
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition text-gray-700 bg-white"
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

      {/* Edit User Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-800 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit {editingUser.role === "student" ? "Student Account" : "Teacher Account"}
              </h3>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username / Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingUser.role === "student" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grade Level</label>
                  <select
                    value={editingUser.grade_level}
                    onChange={(e) => setEditingUser({ ...editingUser, grade_level: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editingUser.employee_id}
                    onChange={(e) => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              !
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Account</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the account for{" "}
              <strong className="text-slate-800">
                {deletingUser.first_name} {deletingUser.last_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingUser(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm animate-bounce ${feedback.isError ? "bg-red-600" : "bg-green-600"
            }`}
        >
          {feedback.message}
        </div>
      )}
    </AdminLayout>
  );
}
