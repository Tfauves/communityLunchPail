"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user is an admin based on their email
      if (
        ["admin@yourschool.edu", "lunchstaff@yourschool.edu"].includes(
          user.email
        )
      ) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 space-y-4 p-4 border rounded shadow"
    >
      <h2 className="text-2xl font-bold text-center">Log In</h2>

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
        autoComplete="current-password"
      />

      <button
        type="submit"
        className={`w-full py-2 rounded text-white ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center text-sm mt-4">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </form>
  );
}
