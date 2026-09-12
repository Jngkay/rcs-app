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
    <header className="sticky top-0 z-20 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 shadow-sm">

      {/* System Tagline */}
      <div className="flex items-center">
        <h2 className="text-base md:text-lg font-semibold text-slate-700 italic tracking-wide">
          Making Every Reader, Ready
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">



        <div className="flex items-center gap-2">

          <img
            src={profilePic || placeholder}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />

          {role === "teacher" ? (
            <Link
              to="/pages/teacher/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-systemYellow-400 font-medium text-white shadow-sm hover:shadow transition-all"
            >
              {firstName} {lastName}
            </Link>
          ) : role === "student" ? (
            <Link
              to="/pages/student/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-systemYellow-400 font-medium text-white shadow-sm hover:shadow transition-all"
            >
              {firstName} {lastName}
            </Link>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 font-medium text-white shadow-sm cursor-default select-none">
              {firstName || "Admin"} {lastName}
            </span>
          )}

        </div>

      </div>

    </header>
  );
}
