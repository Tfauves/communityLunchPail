"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

const ADMIN_EMAILS = ["admin@yourschool.edu"];

export default function AdminDashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [mealSelections, setMealSelections] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && ADMIN_EMAILS.includes(firebaseUser.email)) {
        setUser(firebaseUser);
        await loadDashboardData();
        setAuthChecked(true);
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, "students"));
      const studentsList = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);

      const today = new Date().toISOString().split("T")[0];
      const mealQuery = query(
        collection(db, "mealSelections"),
        where("date", "==", today)
      );
      const mealsSnap = await getDocs(mealQuery);
      const mealsList = mealsSnap.docs.map((doc) => doc.data());
      setMealSelections(mealsList);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-xl font-semibold animate-pulse">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            🍱 Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-md shadow-sm transition"
          >
            Log Out
          </button>
        </div>

        {/* Meal Selections */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            📋 Meal Selections for Today
          </h2>
          {mealSelections.length > 0 ? (
            <ul className="divide-y divide-blue-100">
              {mealSelections.map((entry, idx) => (
                <li key={idx} className="py-2">
                  <span className="font-medium">User ID:</span> {entry.userId} —{" "}
                  <span
                    className={`font-semibold ${
                      entry.needsMeal ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {entry.needsMeal ? "✅ Needs Meal" : "❌ No Meal"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">
              No meal selections submitted today.
            </p>
          )}
        </div>

        {/* Students List */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-400">
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">
            👥 Registered Students
          </h2>
          {students.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="bg-yellow-50 border border-yellow-200 p-4 rounded-md shadow-sm"
                >
                  <p className="font-semibold text-lg text-yellow-700">
                    {student.name || "Unnamed"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Lunch ID: {student.lunchId || "N/A"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">
              No registered students found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
