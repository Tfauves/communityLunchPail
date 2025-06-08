"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [lunchId, setLunchId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !lunchId.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "students", userCred.user.uid), {
        name: studentName.trim(),
        lunchId: lunchId.trim(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-10 space-y-4 p-4 border rounded shadow"
    >
      <h2 className="text-2xl font-bold text-center">Register</h2>

      {error && <p className="text-red-600 text-center">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full border px-3 py-2 rounded"
        disabled={loading}
        autoComplete="email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full border px-3 py-2 rounded"
        disabled={loading}
        autoComplete="new-password"
      />

      <input
        type="text"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Student Name"
        required
        className="w-full border px-3 py-2 rounded"
        disabled={loading}
      />

      <input
        type="text"
        value={lunchId}
        onChange={(e) => setLunchId(e.target.value)}
        placeholder="Lunch ID"
        required
        className="w-full border px-3 py-2 rounded"
        disabled={loading}
      />

      <button
        type="submit"
        className={`w-full py-2 rounded text-white ${
          loading
            ? "bg-green-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Log in here
        </Link>
      </p>
    </form>
  );
}
