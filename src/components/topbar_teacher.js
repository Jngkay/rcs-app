import React, { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";

export default function TopBar() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [role, setRole] = useState("");

  const placeholder =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  useEffect(() => {

    const f_name = localStorage.getItem("firstName");
    const l_name = localStorage.getItem("lastName");
    const uid = localStorage.getItem("uuid");
    const userRole = localStorage.getItem("role");

    if (f_name) setFirstName(f_name);
    if (l_name) setLastName(l_name);
    if (userRole) setRole(userRole);

    if (uid) {

      const storage = getStorage();
      const profilePicRef = ref(storage, `userProfile/${uid}`);

      getDownloadURL(profilePicRef)
        .then((url) => {
          setProfilePic(url);
        })
        .catch(() => {
          // If image does not exist → use placeholder
          setProfilePic(placeholder);
        });

    } else {

      setProfilePic(placeholder);

    }

  }, []);

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-4">

      {/* System Tagline */}
      <div className="flex items-center">
        <h2 className="text-base md:text-lg font-semibold text-slate-700 italic tracking-wide">
          "Making every reader, Ready"
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">

        <Bell size={20} className="text-gray-600 cursor-pointer" />

        <div className="flex items-center gap-2">

          <img
            src={profilePic || placeholder}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />

          {role === "teacher" ? (
            <Link
              to="/pages/teacher/profile"
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-500 font-medium text-white shadow-sm hover:opacity-95 transition-all"
            >
              {firstName} {lastName}
            </Link>
          ) : role === "student" ? (
            <Link
              to="/pages/student/profile"
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-500 font-medium text-white shadow-sm hover:opacity-95 transition-all"
            >
              {firstName} {lastName}
            </Link>
          ) : (
            <span className="flex items-center gap-2 p-2 rounded-lg bg-blue-500 font-medium text-white cursor-default select-none">
              {firstName || "Admin"} {lastName}
            </span>
          )}

        </div>

      </div>

    </header>
  );
}
