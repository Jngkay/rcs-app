import React from "react";
import TeacherLayout from "../../layout/teacherLayout";

export default function Assignments() {
  return (
    <TeacherLayout>
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="mt-2 text-white/80 text-sm font-light">Manage student assignments and tasks</p>
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
