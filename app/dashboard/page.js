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

        // Check for existing meal selection
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
      <div className="p-6 text-center min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-8">
      <h1 className="text-3xl font-bold mb-4">School Lunch Tracker</h1>
      <p className="mb-6 text-gray-700">Select your lunch option for today:</p>

      <div className="flex gap-6 mb-4">
        <button
          onClick={() => submitMealChoice(true)}
          className={`px-6 py-3 rounded-lg shadow transition text-white ${
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
          className={`px-6 py-3 rounded-lg shadow transition text-white ${
            selectionExists
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={selectionExists}
        >
          ❌ Does Not Need Meal
        </button>
      </div>

      {status && <p className="text-lg font-medium mt-2">{status}</p>}

      <button
        onClick={handleLogout}
        className="mt-8 text-sm text-blue-600 hover:underline"
      >
        Log Out
      </button>
    </div>
  );
}
