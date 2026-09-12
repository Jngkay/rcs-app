import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout";

import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function Profile() {

  const navigate = useNavigate();

  const [student, setStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    grade_level: "",
    address: "",
    school: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(localStorage.getItem("profilePicUrl") || "");

  const [editing, setEditing] = useState(false);
  const [showUpdateConfirmationModal, setShowUpdateConfirmationModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const uid = auth.currentUser?.uid;

  useEffect(() => {

    const fetchStudent = async () => {

      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudent(docSnap.data());
      }

      try {

        const storage = getStorage();
        const imageRef = ref(storage, `userProfile/${uid}`);
        const url = await getDownloadURL(imageRef);

        setPreview(url);

      } catch {

        setPreview("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");

      }

    };

    fetchStudent();

  }, [uid]);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }

  };

  const handleSave = async () => {

    setLoading(true);

    try {

      const docRef = doc(db, "users", uid);

      await updateDoc(docRef, student);

      if (profileImage) {

        const storage = getStorage();
        const storageRef = ref(storage, `userProfile/${uid}`);

        await uploadBytes(storageRef, profileImage);
        
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      setEditing(false);
      setShowUpdateConfirmationModal(false);

    } catch (error) {

      console.error(error);
      alert("Error updating profile");

    }

    setLoading(false);

  };

  const handleResetPassword = () => {
    if (!auth.currentUser?.email) return;
    setShowResetModal(true);
  };

  return (
    <MainLayout>

      <div className="space-y-6">

        <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-sm mt-1 text-blue-100">Manage your profile</p>
          </div>


          <label className="cursor-pointer flex flex-col items-center">

            <img
              src={preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border"
            />

            {editing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            )}

          </label>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">

          <div className="grid grid-cols-2 gap-4">

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

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                name="email"
                value={student.email}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

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

          <div className="flex gap-3 mt-4">

            {!editing ? (

              <>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleResetPassword}
                  className="bg-systemYellow-400 text-white px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
                >
                  Reset Password
                </button>
              </>

            ) : (

              <>
                <button
                  onClick={() => setShowUpdateConfirmationModal(true)}
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

      {showUpdateConfirmationModal && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl shadow-xl w-120">

            <h2 className="text-xl font-bold mb-2">Update Profile</h2>
            <hr />

            <p className="mb-2 mt-4 text-gray-700">
              You are about to update your profile details.
              {profileImage && " For security reasons, updating your profile picture will require you to log back in."}
            </p>

            <p className="text-gray-700">Do you want to continue?</p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowUpdateConfirmationModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded flex items-center justify-center min-w-[100px] hover:bg-red-600 transition-colors"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Update"}
              </button>

            </div>

          </div>

        </div>

      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Reset Password?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset your password? A reset link will be sent to your email, and you will be securely logged out.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await sendPasswordResetEmail(auth, auth.currentUser.email);
                    setShowResetModal(false);
                    
                    setTimeout(async () => {
                        await signOut(auth);
                        localStorage.clear();
                        sessionStorage.clear();
                        navigate("/login", { replace: true });
                    }, 150);
                  } catch (error) {
                    console.error("Error sending reset email:", error);
                    alert("Error sending password reset email.");
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}