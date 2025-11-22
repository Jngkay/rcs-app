import React from "react";
import TeacherLayout from "../../layout/teacherLayout";

export default function Performance() {
  return (
    <TeacherLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance</h1>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>
    </TeacherLayout>
  );
}
