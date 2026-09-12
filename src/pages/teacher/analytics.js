import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layout/teacherLayout";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import {
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  Search,
  BookOpen,
  CheckCircle,
  HelpCircle,
  BarChart,
  FileText
} from "lucide-react";

export default function TeacherAnalytics() {
  const db = getFirestore();
  const teacher_id = localStorage.getItem("uuid");

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Distribution Filters
  const [distributionGradeFilter, setDistributionGradeFilter] = useState("ALL");
  const [distributionClassFilter, setDistributionClassFilter] = useState("ALL");
  const [indGradeFilter, setIndGradeFilter] = useState("ALL");

  // Analytics Metrics State
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    assessedCount: 0,
    passedGstCount: 0,
    noRemediationCount: 0,
    avgGstScore: 0,
    avgIndScore: 0,
    independentCount: 0,
    instructionalCount: 0,
    frustrationCount: 0,
    pendingCount: 0,
    gradeBreakdown: {}
  });

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch teacher's classes
      const classesQuery = query(
        collection(db, "classes"),
        where("teacher_id", "==", teacher_id)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const teacherClasses = classesSnapshot.docs.map((d) => d.data());
      setClasses(teacherClasses);

      const teacherClassCodes = teacherClasses.map((c) => c.class_code).filter(Boolean);

      // 2. Fetch all students
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const allStudents = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter students who belong to teacher's classes or assigned teacher_id
      let myStudents = allStudents;
      if (teacherClassCodes.length > 0) {
        myStudents = allStudents.filter((student) =>
          teacherClassCodes.includes(student.classCode) ||
          student.teacher_id === teacher_id ||
          student.assigned_teacher_id === teacher_id
        );
      }

      // If no class match found, fall back to all students if teacher has no classes configured yet
      if (myStudents.length === 0 && teacherClassCodes.length === 0) {
        myStudents = allStudents;
      }

      // 3. Aggregate GST & Individualized Assessment metrics from Firestore
      let totalGstSum = 0;
      let gstCount = 0;
      let totalIndSum = 0;
      let indCount = 0;
      let passedGstCount = 0;
      let noRemediationCount = 0;
      let indep = 0;
      let instruct = 0;
      let frust = 0;
      let pend = 0;
      const gradeMap = {};

      const enrichedStudents = await Promise.all(
        myStudents.map(async (student) => {
          let gstData = null;
          let indData = null;

          try {
            const gstDocRef = doc(db, "user_gst", student.id);
            const gstSnap = await getDoc(gstDocRef);
            if (gstSnap.exists()) {
              gstData = gstSnap.data();
            }

            const indDocRef = doc(db, "user_individual_assessment", student.id);
            const indSnap = await getDoc(indDocRef);
            if (indSnap.exists()) {
              indData = indSnap.data();
            }
          } catch (e) {
            console.error("Error fetching student assessment documents:", e);
          }

          // Calculate GST raw score
          const gstRaw = gstData?.gst_score ?? gstData?.score ?? student.gst_score;
          const gstTotal = gstData?.gst_total_questions ?? gstData?.total_questions ?? student.gst_total_questions ?? 14;

          let gstScore = null;
          let isGstAttempted = student.gst_assessment_attempted === true || !!gstData || student.gst_status === "PASSED_GST" || student.gst_status === "FAILED_GST";
          if (isGstAttempted && gstRaw !== undefined && gstRaw !== null && gstTotal > 0) {
            gstScore = Math.round((Number(gstRaw) / Number(gstTotal)) * 100);
            totalGstSum += gstScore;
            gstCount++;
          }

          const hasPassedGst = isGstAttempted && ((gstRaw !== undefined && gstRaw !== null && Number(gstRaw) >= 14) || student.gst_status === "PASSED_GST");
          if (hasPassedGst) {
            passedGstCount++;
            noRemediationCount++;
          } else if (isGstAttempted && student.needs_remediation === false) {
            noRemediationCount++;
          }

          // Calculate Individualized Assessment score & percentage
          const indRaw = indData?.score ?? student.individualized_score;
          const indCompPercent = indData?.comprehension_percentage ?? student.individualized_comprehension_percentage;

          let isIndAttempted = student.individualized_assessment_attempted === true || !!indData || student.individualized_status === "COMPLETED";
          let indScore = null;
          if (isIndAttempted) {
            if (indCompPercent !== undefined && indCompPercent !== null) {
              indScore = Math.round(Number(indCompPercent));
              totalIndSum += indScore;
              indCount++;
            } else if (indRaw !== undefined && indRaw !== null) {
              indScore = Math.round((Number(indRaw) / 10) * 100);
              totalIndSum += indScore;
              indCount++;
            }
          }

          // Determine Reading Level Status (Phil-IRI levels)
          const profileStr = (student.oral_reading_profile || indData?.oral_reading_profile || "").toUpperCase();
          let levelStatus = "PENDING";

          if (hasPassedGst) {
            levelStatus = "PASSED_GST";
          } else if (profileStr.includes("INDEPENDENT")) {
            levelStatus = "INDEPENDENT";
            indep++;
          } else if (profileStr.includes("INSTRUCTIONAL")) {
            levelStatus = "INSTRUCTIONAL";
            instruct++;
          } else if (profileStr.includes("FRUSTRATION")) {
            levelStatus = "FRUSTRATION";
            frust++;
          } else {
            const evalScore = indScore !== null ? indScore : gstScore;
            if (evalScore !== null && evalScore !== undefined) {
              if (evalScore >= 80) {
                levelStatus = "INDEPENDENT";
                indep++;
              } else if (evalScore >= 60) {
                levelStatus = "INSTRUCTIONAL";
                instruct++;
              } else {
                levelStatus = "FRUSTRATION";
                frust++;
              }
            } else {
              pend++;
            }
          }

          // Grade level aggregation (Comprehension breakdown per grade)
          const rawGradeStr = (student.grade_level || student.grade || "4").toString();
          const gradeNum = rawGradeStr.replace(/[^0-9]/g, '') || "4";
          const gradeKey = `Grade ${gradeNum}`;
          if (!gradeMap[gradeKey]) {
            gradeMap[gradeKey] = {
              total: 0,
              passedGst: 0,
              independent: 0,
              instructional: 0,
              frustration: 0,
              pending: 0
            };
          }
          gradeMap[gradeKey].total++;
          if (levelStatus === "PASSED_GST") {
            gradeMap[gradeKey].passedGst++;
          } else if (levelStatus === "INDEPENDENT") {
            gradeMap[gradeKey].independent++;
          } else if (levelStatus === "INSTRUCTIONAL") {
            gradeMap[gradeKey].instructional++;
          } else if (levelStatus === "FRUSTRATION") {
            gradeMap[gradeKey].frustration++;
          } else {
            gradeMap[gradeKey].pending++;
          }

          // Extract Word Reading Level, Comprehension Level, and Reading Rate (WPM)
          const wordReadingLevel = student.word_reading_level || indData?.word_reading_level || (isIndAttempted ? (student.individualized_score >= 97 ? "Independent" : student.individualized_score >= 90 ? "Instructional" : student.individualized_score !== undefined ? "Frustration" : "N/A") : "N/A");
          const comprehensionLevel = student.comprehension_level || indData?.comprehension_level || (isIndAttempted && indScore !== null ? (indScore >= 80 ? "Independent" : indScore >= 60 ? "Instructional" : "Frustration") : "N/A");
          const readingRate = student.word_per_minute || indData?.reading_rate || indData?.word_per_minute || 0;

          return {
            ...student,
            gstData,
            indData,
            gstScore,
            indScore,
            levelStatus,
            gstRaw,
            gstTotal,
            indRaw,
            hasPassedGst,
            wordReadingLevel,
            comprehensionLevel,
            readingRate
          };
        })
      );

      setStudents(enrichedStudents);

      // Aggregate Individualized Assessment breakdown metrics across students
      let totalWpmSum = 0;
      let wpmCount = 0;
      let wordLevelIndepCount = 0;
      let wordLevelInstructCount = 0;
      let wordLevelFrustCount = 0;
      let compLevelIndepCount = 0;
      let compLevelInstructCount = 0;
      let compLevelFrustCount = 0;

      enrichedStudents.forEach(s => {
        if (s.readingRate && Number(s.readingRate) > 0) {
          totalWpmSum += Number(s.readingRate);
          wpmCount++;
        }
        if (s.wordReadingLevel === "Independent") wordLevelIndepCount++;
        else if (s.wordReadingLevel === "Instructional") wordLevelInstructCount++;
        else if (s.wordReadingLevel === "Frustration") wordLevelFrustCount++;

        if (s.comprehensionLevel === "Independent") compLevelIndepCount++;
        else if (s.comprehensionLevel === "Instructional") compLevelInstructCount++;
        else if (s.comprehensionLevel === "Frustration") compLevelFrustCount++;
      });

      const totalAssessed = passedGstCount + indep + instruct + frust;

      setMetrics({
        totalStudents: myStudents.length,
        assessedCount: totalAssessed,
        passedGstCount,
        noRemediationCount,
        avgGstScore: gstCount > 0 ? Math.round(totalGstSum / gstCount) : 0,
        avgIndScore: indCount > 0 ? Math.round(totalIndSum / indCount) : 0,
        avgWpm: wpmCount > 0 ? Math.round(totalWpmSum / wpmCount) : 0,
        independentCount: indep,
        instructionalCount: instruct,
        frustrationCount: frust,
        pendingCount: pend,
        wordLevelIndepCount,
        wordLevelInstructCount,
        wordLevelFrustCount,
        compLevelIndepCount,
        compLevelInstructCount,
        compLevelFrustCount,
        gradeBreakdown: gradeMap
      });
    } catch (err) {
      console.error("Error generating analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher_id) {
      fetchAnalyticsData();
    }
  }, [teacher_id]);

  // Filtering students
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const name = `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
    const code = (student.classCode || "").toLowerCase();
    const matchesSearch = name.includes(searchLower) || code.includes(searchLower);

    if (selectedStatus === "all") return matchesSearch;
    return matchesSearch && student.levelStatus === selectedStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "PASSED_GST":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <CheckCircle size={14} /> Passed (GST)
          </span>
        );
      case "INDEPENDENT":
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <CheckCircle size={14} /> Independent
          </span>
        );
      case "INSTRUCTIONAL":
        return (
          <span className="px-3 py-1 bg-blue-100 text-[#0580b2] rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <TrendingUp size={14} /> Instructional
          </span>
        );
      case "FRUSTRATION":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <AlertCircle size={14} /> Frustration
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
            <HelpCircle size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <TeacherLayout>


      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reading Comprehension Analytics</h1>
          {/* <p className="mt-2 text-white/80 text-sm font-light">View and manage student accounts and GST results</p> */}
          <p className="text-sm mt-1 text-blue-100">Track, analyze, and support reading comprehension levels across all your assigned classes.</p>
        </div>
        <div className="flex">
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center min-w-[140px]">
            <p className="text-xs text-blue-100 uppercase tracking-wide font-medium">Overall Assessed</p>
            <p className="text-3xl font-black mt-1">{metrics.assessedCount} / {metrics.totalStudents}</p>
          </div>
          <img
            src={require("../../assets/analysis.png")}
            alt="student"
            className="w-32 drop-shadow-md"
          />
        </div>

      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0580b2] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Passed GST / No Remediation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">No Remediation</span>
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <CheckCircle size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics.passedGstCount}</h3>
              <p className="text-xs text-green-600 font-medium mt-1">Passed GST Score</p>
            </div>

            {/* Average GST Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Avg GST Score</span>
                <div className="p-2 bg-blue-50 text-[#0580b2] rounded-xl">
                  <Award size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics.avgGstScore}%</h3>
              <p className="text-xs text-slate-500 mt-1">Group Screening Test average</p>
            </div>

            {/* Independent Readers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Independent</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <BookOpen size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics.independentCount}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Individualized Reading Profile</p>
            </div>

            {/* Instructional Level */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Instructional</span>
                <div className="p-2 bg-blue-50 text-[#0580b2] rounded-xl">
                  <TrendingUp size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics.instructionalCount}</h3>
              <p className="text-xs text-[#0580b2] font-medium mt-1">Individualized Reading Profile</p>
            </div>

            {/* Frustration / Needs Support */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Needs Support</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <AlertCircle size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics.frustrationCount}</h3>
              <p className="text-xs text-red-600 font-medium mt-1">Frustration Level</p>
            </div>
          </div>

          {/* Performance Tier Distribution & Grade Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            {/* Distribution Progress Bars & Visual Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Comprehension Level Distribution</h3>
                  <p className="text-xs text-slate-500">Filter distribution by grade level or class</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Grade Filter */}
                  <select
                    value={distributionGradeFilter}
                    onChange={(e) => setDistributionGradeFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
                  >
                    <option value="ALL">All Grades</option>
                    {Array.from(new Set(students.map(s => (s.grade_level || s.grade || "4").toString().replace(/[^0-9]/g, '') || "4"))).sort().map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>

                  {/* Class Filter */}
                  <select
                    value={distributionClassFilter}
                    onChange={(e) => setDistributionClassFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map(c => (
                      <option key={c.class_code} value={c.class_code}>
                        {c.subject_name || c.class_name || c.class_code} ({c.class_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                // Calculate distribution subset based on filters
                const subset = students.filter(student => {
                  const gradeNum = (student.grade_level || student.grade || "4").toString().replace(/[^0-9]/g, '') || "4";
                  const matchesGrade = distributionGradeFilter === "ALL" || gradeNum === distributionGradeFilter;
                  const matchesClass = distributionClassFilter === "ALL" || student.classCode === distributionClassFilter;
                  return matchesGrade && matchesClass;
                }).filter(s => s.levelStatus !== "PENDING");

                const totalInSubset = subset.length;
                const passedGstCount = subset.filter(s => s.levelStatus === "PASSED_GST").length;
                const independentCount = subset.filter(s => s.levelStatus === "INDEPENDENT").length;
                const instructionalCount = subset.filter(s => s.levelStatus === "INSTRUCTIONAL").length;
                const frustrationCount = subset.filter(s => s.levelStatus === "FRUSTRATION").length;

                const getPct = (cnt) => totalInSubset > 0 ? Math.round((cnt / totalInSubset) * 100) : 0;

                const pGst = getPct(passedGstCount);
                const pInd = getPct(independentCount);
                const pIns = getPct(instructionalCount);
                const pFru = getPct(frustrationCount);

                // Calculate SVG Donut strokeDasharray segments (radius=40, circumference=2*pi*40 ~ 251.32)
                const circ = 251.32;
                const strokeGst = (pGst / 100) * circ;
                const strokeInd = (pInd / 100) * circ;
                const strokeIns = (pIns / 100) * circ;
                const strokeFru = (pFru / 100) * circ;

                const offGst = 0;
                const offInd = -strokeGst;
                const offIns = -(strokeGst + strokeInd);
                const offFru = -(strokeGst + strokeInd + strokeIns);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Donut Chart Visualizer */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Base track */}
                          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />

                          {totalInSubset > 0 ? (
                            <>
                              {/* Passed GST */}
                              <circle cx="50" cy="50" r="40" stroke="#22c55e" strokeWidth="12" fill="transparent"
                                strokeDasharray={`${strokeGst} ${circ}`} strokeDashoffset={offGst} className="transition-all duration-700" />
                              {/* Independent */}
                              <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="12" fill="transparent"
                                strokeDasharray={`${strokeInd} ${circ}`} strokeDashoffset={offInd} className="transition-all duration-700" />
                              {/* Instructional */}
                              <circle cx="50" cy="50" r="40" stroke="#eab308" strokeWidth="12" fill="transparent"
                                strokeDasharray={`${strokeIns} ${circ}`} strokeDashoffset={offIns} className="transition-all duration-700" />
                              {/* Frustration */}
                              <circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="12" fill="transparent"
                                strokeDasharray={`${strokeFru} ${circ}`} strokeDashoffset={offFru} className="transition-all duration-700" />
                            </>
                          ) : null}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-slate-800">{totalInSubset}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Students</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 mt-2">Overall Category Split</span>
                    </div>

                    {/* Progress Bars */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Passed GST (No Remediation Required) */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                            Passed GST - Exempt from Remediation
                          </span>
                          <span className="text-green-700 font-bold">
                            {passedGstCount} / {totalInSubset} <span className="text-green-600 font-medium">({pGst}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${pGst}%` }}></div>
                        </div>
                      </div>

                      {/* Independent Tier Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                            Individualized: Independent (80% - 100%)
                          </span>
                          <span className="text-blue-700 font-bold">
                            {independentCount} / {totalInSubset} <span className="text-blue-600 font-medium">({pInd}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pInd}%` }}></div>
                        </div>
                      </div>

                      {/* Instructional Tier Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                            Individualized: Instructional (60% - 79%)
                          </span>
                          <span className="text-yellow-700 font-bold">
                            {instructionalCount} / {totalInSubset} <span className="text-yellow-600 font-medium">({pIns}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${pIns}%` }}></div>
                        </div>
                      </div>

                      {/* Frustration Tier Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                            Individualized: Frustration (&lt; 60%)
                          </span>
                          <span className="text-red-600 font-bold">
                            {frustrationCount} / {totalInSubset} <span className="text-red-500 font-medium">({pFru}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${pFru}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Class Summary Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Class Statistics</h3>
                <p className="text-xs text-slate-500 mb-6">Active class codes overview</p>

                <div className="space-y-3">
                  {classes.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{c.class_name || c.class_code}</p>
                        <p className="text-xs text-slate-500">Code: {c.class_code}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-[#0580b2] text-xs font-bold rounded-lg">
                        Grade {c.grade_level || "N/A"}
                      </span>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No active classes found.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Exempt from Remediation:</span>
                  <span className="text-green-600 font-bold">{metrics.passedGstCount} Students</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Pending Assessment:</span>
                  <span className="text-amber-600 font-bold">{metrics.pendingCount} Students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated Individualized Metrics Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Individualized Assessment Score Breakdown</h3>
                <p className="text-xs text-slate-500">Aggregated metrics for Word Reading Level, Comprehension Level, and Reading Rate</p>
              </div>

              {/* Grade Level Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Grade Level:</label>
                <select
                  value={indGradeFilter}
                  onChange={(e) => setIndGradeFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
                >
                  <option value="ALL">All Grades</option>
                  {Array.from(new Set(students.map(s => (s.grade_level || s.grade || "4").toString().replace(/[^0-9]/g, '') || "4"))).sort().map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            {(() => {
              // Filter student subset based on grade filter
              const indSubset = students.filter(student => {
                const gradeNum = (student.grade_level || student.grade || "4").toString().replace(/[^0-9]/g, '') || "4";
                const matchesGrade = indGradeFilter === "ALL" || gradeNum === indGradeFilter;
                return matchesGrade;
              });

              let wordIndep = 0, wordInstruct = 0, wordFrust = 0;
              let compIndep = 0, compInstruct = 0, compFrust = 0;
              let sumWpm = 0, wpmCount = 0;
              let sumCompPct = 0, compCount = 0;

              indSubset.forEach(s => {
                if (s.wordReadingLevel === "Independent") wordIndep++;
                else if (s.wordReadingLevel === "Instructional") wordInstruct++;
                else if (s.wordReadingLevel === "Frustration") wordFrust++;

                if (s.comprehensionLevel === "Independent") compIndep++;
                else if (s.comprehensionLevel === "Instructional") compInstruct++;
                else if (s.comprehensionLevel === "Frustration") compFrust++;

                if (s.readingRate && Number(s.readingRate) > 0) {
                  sumWpm += Number(s.readingRate);
                  wpmCount++;
                }

                if (s.indScore !== null && s.indScore !== undefined) {
                  sumCompPct += Number(s.indScore);
                  compCount++;
                }
              });

              // Count assessed students in individualized assessment
              const assessedIndStudents = indSubset.filter(s =>
                s.individualized_assessment_attempted || !!s.indData || s.indScore !== null || (s.wordReadingLevel && s.wordReadingLevel !== "N/A")
              );
              const totalIndAssessed = assessedIndStudents.length;
              const avgWpmSubset = wpmCount > 0 ? Math.round(sumWpm / wpmCount) : 0;
              const avgCompSubset = compCount > 0 ? Math.round(sumCompPct / compCount) : 0;

              const getPctWord = (val) => totalIndAssessed > 0 ? Math.round((val / totalIndAssessed) * 100) : 0;
              const getPctComp = (val) => totalIndAssessed > 0 ? Math.round((val / totalIndAssessed) * 100) : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Word Reading Level Aggregation Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <BookOpen size={16} className="text-blue-600" /> Word Reading Level
                      </h4>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        {totalIndAssessed} Assessed
                      </span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Independent (97% - 100%):</span>
                          <span className="font-bold text-emerald-700">{wordIndep} ({getPctWord(wordIndep)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctWord(wordIndep)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Instructional (90% - 96%):</span>
                          <span className="font-bold text-blue-700">{wordInstruct} ({getPctWord(wordInstruct)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctWord(wordInstruct)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Frustration (&lt; 90%):</span>
                          <span className="font-bold text-red-600">{wordFrust} ({getPctWord(wordFrust)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctWord(wordFrust)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehension Level Aggregation Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Award size={16} className="text-[#0580b2]" /> Comprehension Level
                      </h4>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Avg: {avgCompSubset}%
                      </span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Independent (80% - 100%):</span>
                          <span className="font-bold text-emerald-700">{compIndep} ({getPctComp(compIndep)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctComp(compIndep)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Instructional (59% - 79%):</span>
                          <span className="font-bold text-blue-700">{compInstruct} ({getPctComp(compInstruct)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctComp(compInstruct)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="text-slate-600">Frustration (&lt; 59%):</span>
                          <span className="font-bold text-red-600">{compFrust} ({getPctComp(compFrust)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPctComp(compFrust)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Rate (WPM) Aggregation Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-emerald-600" /> Reading Fluency Rate
                      </h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        WPM Speed
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 text-center my-auto">
                      <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-400 flex flex-col items-center justify-center shadow-inner mb-2">
                        <span className="text-3xl font-black text-emerald-800">{avgWpmSubset}</span>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">WPM</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">Average Words Per Minute</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Grade Level Comprehension Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Grade Level Comprehension Breakdown</h3>
              <p className="text-xs text-slate-500">Visual comparison of reading levels across different grade levels</p>
            </div>

            {Object.keys(metrics.gradeBreakdown).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(metrics.gradeBreakdown).map(([gradeName, data]) => {
                  const assessedCount = data.passedGst + data.independent + data.instructional + data.frustration;
                  const totalG = assessedCount > 0 ? assessedCount : 1;
                  const pctP = Math.round((data.passedGst / totalG) * 100);
                  const pctInd = Math.round((data.independent / totalG) * 100);
                  const pctIns = Math.round((data.instructional / totalG) * 100);
                  const pctFru = Math.round((data.frustration / totalG) * 100);

                  return (
                    <div key={gradeName} className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 text-base">{gradeName}</h4>
                        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                          {assessedCount} Student{assessedCount !== 1 ? "s" : ""} Assessed
                        </span>
                      </div>

                      {/* Grade Stacked Bar Chart Visual */}
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex shadow-inner">
                        <div style={{ width: `${pctP}%` }} className="bg-green-500 h-full transition-all" title={`Passed GST: ${data.passedGst} (${pctP}%)`}></div>
                        <div style={{ width: `${pctInd}%` }} className="bg-blue-500 h-full transition-all" title={`Independent: ${data.independent} (${pctInd}%)`}></div>
                        <div style={{ width: `${pctIns}%` }} className="bg-yellow-500 h-full transition-all" title={`Instructional: ${data.instructional} (${pctIns}%)`}></div>
                        <div style={{ width: `${pctFru}%` }} className="bg-red-500 h-full transition-all" title={`Frustration: ${data.frustration} (${pctFru}%)`}></div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Passed GST (No Rem.):
                          </span>
                          <span className="font-bold text-green-700">{data.passedGst} ({pctP}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Independent:
                          </span>
                          <span className="font-bold text-blue-700">{data.independent} ({pctInd}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Instructional:
                          </span>
                          <span className="font-bold text-yellow-700">{data.instructional} ({pctIns}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Frustration:
                          </span>
                          <span className="font-bold text-red-600">{data.frustration} ({pctFru}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No grade breakdown data available.</p>
            )}
          </div>
        </>
      )}
      {/* </div> */}
    </TeacherLayout>
  );
}
