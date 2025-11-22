// import React, { useState, useEffect } from "react";
// import MainLayout from "../layout/mainLayout";
// import { getStorage, ref, getDownloadURL } from "firebase/storage";

// export default function Dashboard() {
//   const [step, setStep] = useState("welcome"); 
//   const [currentQ, setCurrentQ] = useState(0);

//   // Sample 5 questions
//   const questions = [
//     {
//       title: "Question 1",
//       text: "What is the capital of the Philippines?",
//     },
//     {
//       title: "Question 2",
//       text: "Which planet is known as the Red Planet?",
//     },
//     {
//       title: "Question 3",
//       text: "Who wrote the novel 'Noli Me Tangere'?",
//     },
//     {
//       title: "Question 4",
//       text: "What is the largest ocean on Earth?",
//     },
//     {
//       title: "Question 5",
//       text: "In what year did the first man land on the moon?",
//     },
//   ];

//   const handleNext = () => {
//     if (currentQ < questions.length - 1) {
//       setCurrentQ(currentQ + 1);

//     } else {
//       // 
//       setStep("result"); // go back or redirect
//     }
//   };

//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [profilePic, setProfilePic] = useState("");
  
//     useEffect(() => {
//       const f_name = localStorage.getItem("firstName");
//       const l_name = localStorage.getItem("lastName");
//       const uid = localStorage.getItem("uuid"); // ✅ make sure you save this at login
  
//       if (f_name) setFirstName(f_name);
//       if (l_name) setLastName(l_name);
  
//       if (uid) {
//         const storage = getStorage();
//         const profilePicRef = ref(storage, `userProfile/${uid}.jpg`);
//         getDownloadURL(profilePicRef)
//           .then((url) => setProfilePic(url))
//           .catch((err) => console.error("Error fetching profile pic:", err));
//       }
//     }, []);
  

//   return (
//     <MainLayout>
//       {step === "welcome" && (
//         <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
//           <div>
//             <h1 className="text-5xl font-bold">Welcome to HenyoReads, Abby!</h1>
//             <p className="mt-10 text-xl">Start your Reading Success Journey here</p>
//             <button
//               onClick={() => setStep("directions")}
//               className="px-12 py-2 mt-14 mb-10 bg-yellow-500 text-2xl rounded-full font-semibold hover:bg-yellow-600 transition"
//             >
//               Take the GST Test
//             </button>
//           </div>
//           <img src="/assets/books1.png" alt="books" className="w-48 mr-8" />
//         </div>
//       )}

//       {step === "directions" && (
//         <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
//           <div>
//             <h1 className="text-5xl font-bold">Group Screening Test</h1>
//             <p className="mt-10 text-xl">Directions:</p>
//             <p className="mt-2 text-lg">
//               Answer the following questions carefully. Click NEXT to proceed to the next question.
//             </p>
//             <button
//               onClick={() => setStep("quiz")}
//               className="px-16 py-2 mt-64 mb-10 bg-yellow-500 text-xl rounded-full font-semibold hover:bg-yellow-600 transition"
//             >
//               START QUIZ
//             </button>
//           </div>
//           <img src="/assets/idea1.png" alt="idea" className="w-64 mr-8" />
//         </div>
//       )}

//       {step === "quiz" && (
//         <div className="bg-white text-black p-6 rounded-xl shadow-2xl flex flex-col min-h-screen">
//           <div className="flex-1">
//             <h1 className="text-5xl font-bold">{questions[currentQ].title}</h1>
//             <p className="mt-10 text-xl">{questions[currentQ].text}</p>
//           </div>

//           <div className="flex justify-end">
//             <button
//               onClick={handleNext}
//               className="px-16 py-2 shadow-xl mt-10 mb-10 mr-8 text-white bg-blue-500 text-xl rounded-full font-semibold hover:bg-blue-600 transition"
//             >
//               {currentQ < questions.length - 1 ? "NEXT" : "SUBMIT"}
//             </button>
//           </div>
//         </div>
//       )}

//       {step === "result" && (
//         <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
//           <div>
//             <h1 className="text-5xl font-bold">Group Screening Test Score</h1>
//             <p className="text-3xl mt-8">Your GST Score is: <span className="text-5xl font-bold">10</span> </p>
            
//             <h1 className="text-3xl font-bold mt-4">I want to learn how you learn best, so we’ll do a special activity together. 
//             It’s not a test—it’s just to help you get even better. </h1>

//              <button onClick={() => setStep("individualizedAssessment")}
//                   className="px-16 py-2 shadow-xl mt-14 mb-10 mr-8 text-blue-600 bg-white text-xl rounded-full font-semibold hover:text-white hover:bg-blue-400 transition">Take Individualized Assessment</button>
//           </div>
//         </div>
//       )}

//       {step === "individualizedAssessment" && (
//         <div className="bg-white text-black p-6 rounded-xl shadow-md">
//           <div>
//             <h1 className="text-5xl font-bold">Read Aloud and Record</h1>
//             <p className="text-2xl mt-8">Take a moment to read the passage aloud.
//                <br></br>
//                 Don’t worry about being perfect—just focus on expressing it in your own way. 
//                 <br></br>
//                 You've got this!</p>

//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => setStep("individualizedAssessmentInstructions")}
//                     className="px-16 py-2 shadow-xl mt-10 mb-10 mr-8 text-gray-600 border-2 border-blue-400 bg-white text-xl rounded-full font-semibold transition hover:border-4 hover:bg-blue-400 hover:text-white">
//                       View Instructions
//                     </button>

//                     <button onClick=""
//                   className="px-16 py-2 shadow-xl mt-10 mb-10 mr-8 text-white bg-blue-500 text-xl rounded-full font-semibold hover:bg-blue-600 transition">Start Recording</button>
//                 </div>
//           </div>

        
//         </div>
//       )}

//       {step === "individualizedAssessmentInstructions" && (
//         <div className="bg-white text-black rounded-xl shadow-md">
//           <div className="p-8">
//               <div className="text-center mt-4 w-lg">
//               <h1 className="text-4xl font-bold">How It Works</h1>
//               <p>Follow these simpe steps to get started.</p>
//               <button className="bg-black  mt-4 px-16 py-2 text-white rounded-md">Learn More</button>
//             </div>
//           </div>

//           <div className="grid grid-flow-col gap-4 p-16 mt-12 ">
//             {/* Step 1 */}
//             <div className="border rounded-lg p-4 flex items-start gap-4 shadow-sm bg-white">
//                   {/* Image Placeholder */}
//                   <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>

//                   {/* Text Content */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-gray-900">Step 1: Select a Passage</h2>
//                     <p className="mt-2 text-sm text-gray-700">
//                     Choose a reading passage from the list provided. 
//                     </p>
//                   </div>
//               </div>

//               {/* Step 2 */}
//                <div className="border rounded-lg p-4 flex items-start gap-4 shadow-sm bg-white">
//                   {/* Image Placeholder */}
//                   <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>

//                   {/* Text Content */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-gray-900">Step 2: Record Your Voice</h2>
//                     <p className="mt-2 text-sm text-gray-700">
//                     Click on the 'Start Recording' button to begin.  
//                     </p>
//                   </div>
//               </div>

//                {/* Step 3 */}
//                <div className="border rounded-lg p-4 flex items-start gap-4 shadow-sm bg-white">
//                   {/* Image Placeholder */}
//                   <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>

//                   {/* Text Content */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-gray-900">Step 3: Submit for Evaluation</h2>
//                     <p className="mt-2 text-sm text-gray-700">
//                     Once you're done, submit your recording for teacher evaluation.  
//                     </p>
//                   </div>
//               </div>


//           </div>

//           <hr className="ml-8 mr-8"></hr>
  

//           <div className="grid grid-cols-2 gap-8 p-16">
//             <div className="0 p-6 rounded-md">
//               <h1 className="text-4xl font-bold">Select a Passage</h1>
//               <p className="mt-6">Choose a passage to read aloud</p>
//             </div>
//             <div className="p-6 rounded-md flex flex-col justify-start items-start">
//               <p>Passage Selection</p>
//               <button className="bg-black mt-8 px-16 py-2 text-white rounded-md">
//                 Continue
//               </button>
//             </div>
//           </div>

//            <div className="flex items-center bg-gray-700 p-16 w-full m-0">
//               {/* Profile image */}
//               <div className="w-32 h-32 rounded-full bg-gray-400 overflow-hidden flex-shrink-0">
//                   <img
//                     src={profilePic || "/assets/default-avatar.png"}
//                     alt="profile"
//                     className="w-full h-full object-cover"
//                   />
               
//               </div>

//               {/* Text */}
//               <div className="ml-24">
//                 <h2 className="text-white font-bold text-3xl mt-4">{firstName} {lastName}</h2>
//                 <p className="text-gray-200 text-1xl">Prepare to practice your reading!</p>
//               </div>
//             </div>
//         </div>
//       )}
//     </MainLayout>
//   );
// }


import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/mainLayout";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase"; // ✅ your Firestore instance

export default function Dashboard() {
  const [step, setStep] = useState("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeLevel, setGradeLevel] = useState(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  const auth = getAuth();

  // User info (profile, name)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const f_name = localStorage.getItem("firstName");
    const l_name = localStorage.getItem("lastName");
    const uid = localStorage.getItem("uuid");
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

  // ✅ Fetch dynamic questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("✅ Connecting to Firestore...");

        // 1️⃣ Verify DB connection
        if (!db) {
          console.error("❌ Firestore not initialized properly!");
          return;
        }
        console.log("✅ Firestore instance found:", db);

        const user = auth.currentUser;
        if (!user) {
          console.error("❌ No user logged in.");
          return;
        }
        console.log("👤 Current User UID:", user.uid);

        // 2️⃣ Get user's grade level
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("❌ User document not found in Firestore!");
          return;
        }

        const grade = userSnap.data().grade_level;
        setGradeLevel(grade);
        console.log(`🎓 User grade level: ${grade}`);

        // 3️⃣ Fetch stories based on grade level
        const storyRef = collection(db, "gst_collection", `grade_${grade}`, "stories");
        console.log("📂 Fetching stories from path:", `gst_collection/grade_${grade}/stories`);

        const storiesSnap = await getDocs(storyRef);

        if (storiesSnap.empty) {
          console.warn("⚠️ No stories found for this grade.");
          return;
        }

        // Print all story titles
        console.log("📚 Stories fetched:");
        storiesSnap.forEach((doc) => {
          console.log(`   ➜ ${doc.id}:`, doc.data());
        });

        // 4️⃣ Pick first story
        const firstStory = storiesSnap.docs[0];
        setStoryTitle(firstStory.data().title);
        setStoryContent(firstStory.data().content);
        console.log("✅ Selected Story:", firstStory.data().title);

        // 5️⃣ Fetch questions
        const qRef = collection(db, "gst_collection", `grade_${grade}`, "stories", firstStory.id, "questions");
        console.log("📄 Fetching questions from:", `gst_collection/grade_${grade}/stories/${firstStory.id}/questions`);

        const qSnap = await getDocs(qRef);
        console.log(`✅ ${qSnap.docs.length} questions fetched.`);

        const qList = qSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        qList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setQuestions(qList);

        console.log("🧠 Questions loaded:", qList);
      } catch (err) {
        console.error("❌ Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep("result");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-2xl font-semibold">Loading quiz...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {step === "welcome" && (
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">Welcome to HenyoReads, {firstName}!</h1>
            <p className="mt-10 text-xl">Start your Reading Success Journey here</p>
            <button
              onClick={() => setStep("directions")}
              className="px-12 py-2 mt-14 mb-10 bg-yellow-500 text-2xl rounded-full font-semibold hover:bg-yellow-600 transition"
            >
              Take the GST Test
            </button>
          </div>
          <img src="/assets/books1.png" alt="books" className="w-48 mr-8" />
        </div>
      )}

      {step === "directions" && (
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">Group Screening Test</h1>
            <p className="mt-10 text-xl">Directions:</p>
            <p className="mt-2 text-lg">
              Answer the following questions carefully. Click NEXT to proceed to the next question.
            </p>
            <button
              onClick={() => setStep("quiz")}
              className="px-16 py-2 mt-64 mb-10 bg-yellow-500 text-xl rounded-full font-semibold hover:bg-yellow-600 transition"
            >
              START QUIZ
            </button>
          </div>
          <img src="/assets/idea1.png" alt="idea" className="w-64 mr-8" />
        </div>
      )}

      {step === "quiz" && questions.length > 0 && (
        <div className="bg-white text-black p-6 rounded-xl shadow-2xl flex flex-col min-h-screen">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{storyTitle}</h1>
            <h2 className="text-3xl  mb-4">{storyContent}</h2>

            <h2 className="text-2xl font-semibold">
              {questions[currentQ].order ? `Question ${questions[currentQ].order}` : `Question ${currentQ + 1}`}
            </h2>
            <p className="mt-6 text-xl">{questions[currentQ].text}</p>

            <ul className="mt-6 space-y-3">
              {questions[currentQ].choices?.map((choice, idx) => (
                <li
                  key={idx}
                  className="border p-3 rounded-md cursor-pointer hover:bg-blue-100"
                >
                  {choice.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-16 py-2 shadow-xl mt-10 mb-10 mr-8 text-white bg-blue-500 text-xl rounded-full font-semibold hover:bg-blue-600 transition"
            >
              {currentQ < questions.length - 1 ? "NEXT" : "SUBMIT"}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

