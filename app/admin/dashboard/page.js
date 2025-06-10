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
        router.replace("/"); // prevent back-button flash
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
      <div className="min-h-screen flex items-center justify-center text-pink-600 text-xl font-bold animate-pulse">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-pink-600 drop-shadow-sm">
            🍱 Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm bg-white hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-full shadow-sm transition"
          >
            Log Out
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-pink-300">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">
            📋 Meal Selections for Today
          </h2>
          {mealSelections.length > 0 ? (
            <ul className="space-y-2">
              {mealSelections.map((entry, idx) => (
                <li
                  key={idx}
                  className="bg-pink-50 border border-pink-200 rounded-lg p-3 shadow-sm"
                >
                  <span className="font-semibold">User ID:</span> {entry.userId}{" "}
                  —{" "}
                  <span className="font-medium text-green-600">
                    {entry.needsMeal ? "✅ Needs Meal" : "❌ No Meal"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No meal requests submitted today.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-yellow-300">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            👥 Registered Students
          </h2>
          {students.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <p className="font-semibold text-lg text-yellow-700">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lunch ID: {student.lunchId}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No students found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
