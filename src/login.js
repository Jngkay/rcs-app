import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDoc, addDoc, doc, getDocs, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";


// ----------------- Login Form -----------------
function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
   const [loading, setLoading] = useState(false); 
 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const uuid = user.uid;
      console.log(user.uid);

       // Fetch user data from Firestore
      const userRef = doc(db, "users", uuid);
      const userSnap = await getDoc(userRef);

      let firstName = "";
      let lastName = "";
      let gradeLevel = "";
      let role = "";
      if (userSnap.exists()) {
        firstName = userSnap.data().first_name || "";
        lastName = userSnap.data().last_name || "";
        gradeLevel = userSnap.data().grade_level || "";      
        role = userSnap.data().role || "";    
      }



    // Save to localStorage
    localStorage.setItem("uuid", uuid);
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("grade_level", gradeLevel);
    localStorage.setItem("role", role);
    
      
      if(role === "admin"){
        navigate("../pages/admin/account_management");
      } else if(role === "teacher"){
        navigate("../pages/teacher/reading_lists");
      } else if(role === "student"){
        navigate("../pages/student/dashboard");
      }
      setError("");
    } catch (err) {
      setError("Incorrect login credentials.");
    } finally{
      setLoading(false);
    }
  };
  return (
    <>
      <p className="text-gray-500 text-sm mb-6">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">User name</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your User name"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
          />
        </div>

        <div className="flex justify-between items-center mb-6 text-sm">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-blue-500" />
            <span className="text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </div>

         <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xl shadow hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
          ) : (
            "Login"
          )}
        </button>

        {/* <button
          type="submit"
          className="w-full py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:opacity-90 transition">
          Login
        </button> */}
      </form>
    </>
  );
}


// ----------------- Class Code Form -----------------
function ClassCodeForm({ onCodeValidated, onSwitchToLogin }) {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");

  const checkClassCode = async (e) => {
    e.preventDefault();
    if (classCode.trim() === "") {
      setError("Please enter a class code.");
      return;
    }

    try {
      const q = query(collection(db, "class_code"), where("code", "==", classCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid class code. Please check with your teacher.");
      } else {
        setError("");
        onCodeValidated(classCode); // ✅ Pass valid class code
      }
    } catch (err) {
      setError(err.message);
      console.error("Error validating class code:", err);
    }
  };

  return (
    <>
      <p className="text-gray-500 mb-6">
        To access the platform, please enter your class code from your teacher.
      </p>

      <form onSubmit={checkClassCode}>
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-left">
            {error}
          </div>
        )}
        <div className="mb-6 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Class Code</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            placeholder="Enter your Class Code"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:opacity-90 transition">
          Next
        </button>
      </form>

      <div className="mt-4 text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <a href="#" onClick={onSwitchToLogin} className="text-blue-500 hover:underline">
          Log-in instead
        </a>
      </div>
    </>
  );
}


// ----------------- Register Form -----------------
function RegisterForm({ classCode, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [grade_level, setGradeLevel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      //  Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user in Firestore with classCode
      // await addDoc(collection(db, "users"), {
      //   uid: user.uid,
      //   first_name,
      //   last_name,
      //   role: "student",
      //   email,
      //   classCode,
      //   createdAt: new Date(),
      // });

      await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      first_name,
      last_name,
      role: "student",
      grade_level,
      email,
      classCode,
      createdAt: new Date(),
      });

      setError("");
      onSwitchToLogin()
      // navigate("/login");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    }
  };

  return (
    <>
      <p className="text-gray-500 mb-6">Complete your registration below:</p>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">First Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Last Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Grade Level</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={grade_level}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="Enter your grade level"
            required
          />
        </div>
    
        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            required
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            required
          />
        </div>

        <div className="mb-6 text-left">
          <label className="block mb-1 text-gray-700 text-sm">Confirm Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your Password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:opacity-90 transition"
        >
          Register
        </button>
      </form>

      <div className="mt-4 text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <a
          href="#"
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:underline"
        >
          Log-in instead
        </a>
      </div>
    </>
  );
}


// ----------------- Main App -----------------
export default function App() {
  const [view, setView] = useState("login");
  const [validatedClassCode, setValidatedClassCode] = useState(null);

  const renderContent = () => {
    switch (view) {
      case "login":
        return <LoginForm />;
      case "registerUserType":
        return (
          <>
            <p className="text-gray-500 text-base mb-6">Choose your user type:</p>
            <div className="flex justify-center space-x-6">
              {/* Teacher */}
              <div
                onClick={() => setView("login")} // for now
                className="flex flex-col items-center p-6 bg-purple-100 rounded-2xl shadow-md cursor-pointer hover:bg-purple-200 transition-colors"
              >
                <span className="text-6xl mb-4">👩‍🏫</span>
                <span className="font-semibold text-lg">Teacher</span>
              </div>

              {/* Student */}
              <div
                onClick={() => setView("registerClassCode")}
                className="flex flex-col items-center p-6 bg-orange-100 rounded-2xl shadow-md cursor-pointer hover:bg-orange-200 transition-colors"
              >
                <span className="text-6xl mb-4">🧑‍🎓</span>
                <span className="font-semibold text-lg">Student</span>
              </div>
            </div>
          </>
        );
      case "registerClassCode":
        return (
          <ClassCodeForm
            onCodeValidated={(classCode) => {
              setValidatedClassCode(classCode);
              setView("registerForm");
            }}
            onSwitchToLogin={() => setView("login")}
          />
        );
      case "registerForm":
        return (
          <RegisterForm
            classCode={validatedClassCode}
            onSwitchToLogin={() => setView("login")}
          />
        );
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[380px] text-center">
        <h2 className="text-3xl font-bold mb-2">Welcome</h2>
        <div className="flex justify-center mb-6 space-x-2">
          <button
            type="button"
            onClick={() => setView("login")}
            className={`px-6 py-2 rounded-full ${
              view === "login"
                ? "text-white bg-gradient-to-r from-blue-400 to-blue-600 shadow"
                : "text-blue-600 border border-blue-400 hover:bg-blue-50"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setView("registerUserType")}
            className={`px-6 py-2 rounded-full ${
              view !== "login"
                ? "text-white bg-gradient-to-r from-blue-400 to-blue-600 shadow"
                : "text-blue-600 border border-blue-400 hover:bg-blue-50"
            }`}
          >
            Register
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
