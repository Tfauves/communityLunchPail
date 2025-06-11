"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectionExists, setSelectionExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login");
      } else {
        setUser(firebaseUser);

        const docId = `${firebaseUser.uid}_${today}`;
        const selectionRef = doc(db, "mealSelections", docId);

        try {
          const selectionSnap = await getDoc(selectionRef);
          if (selectionSnap.exists()) {
            const data = selectionSnap.data();
            setSelectionExists(true);
            setStatus(
              data.needsMeal
                ? "✅ You selected: Needs Meal"
                : "❌ You selected: Does Not Need Meal"
            );
          }
        } catch (err) {
          console.error("Error checking meal selection:", err);
          setStatus("⚠️ Unable to load today's selection.");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, today]);

  const submitMealChoice = async (needsMeal) => {
    if (!user || selectionExists) return;

    const docId = `${user.uid}_${today}`;

    try {
      await setDoc(doc(db, "mealSelections", docId), {
        userId: user.uid,
        needsMeal,
        date: today,
        timestamp: Date.now(),
      });

      setSelectionExists(true);
      setStatus(
        needsMeal
          ? "✅ You selected: Needs Meal"
          : "❌ You selected: Does Not Need Meal"
      );
    } catch (error) {
      console.error("Error saving meal selection:", error);
      setStatus("⚠️ Failed to save meal selection.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 text-lg animate-pulse">
        Loading...
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12 text-center font-sans text-gray-800">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          🥪 School Lunch Tracker
        </h1>
        <p className="text-gray-600 mb-6">
          Select your lunch option for today:
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={() => submitMealChoice(true)}
            className={`px-6 py-3 rounded-md font-medium text-white transition shadow ${
              selectionExists
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={selectionExists}
          >
            ✅ Needs Meal
          </button>
          <button
            onClick={() => submitMealChoice(false)}
            className={`px-6 py-3 rounded-md font-medium text-white transition shadow ${
              selectionExists
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={selectionExists}
          >
            ❌ Does Not Need Meal
          </button>
        </div>

        {status && (
          <p className="text-base font-semibold text-gray-700">{status}</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 text-sm text-blue-600 hover:underline transition"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
