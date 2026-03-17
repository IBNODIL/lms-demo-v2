"use client";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your learning management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Courses</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-600 text-sm">courses enrolled</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Progress</h3>
          <p className="text-3xl font-bold text-green-600">0%</p>
          <p className="text-gray-600 text-sm">overall progress</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Certificates</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-gray-600 text-sm">earned</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <p className="text-gray-600">No recent activity yet.</p>
      </div>
    </div>
  );
}