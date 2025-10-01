import React from "react";
import MainLayout from "../layout/mainLayout";

export default function Lessons() {
  return (
    <MainLayout>
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div className="pb-20">
          <h1 className="text-4xl font-bold">Choose the Recommended Modules</h1>
          <p>Check your Reading Assessments</p>
        </div>
      </div>

      {/* Recommended Modules Div */}
      <div className="text-center mt-8">
        <h1 className="text-4xl font-bold">Recommended Modules</h1>
        <p>Based on your progress and preferences</p>
        <button className="bg-black  mt-4 px-16 py-2 text-white rounded-md">View All</button>
      </div>
      <div className="grid grid-flow-col gap-4 mt-12 h-50px">
        <div className="border rounded-lg overflow-hidden shadow-md">
          {/* Top Badge */}
          <span className="absolute bg-gray-200 text-xs text-gray-800 px-2 py-1 rounded m-2">
            Beginner
          </span>

          {/* Main Content */}
          <div className="bg-gray-100 h-80 flex items-center justify-center">
            <p className="text-sm text-gray-700">Module 1 Overview</p>
          </div>

          {/* Bottom Section */}
          <div className="bg-white p-4">
            <h2 className="text-md font-medium text-gray-900">Introduction to Literature</h2>
            <p className="text-lg font-bold text-black mt-2">4 lessons</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden shadow-md">
          {/* Top Badge */}
          <span className="absolute bg-gray-200 text-xs text-gray-800 px-2 py-1 rounded m-2">
            Intermediate
          </span>

          {/* Main Content */}
          <div className="bg-gray-100 h-80 flex items-center justify-center">
            <p className="text-sm text-gray-700">Module 2 Overview</p>
          </div>

          {/* Bottom Section */}
          <div className="bg-white p-4">
            <h2 className="text-md font-medium text-gray-900">Creative Writing 101</h2>
            <p className="text-lg font-bold text-black mt-2">5 lessons</p>
          </div>
        </div>


        <div className="border rounded-lg overflow-hidden shadow-md">
          {/* Top Badge */}
          <span className="absolute bg-gray-200 text-xs text-gray-800 px-2 py-1 rounded m-2">
            Advanced
          </span>

          {/* Main Content */}
          <div className="bg-gray-100 h-80 flex items-center justify-center">
            <p className="text-sm text-gray-700">Module 3 Overview</p>
          </div>

          {/* Bottom Section */}
          <div className="bg-white p-4">
            <h2 className="text-md font-medium text-gray-900">Poetry and Prose</h2>
            <p className="text-lg font-bold text-black mt-2">6 lessons</p>
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="text-center mt-24 w-lg">
        <h1 className="text-4xl font-bold">Popular Topics</h1>
        <p>Explore modules on these trending topics.</p>
        <button className="bg-black  mt-4 px-16 py-2 text-white rounded-md">Explore Topics</button>
      </div>

      <div className="grid grid-flow-col gap-4 mt-12 ">
          <div className="border rounded-lg p-4 flex items-start gap-4 shadow-sm bg-white">
              {/* Image Placeholder */}
              <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Science Fiction</h2>
                <p className="text-sm text-gray-500">Explore futuristic worlds</p>
                <p className="mt-2 text-sm text-gray-700">
                  Diving into the realms of imagination through literature.
                </p>

                {/* Tags */}
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                    Science
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                    Fiction
                  </span>
                </div>
              </div>
          </div>

          <div className="border rounded-lg p-4 flex items-start gap-4 shadow-sm bg-white">
              {/* Image Placeholder */}
              <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">History</h2>
                <p className="text-sm text-gray-500">Learn form the past</p>
                <p className="mt-2 text-sm text-gray-700">
                  Uncover the stories and events that shaped our world.
                </p>

                {/* Tags */}
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                    Hsitorical
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                    Non-fiction
                  </span>
                </div>
              </div>
          </div>
      </div>
    </MainLayout>
  );
}
