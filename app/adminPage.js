"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the path as necessary

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [stats, setStats] = useState({ total: 0, needsLunch: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "lunchRequests"),
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate)
      );

      const querySnapshot = await getDocs(q);
      let needsLunchCount = 0;

      querySnapshot.forEach((doc) => {
        if (doc.data().needsLunch) needsLunchCount++;
      });

      setStats({
        total: querySnapshot.size,
        needsLunch: needsLunchCount,
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Lunch Program Analytics
        </h1>

        <div className="mb-4">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700">Total Requests</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700">Lunches Needed</h3>
              <p className="text-3xl font-bold">{stats.needsLunch}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
