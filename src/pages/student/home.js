import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import { BookOpen, Target, TrendingUp, Award } from "lucide-react";

export default function Home() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const f_name = localStorage.getItem("firstName");
    if (f_name) setFirstName(f_name);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-secondary rounded-3xl p-4 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex-1 z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Welcome{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light max-w-xl mb-6">
            Welcome to your dedicated space for enhancing your reading comprehension.
            <br />
            Our mission is simple: <strong className="font-semibold text-white">Making Every Reader, Ready.</strong>
          </p>
          <p className="text-sm md:text-base text-blue-100/80 max-w-2xl">
            This system is designed to provide you with individualized assessments, engaging learning modules, and check your scores.
          </p>
        </div>

        <div className="w-80 h-80 md:w-96 md:h-96 flex-shrink-0 z-10 hidden md:block">
          <img
            src={require("../../assets/home.png")}
            alt="Reading illustration"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Learning Modules</h3>
          <p className="text-slate-500 text-sm">
            Access carefully curated reading materials and stories tailored to your grade level.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Assessments</h3>
          <p className="text-slate-500 text-sm">
            Take individualized tests that automatically adapt to challenge and improve your comprehension skills.
          </p>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/60">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Get Started</h2>
        <ul className="space-y-4 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <p>Navigate to your <strong>Dashboard</strong> to see if you have any pending assessments assigned by your teacher.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <p>Explore the <strong>Learning Modules</strong> to practice reading passages at your own pace.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <p>Check your <strong>Scores</strong> to review your past performance and track your growth.</p>
          </li>
        </ul>
      </div>
    </MainLayout>
  );
}
