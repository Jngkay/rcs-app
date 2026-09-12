import TeacherLayout from "../../layout/teacherLayout";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../../firebase";

export default function Classes() {

  const teacher_id = localStorage.getItem("uuid");

  const [classes, setClasses] = useState([]);

  const [subject_code, setSubjectCode] = useState("");
  const [subject_name, setSubjectName] = useState("");
  const [class_ay, setClassAy] = useState("");
  const [grade_level, setGradeLevel] = useState("");

  const [editingClass, setEditingClass] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");

  // Pagination state (default 10 rows)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter]);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      (cls.subject_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.subject_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.class_code || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = gradeFilter === "ALL" || cls.grade_level === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const totalClasses = filteredClasses.length;
  const totalPages = Math.ceil(totalClasses / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + rowsPerPage);

  const classColors = [
    { bg: "bg-gradient-to-br from-blue-300 to-blue-400", text: "text-blue-900", subtext: "text-blue-800" },
    { bg: "bg-gradient-to-br from-yellow-200 to-yellow-300", text: "text-yellow-900", subtext: "text-yellow-800" },
  ];

  // =========================
  // FETCH CLASSES
  // =========================
  const fetchClasses = async () => {

    const q = query(
      collection(db, "classes"),
      where("teacher_id", "==", teacher_id)
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setClasses(list);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // =========================
  // GENERATE CLASS CODE
  // =========================
  const generateClassCode = () => {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  };

  // =========================
  // CREATE CLASS
  // =========================
  const createClass = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const class_code = generateClassCode();

      await setDoc(doc(db, "classes", class_code), {
        class_code,
        subject_code,
        subject_name,
        class_ay,
        grade_level,
        teacher_id
      });

      setSubjectCode("");
      setSubjectName("");
      setClassAy("");
      setGradeLevel("");
      setShowCreateModal(false);

      await fetchClasses();

    } catch (error) {
      console.error("Create class error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE CLASS
  // =========================
  const updateClass = async () => {

    try {

      setLoading(true);

      const ref = doc(db, "classes", editingClass);

      await updateDoc(ref, {
        subject_code,
        subject_name,
        class_ay,
        grade_level
      });

      setEditingClass(null);

      setSubjectCode("");
      setSubjectName("");
      setClassAy("");
      setGradeLevel("");
      setShowCreateModal(false);

      await fetchClasses();

    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE CLASS
  // =========================
  const deleteClass = async () => {

    try {

      setLoading(true);

      await deleteDoc(doc(db, "classes", classToDelete));

      setShowDeleteModal(false);
      setClassToDelete(null);

      await fetchClasses();

    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT CLASS
  // =========================
  const startEdit = (cls) => {

    setEditingClass(cls.id);

    setSubjectCode(cls.subject_code);
    setSubjectName(cls.subject_name);
    setClassAy(cls.class_ay);
    setGradeLevel(cls.grade_level);
    setShowCreateModal(true);
  };

  return (
    <TeacherLayout>

      {/* HEADER */}

      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Classes</h1>
          {/* <p className="mt-2 text-white/80 text-sm font-light">View and manage student accounts and GST results</p> */}
          <p className="text-sm mt-1 text-blue-100">View and manage classes</p>
        </div>
        <img
          src={require("../../assets/classes.png")}
          alt="student"
          className="w-32 drop-shadow-md"
        />
      </div>

      {/* TOP ACTION BAR: SEARCH, FILTER, ADD */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 gap-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search by subject or code..." 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="ALL">All Grades</option>
            {Array.from(new Set(classes.map(c => c.grade_level))).sort().map(g => (
                <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => {
            setEditingClass(null);
            setSubjectCode("");
            setSubjectName("");
            setClassAy("");
            setGradeLevel("");
            setShowCreateModal(true);
          }}
          className="bg-secondary hover:bg-secondary/90 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition w-full md:w-auto flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Class
        </button>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-2xl animate-fadeIn">
            <div className="bg-gradient-to-r from-secondary to-secondary/80 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingClass ? "Edit Class Information" : "Create New Class"}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                    {editingClass ? "Update the details for your existing class." : "Fill in the details below to add a new class to your roster."}
                </p>
            </div>

            <form
              onSubmit={editingClass ? (e) => { e.preventDefault(); updateClass(); } : createClass}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Subject Code</label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
                  placeholder="e.g. ENG101"
                  value={subject_code}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Subject Name</label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
                  placeholder="e.g. Basic English"
                  value={subject_name}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Academic Year</label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
                  placeholder="e.g. 2023-2024"
                  value={class_ay}
                  onChange={(e) => setClassAy(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Grade Level</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
                  placeholder="e.g. 4"
                  value={grade_level}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        setShowCreateModal(false);
                        setEditingClass(null);
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                    Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition ${
                      editingClass ? "bg-amber-500 hover:bg-amber-600" : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {loading ? (editingClass ? "Updating..." : "Creating...") : (editingClass ? "Update Class" : "Create Class")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE CLASSROOM STYLE CARDS */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">

        {paginatedClasses.map((cls, index) => {
          const colorClass = classColors[index % classColors.length];
          return (
          <div
            key={cls.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition transform duration-300 overflow-hidden flex flex-col h-full"
          >

            {/* CARD HEADER */}
            <div className={`${colorClass.bg} ${colorClass.text} p-5`}>

              <h3 className="text-xl font-bold line-clamp-1">
                {cls.subject_name}
              </h3>

              <p className={`${colorClass.subtext} text-sm font-medium mt-1`}>
                {cls.subject_code}
              </p>

            </div>

            {/* CARD BODY */}
            <div className="p-5 flex-1 flex flex-col justify-between">

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Grade Level</span>
                  <span className="font-semibold text-gray-800">{cls.grade_level}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Academic Year</span>
                  <span className="font-semibold text-gray-800">{cls.class_ay}</span>
                </div>

                <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500">Class Code</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold tracking-widest text-xs">
                    {cls.class_code}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 mt-6">

                <button
                  disabled={loading}
                  onClick={() => startEdit(cls)}
                  className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition"
                >
                  Edit
                </button>

                <button
                  disabled={loading}
                  onClick={() => {
                    setClassToDelete(cls.id);
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>
          );
        })}

      </div>

      {/* Pagination Controls */}
      {classes.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4 text-sm text-gray-600 bg-white p-4 rounded-xl shadow-sm">
          <div>
            Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(startIndex + rowsPerPage, totalClasses)}
            </span>{" "}
            of <span className="font-semibold text-gray-800">{totalClasses}</span> classes
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-gray-600 text-xs font-semibold">Classes per page:</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl shadow-xl w-96">

            <h2 className="text-xl font-bold mb-4">
              Delete Class
            </h2>

            <p className="mb-6">
              Are you sure you want to delete this class?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={deleteClass}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>

        </div>

      )}

    </TeacherLayout>
  );
}