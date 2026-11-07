import React from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/landing_header";
import LandingFooter from "../components/landing_footer";
import {
  BookOpen,
  Mic,
  Brain,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Volume2,
  Clock,
  LogIn,
  Check,
  Layers,
  GraduationCap
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-secondary/20 selection:text-secondary">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <LandingHeader />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Decorative Blurs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-secondary text-xs font-semibold tracking-wide uppercase shadow-sm">
                <Sparkles size={14} className="text-systemYellow-400 fill-systemYellow-400" />
                <span>Phil-IRI Aligned Reading Comprehension Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Making Every Reader,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-blue-600 to-primary">
                  Ready.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Readi is a digital reading comprehension and diagnostic assessment system.
                Combining speech recognition with Phil-IRI standards, it helps teachers accurately measure
                oral reading fluency, diagnose comprehension levels, and provide individualized remedial support.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleLoginClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-secondary hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Log In to the System</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm hover:shadow transition-all"
                >
                  <BookOpen size={18} className="text-slate-500" />
                  <span>Learn How It Works</span>
                </button>
              </div>

              {/* Key Trust Checkmarks */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-500 justify-center lg:justify-start">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircle2 size={16} className="text-systemGreen-400 flex-shrink-0" />
                  <span>DepEd Phil-IRI Standard</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircle2 size={16} className="text-systemGreen-400 flex-shrink-0" />
                  <span>Automated Miscue Analysis</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start col-span-2 sm:col-span-1">
                  <CheckCircle2 size={16} className="text-systemGreen-400 flex-shrink-0" />
                  <span>AI-Powered Remediation</span>
                </div>
              </div>
            </div>

            {/* Right Graphic / Interactive Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative background card glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-secondary to-primary rounded-3xl blur-xl opacity-30"></div>

                {/* Main Card */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-secondary">
                        <GraduationCap size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Reading Assessment Card</h3>
                        <p className="text-xs text-slate-400">Oral Reading Profile</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Evaluated
                    </span>
                  </div>

                  {/* Speech Waveform Simulation */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5 text-secondary">
                        <Volume2 size={16} className="animate-pulse" />
                        Oral Reading Speech Processing
                      </span>
                      <span>115 WPM</span>
                    </div>
                    {/* Simulated Waveform bars */}
                    <div className="flex items-center justify-center gap-1.5 h-10 px-2">
                      {[40, 65, 30, 85, 95, 45, 60, 90, 70, 50, 80, 100, 75, 45, 85, 60, 40].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1.5 rounded-full transition-all ${
                            i % 3 === 0 ? "bg-secondary" : i % 2 === 0 ? "bg-blue-400" : "bg-purple-400"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                      <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Word Reading</p>
                      <p className="text-xl font-extrabold text-blue-900 mt-1">98.2%</p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-green-700">
                        Independent
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
                      <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">Comprehension</p>
                      <p className="text-xl font-extrabold text-purple-900 mt-1">85.0%</p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-green-700">
                        Independent
                      </span>
                    </div>
                  </div>

                  {/* Overall Profile Pill */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-secondary to-blue-700 text-white flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-xs text-blue-100 font-medium">Overall Phil-IRI Profile</p>
                      <p className="text-lg font-bold">Independent Reader</p>
                    </div>
                    <Award size={28} className="text-systemYellow-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS / HIGHLIGHTS BAR ================= */}
      <section className="border-y border-slate-200/80 bg-white py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-secondary">2-Phase</div>
              <p className="text-sm font-medium text-slate-500 mt-1">Screening & Diagnostic Flow</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-secondary">Whisper AI</div>
              <p className="text-sm font-medium text-slate-500 mt-1">Accurate Speech Recognition</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-secondary">Phil-IRI</div>
              <p className="text-sm font-medium text-slate-500 mt-1">DepEd Assessment Standard</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-secondary">100%</div>
              <p className="text-sm font-medium text-slate-500 mt-1">Data-Driven Remediation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              About The System
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Transforming Reading Evaluation with Intelligence & Accuracy
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Traditional reading assessment requires teachers to manually count word omissions,
              mispronunciations, and stopwatch durations for dozens of students.
              <strong> Readi</strong> digitizes and streamlines this process using speech-to-text intelligence,
              freeing teachers to focus on targeted pedagogical interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-secondary flex items-center justify-center mb-6">
                <BookOpen size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">DepEd Phil-IRI Standard</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Strictly built around the Philippine Informal Reading Inventory guidelines to categorize
                readers into Independent, Instructional, or Frustration tiers accurately.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-primary flex items-center justify-center mb-6">
                <Mic size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Automated Miscue Detection</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Listens to student voice recordings using OpenAI Whisper to flag missing words,
                mispronunciations, and measure exact reading speed (Words Per Minute).
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-systemYellow-400 flex items-center justify-center mb-6">
                <Brain size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">AI Remedial Tutoring</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generates child-friendly, personalized reading strategies and curated book recommendations
                based on the student's exact test mistakes and comprehension gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              Assessment Flow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Structured, Two-Phase Diagnostic Process
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Readi follows the standardized diagnostic funnel to ensure each learner receives
              the right level of attention and support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Group Screening Test</h4>
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-3">Phase 1: Silent Reading</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students read passages silently and answer comprehension questions. A score threshold (14/20) determines if individual oral testing is needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Oral Reading Test</h4>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">Phase 2: Voice Capture</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students flagged for remediation read graded passages aloud into their microphone. Audio is transcribed and evaluated for accuracy and reading speed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-systemYellow-400 text-slate-900 font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-yellow-500/20">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Phil-IRI Profiling</h4>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-3">Diagnostic Placement</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Word recognition and comprehension scores combine to categorize the reader into Independent, Instructional, or Frustration reading levels.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-systemGreen-400 text-slate-900 font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-green-500/20">
                4
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Remedial Modules</h4>
              <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-3">Intervention & Growth</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI generates targeted reading strategies and suggested storybooks based on mistakes, supported by custom teacher intervention notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PHIL-IRI CLASSIFICATION CRITERIA ================= */}
      <section id="phil-iri" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-secondary uppercase tracking-widest">
                Standards & Compliance
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Standardized Phil-IRI Reading Criteria
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Under the Philippine Informal Reading Inventory framework, student literacy is classified
                using two distinct benchmarks: <strong>Word Reading Accuracy</strong> and <strong>Comprehension</strong>.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                The overall Oral Reading Profile takes the lowest bound constraint to ensure students needing help are never overlooked.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleLoginClick}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary hover:bg-blue-600 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <span>Access Assessment Portal</span>
                  <LogIn size={16} />
                </button>
              </div>
            </div>

            {/* Right Criteria Table */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-blue-700 px-6 py-5 text-white">
                  <h4 className="font-bold text-lg">Phil-IRI Profile Matrix</h4>
                  <p className="text-xs text-blue-100">Official DepEd Informal Reading Inventory Performance Levels</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Independent */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 mb-2">
                        <Check size={14} /> Independent
                      </span>
                      <h5 className="font-bold text-slate-900 text-base">Can read without assistance</h5>
                      <p className="text-xs text-slate-500 mt-1">Excellent comprehension, minimal reading errors.</p>
                    </div>
                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Word Reading</p>
                        <p className="text-base font-bold text-slate-800">97% – 100%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Comprehension</p>
                        <p className="text-base font-bold text-slate-800">80% – 100%</p>
                      </div>
                    </div>
                  </div>

                  {/* Instructional */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
                        <Layers size={14} /> Instructional
                      </span>
                      <h5 className="font-bold text-slate-900 text-base">Benefits from teacher guidance</h5>
                      <p className="text-xs text-slate-500 mt-1">Good grasp with occasional miscues and guidance required.</p>
                    </div>
                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Word Reading</p>
                        <p className="text-base font-bold text-slate-800">90% – 96%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Comprehension</p>
                        <p className="text-base font-bold text-slate-800">59% – 79%</p>
                      </div>
                    </div>
                  </div>

                  {/* Frustration */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 mb-2">
                        <Clock size={14} /> Frustration
                      </span>
                      <h5 className="font-bold text-slate-900 text-base">Requires intensive intervention</h5>
                      <p className="text-xs text-slate-500 mt-1">Struggles with word decoding, accuracy, or comprehension.</p>
                    </div>
                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Word Reading</p>
                        <p className="text-base font-bold text-red-600">&lt; 90%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Comprehension</p>
                        <p className="text-base font-bold text-red-600">&lt; 59%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ROLE-BASED FEATURES ================= */}
      <section id="features" className="py-20 lg:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              Comprehensive Tools
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Teachers & Students
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Every learner and educator receives tailored tools to foster an effective reading community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Students */}
            <div className="rounded-3xl p-8 bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-secondary flex items-center justify-center mb-6">
                  <GraduationCap size={24} />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">For Students</h4>
                <ul className="space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Engaging oral reading tests directly through browser microphone.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Immediate visual feedback showing miscues and reading speed (WPM).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>AI-recommended storybooks and reading tips to practice at home.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Historical score tracking across attempts to see progress over time.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm shadow-sm transition"
                >
                  Student Portal Login
                </button>
              </div>
            </div>

            {/* For Teachers */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-blue-50/50 to-white border-2 border-secondary shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-white text-xs font-bold tracking-wide uppercase shadow">
                Core Educator Hub
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                  <Users size={24} />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">For Teachers</h4>
                <ul className="space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Class roster management with quick registration class codes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Direct playback of student audio recordings to verify pronunciation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>Question-by-question breakdown of student errors.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>One-click test retake permission controls and personalized notes.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3 rounded-full bg-secondary hover:bg-blue-600 text-white font-semibold text-sm shadow-md transition"
                >
                  Teacher Portal Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION (CTA) ================= */}
      <section className="py-20 bg-gradient-to-br from-secondary via-blue-700 to-indigo-900 text-white relative overflow-hidden">
        {/* Decorative blur rings */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-systemYellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-systemYellow-400" />
            <span>Start Elevating Reading Fluency Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to Begin Your Reading Journey?
          </h2>

          <p className="text-base sm:text-xl text-blue-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            Log in to the Readi platform now to access your screening tests, individualized oral reading assessments,
            and class performance dashboards.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLoginClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-systemYellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-lg shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Log In to Readi</span>
              <LogIn size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <LandingFooter />
    </div>
  );
}

