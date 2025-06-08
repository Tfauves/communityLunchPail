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
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading authentication status...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to the School Lunch Tracker
      </h1>
      <p className="mb-6">
        Let your school know if your child needs a lunch today.
      </p>
      <div className="space-x-4">
        <a
          href="/auth/login"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Log In
        </a>
        <a
          href="/auth/register"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Register
        </a>
      </div>
    </main>
  );
}
