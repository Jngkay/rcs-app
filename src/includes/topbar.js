import React, { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";

export default function TopBar() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const f_name = localStorage.getItem("firstName");
    const l_name = localStorage.getItem("lastName");
    const uid = localStorage.getItem("uuid"); // ✅ make sure you save this at login

    if (f_name) setFirstName(f_name);
    if (l_name) setLastName(l_name);

    if (uid) {
      const storage = getStorage();
      const profilePicRef = ref(storage, `userProfile/${uid}.jpg`);
      getDownloadURL(profilePicRef)
        .then((url) => setProfilePic(url))
        .catch((err) => console.error("Error fetching profile pic:", err));
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
            src={profilePic || "/assets/default-avatar.png"} // fallback avatar
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          {/* <span className="font-medium text-gray-700">
           
          </span> */}
          <Link to="/pages/profile" className="flex items-center gap-2 p-2 rounded-lg bg-orange-500 font-medium"> {firstName} {lastName}</Link>
        </div>
      </div>
    </header>
  );
}
