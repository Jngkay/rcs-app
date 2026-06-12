import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layout/teacherLayout";

import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function TeacherProfile() {


    const [teacher, setTeacher] = useState({
        first_name: "",
        last_name: "",
        email: "",
        school: ""
    });

    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [editing, setEditing] = useState(false);
    const [showUpdateConfirmationModal, setShowUpdateConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const uid = auth.currentUser?.uid;

    useEffect(() => {

        const fetchTeacher = async () => {

            if (!uid) return;

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTeacher(docSnap.data());
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

        fetchTeacher();

    }, [uid]);

    const handleChange = (e) => {
        setTeacher({
            ...teacher,
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

            await updateDoc(docRef, teacher);

            if (profileImage) {

                const storage = getStorage();
                const storageRef = ref(storage, `userProfile/${uid}`);

                await uploadBytes(storageRef, profileImage);

            }

            setEditing(false);
            setShowUpdateConfirmationModal(false);

        } catch (error) {

            console.error(error);
            alert("Error updating profile");

        }

        setLoading(false);

    };



    return (
        <TeacherLayout>
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Teacher Profile</h1>
                </div>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="books"
                    className="w-32"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">

                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm text-gray-600">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={teacher.first_name}
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
                            value={teacher.last_name}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>



                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            name="email"
                            value={teacher.email}
                            disabled
                            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">School</label>
                        <input
                            type="text"
                            name="school"
                            value={teacher.school}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                </div>

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

            {showUpdateConfirmationModal && (

                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl shadow-xl w-120">

                        <h2 className="text-xl font-bold mb-2">Update Profile</h2>
                        <hr />

                        <p className="mb-2 mt-4">
                            You are about to update your profile details.
                        </p>

                        <p>Do you want to continue?</p>

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
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                {loading ? "Updating" : "Update"}
                            </button>

                        </div>

                    </div>

                </div>

            )}
        </TeacherLayout>
    );
}
