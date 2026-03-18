import React, { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";

export default function TopBar() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const placeholder =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  useEffect(() => {

    const f_name = localStorage.getItem("firstName");
    const l_name = localStorage.getItem("lastName");
    const uid = localStorage.getItem("uuid");

    if (f_name) setFirstName(f_name);
    if (l_name) setLastName(l_name);

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

      {/* Search bar */}
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Search here..."
          className="w-full rounded-full border px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
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

          <Link
            to="/pages/student/profile"
            className="flex items-center gap-2 p-2 rounded-lg bg-orange-500 font-medium"
          >
            {firstName} {lastName}
          </Link>

        </div>

      </div>

    </header>
  );
}
