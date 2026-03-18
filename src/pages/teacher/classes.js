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
  };

  return (
    <TeacherLayout>

      {/* HEADER */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Classes</h1>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          className="w-24"
          alt="teacher"
        />
      </div>

      {/* CREATE / EDIT FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">

        <h2 className="text-xl font-bold mb-4">
          {editingClass ? "Edit Class" : "Create Class"}
        </h2>

        <form
          onSubmit={createClass}
          className="grid grid-cols-2 gap-4"
        >

          <input
            className="border p-2 rounded"
            placeholder="Subject Code"
            value={subject_code}
            onChange={(e)=>setSubjectCode(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Subject Name"
            value={subject_name}
            onChange={(e)=>setSubjectName(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Academic Year"
            value={class_ay}
            onChange={(e)=>setClassAy(e.target.value)}
            required
          />

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Grade Level"
            value={grade_level}
            onChange={(e)=>setGradeLevel(e.target.value)}
            required
          />

          {editingClass ? (

            <button
              type="button"
              onClick={updateClass}
              disabled={loading}
              className="bg-green-500 text-white p-2 rounded col-span-2"
            >
              {loading ? "Updating..." : "Update Class"}
            </button>

          ) : (

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded col-span-2"
            >
              {loading ? "Creating..." : "Create Class"}
            </button>

          )}

        </form>

      </div>

      {/* GOOGLE CLASSROOM STYLE CARDS */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">

        {classes.map(cls => (

          <div
            key={cls.id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
          >

            {/* CARD HEADER */}
            <div className="bg-blue-500 text-white p-4">

              <h3 className="text-lg font-bold">
                {cls.subject_name}
              </h3>

              <p className="text-sm">
                {cls.subject_code}
              </p>

            </div>

            {/* CARD BODY */}
            <div className="p-4">

              <p className="text-sm text-gray-600">
                Grade Level: {cls.grade_level}
              </p>

              <p className="text-sm text-gray-600">
                Academic Year: {cls.class_ay}
              </p>

              <p className="text-sm mt-2 font-semibold">
                Class Code:
                <span className="ml-2 text-blue-600 font-bold">
                  {cls.class_code}
                </span>
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 mt-4">

                <button
                  disabled={loading}
                  onClick={()=>startEdit(cls)}
                  className="bg-yellow-400 px-3 py-1 rounded text-sm hover:bg-yellow-500"
                >
                  Edit
                </button>

                <button
                  disabled={loading}
                  onClick={()=>{
                    setClassToDelete(cls.id);
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

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
                onClick={()=>setShowDeleteModal(false)}
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