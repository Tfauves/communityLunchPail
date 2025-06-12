"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!checkingAuth && user) {
      // router.push("/dashboard");
    }
  }, [checkingAuth, user, router]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700 font-medium text-lg animate-pulse">
        Checking authentication...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6 font-sans text-gray-800">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          🥪 School Lunch Tracker
        </h1>
        <p className="text-base mb-6 text-gray-600">
          Let your school know if your child needs a lunch today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/login"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md font-medium shadow-sm transition"
          >
            Log In
          </a>
          {/* <a
            href="/auth/register"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-md font-medium shadow-sm transition"
          >
            Register
          </a> */}
        </div>
      </div>
    </main>
  );
}
