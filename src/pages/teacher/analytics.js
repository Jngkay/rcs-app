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
          let isGstAttempted = student.gst_assessment_attempted || !!gstData;
          if (gstRaw !== undefined && gstRaw !== null && gstTotal > 0) {
            gstScore = Math.round((Number(gstRaw) / Number(gstTotal)) * 100);
            totalGstSum += gstScore;
            gstCount++;
          }

          const hasPassedGst = (gstRaw !== undefined && gstRaw !== null && Number(gstRaw) >= 14) || student.gst_status === "PASSED_GST";
          if (hasPassedGst) {
            passedGstCount++;
            noRemediationCount++;
          } else if (student.needs_remediation === false) {
            noRemediationCount++;
          }

          // Calculate Individualized Assessment score & percentage
          const indRaw = indData?.score ?? student.individualized_score;
          const indCompPercent = indData?.comprehension_percentage ?? student.individualized_comprehension_percentage;

          let indScore = null;
          if (indCompPercent !== undefined && indCompPercent !== null) {
            indScore = Math.round(Number(indCompPercent));
            totalIndSum += indScore;
            indCount++;
          } else if (indRaw !== undefined && indRaw !== null) {
            indScore = Math.round((Number(indRaw) / 10) * 100);
            totalIndSum += indScore;
            indCount++;
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
          } else if (student.individualized_assessment_attempted || indScore !== null) {
            if (indScore !== null) {
              if (indScore >= 80) {
                levelStatus = "INDEPENDENT";
                indep++;
              } else if (indScore >= 60) {
                levelStatus = "INSTRUCTIONAL";
                instruct++;
              } else {
                levelStatus = "FRUSTRATION";
                frust++;
              }
            } else {
              pend++;
            }
          } else {
            pend++;
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
            hasPassedGst
          };
        })
      );

      setStudents(enrichedStudents);

      const totalAssessed = passedGstCount + indep + instruct + frust;

      setMetrics({
        totalStudents: myStudents.length,
        assessedCount: totalAssessed,
        passedGstCount,
        noRemediationCount,
        avgGstScore: gstCount > 0 ? Math.round(totalGstSum / gstCount) : 0,
        avgIndScore: indCount > 0 ? Math.round(totalIndSum / indCount) : 0,
        independentCount: indep,
        instructionalCount: instruct,
        frustrationCount: frust,
        pendingCount: pend,
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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Hero Banner */}
        <div className="bg-blue-600 text-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2 inline-block">
              Reading Comprehension Analytics
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">Student Comprehension Performance</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Track, analyze, and support reading comprehension levels across all your assigned classes.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center min-w-[140px]">
            <p className="text-xs text-blue-100 uppercase tracking-wide font-medium">Overall Assessed</p>
            <p className="text-3xl font-black mt-1">{metrics.assessedCount} / {metrics.totalStudents}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution Progress Bars */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Comprehension Level Distribution</h3>
                    <p className="text-xs text-slate-500">Overall status breakdown across all students</p>
                  </div>
                  <BarChart className="text-slate-400" size={20} />
                </div>

                <div className="space-y-5">
                  {/* Passed GST (No Remediation Required) */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">Passed GST - Exempt from Remediation</span>
                      <span className="text-green-700 font-bold">{metrics.passedGstCount} Students</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metrics.totalStudents > 0 ? (metrics.passedGstCount / metrics.totalStudents) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Independent Tier Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">Individualized: Independent (80% - 100%)</span>
                      <span className="text-emerald-700 font-bold">{metrics.independentCount} Students</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metrics.totalStudents > 0 ? (metrics.independentCount / metrics.totalStudents) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Instructional Tier Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">Individualized: Instructional (60% - 79%)</span>
                      <span className="text-[#0580b2] font-bold">{metrics.instructionalCount} Students</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0580b2] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metrics.totalStudents > 0 ? (metrics.instructionalCount / metrics.totalStudents) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Frustration Tier Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">Individualized: Frustration (&lt; 60%)</span>
                      <span className="text-red-600 font-bold">{metrics.frustrationCount} Students</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metrics.totalStudents > 0 ? (metrics.frustrationCount / metrics.totalStudents) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
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

            {/* Comprehension Distribution Breakdown Per Grade Level */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Grade Level Comprehension Breakdown</h3>
                <p className="text-xs text-slate-500">Distribution of student performance across different grade levels handled</p>
              </div>

              {Object.keys(metrics.gradeBreakdown).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(metrics.gradeBreakdown).map(([gradeName, data]) => (
                    <div key={gradeName} className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 text-base">{gradeName}</h4>
                        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                          {data.total} Student{data.total > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Passed GST (No Rem.):</span>
                          <span className="font-bold text-green-700">{data.passedGst}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Independent:</span>
                          <span className="font-bold text-emerald-700">{data.independent}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Instructional:</span>
                          <span className="font-bold text-blue-700">{data.instructional}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Frustration:</span>
                          <span className="font-bold text-red-600">{data.frustration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Pending:</span>
                          <span className="font-bold text-slate-500">{data.pending}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No grade breakdown data available.</p>
              )}
            </div>

            {/* Student Performance Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Individual Student Performance</h3>
                  <p className="text-xs text-slate-500">Detailed GST & Individual Assessment scores</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PASSED_GST">Passed (GST)</option>
                    <option value="INDEPENDENT">Independent</option>
                    <option value="INSTRUCTIONAL">Instructional</option>
                    <option value="FRUSTRATION">Frustration</option>
                    <option value="PENDING">Pending</option>
                  </select>

                  {/* Search Bar */}
                  <div className="relative flex items-center w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search student or class..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0580b2]"
                    />
                    <Search size={14} className="absolute right-3 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-800">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Class Code</th>
                      <th className="p-3">GST Score</th>
                      <th className="p-3">Indiv. Score</th>
                      <th className="p-3">Reading Status</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="p-3 text-xs">{student.grade_level || student.grade || "N/A"}</td>
                          <td className="p-3 text-xs font-mono">{student.classCode || "N/A"}</td>
                          <td className="p-3 font-bold text-slate-900">
                            {student.gstScore !== null ? `${student.gstScore}%` : <span className="text-slate-400 font-normal text-xs">Not Taken</span>}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {student.indScore !== null ? `${student.indScore}%` : <span className="text-slate-400 font-normal text-xs">Not Taken</span>}
                          </td>
                          <td className="p-3">{getStatusBadge(student.levelStatus)}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudentDetail(student);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1.5 bg-[#e6f4f8] hover:bg-[#d5edf5] text-[#0580b2] text-xs font-bold rounded-lg transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                          No student records matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Detailed Student Analytics Modal */}
        {showDetailModal && selectedStudentDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-800">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStudentDetail.first_name} {selectedStudentDetail.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Class: {selectedStudentDetail.classCode} | Grade: {selectedStudentDetail.grade_level || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Assessment Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Group Screening Test</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedStudentDetail.gstScore !== null ? `${selectedStudentDetail.gstScore}%` : "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Correct: {selectedStudentDetail.gstData?.gst_score || 0} / {selectedStudentDetail.gstData?.gst_total_questions || 0}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Individual Assessment</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedStudentDetail.indScore !== null ? `${selectedStudentDetail.indScore}%` : "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Correct: {selectedStudentDetail.indData?.score || 0} / {selectedStudentDetail.indData?.total_questions || 0}
                  </p>
                </div>
              </div>

              {/* Reading Status */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600">Assessed Level Category</span>
                  {getStatusBadge(selectedStudentDetail.levelStatus)}
                </div>
                {selectedStudentDetail.gstData?.reading_speed_wpm && (
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <span>Reading Speed WPM:</span>
                    <span className="font-bold text-slate-800">{selectedStudentDetail.gstData.reading_speed_wpm} WPM</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
