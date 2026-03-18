import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout";

import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Profile() {

  const [student, setStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    grade_level: "",
    address: "",
    school: ""
  });

  const [editing, setEditing] = useState(false);
  const [showUpdateConfirmationModal, setShowUpdateConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const uid = auth.currentUser?.uid;

  // Load student data
  useEffect(() => {
    const fetchStudent = async () => {

      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudent(docSnap.data());
      }
    };

    fetchStudent();
  }, [uid]);

  // Handle input change
  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  // Save updated data
  const handleSave = async () => {

    try {

      const docRef = doc(db, "users", uid);

      await updateDoc(docRef, student);

      setEditing(false);
      setShowUpdateConfirmationModal(false);
      // alert("Profile updated successfully!");

    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };

  return (
    <MainLayout>

      <div className="space-y-6">

        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Profile</h1>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
            className="w-24"
          />
        </div>


        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">

          <div className="grid grid-cols-2 gap-4">

            {/* First Name */}
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <input
                type="text"
                name="first_name"
                value={student.first_name}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={student.last_name}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

             {/* School */}
            <div>
              <label className="text-sm text-gray-600">Birthdate</label>
              <input
                type="date"
                name="birthdate"
                value={student.birthdate}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>


            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                name="email"
                value={student.email}
                disabled
                // disabled={!editing}
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <select
                name="gender"
                value={student.gender}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

             {/* Adddress */}
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <input
                type="text"
                name="address"
                value={student.address}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>


            {/* Course */}
            <div>
              <label className="text-sm text-gray-600">Grade Level</label>
              <input
                name="grade_level"
                value={student.grade_level}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            

            {/* School */}
            <div>
              <label className="text-sm text-gray-600">School</label>
              <input
                type="text"
                name="school"
                value={student.school}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

          </div>


          {/* Buttons */}
          <div className="flex gap-3 mt-4">

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  // onClick={handleSave}
                   onClick={()=>{
                    setShowUpdateConfirmationModal(true);
                  }}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-400 text-white px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}

          </div>

      </div>

      </div>
         {/* DELETE CONFIRMATION MODAL */}
          {showUpdateConfirmationModal && (

            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

              <div className="bg-white p-6 rounded-xl shadow-xl w-120">

                <h2 className="text-xl font-bold mb-2">
                  Update Profile
                  
                </h2>
                <hr></hr>

                <p className="mb-2 mt-4">
                  
                  You are about to update your profile details.
                </p>

                <p>Do you want to continue?</p>

                <div className="flex justify-end gap-3">

                  <button
                    onClick={()=>setShowUpdateConfirmationModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    {loading ? "Updating" : "Update"}
                  </button>

                </div>

              </div>

            </div>

          )}

    </MainLayout>
  );
}