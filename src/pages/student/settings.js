import React from "react";
import MainLayout from "../../layout/mainLayout";

export default function Settings() {
  return (
    <MainLayout>
      <div className="bg-secondary text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Setting Student</h1>
            <p className="mt-2 text-white/80 text-sm font-light">Manage your setting student</p>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="books"
          className="w-32"
        />
      </div>
    </MainLayout>
  );
}
