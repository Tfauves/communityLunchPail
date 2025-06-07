"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    grade: "",
    allergies: "",
    parentEmail: "",
  });
  const [generatedId, setGeneratedId] = useState("");
  const router = useRouter();

  const generateId = () => {
    return `LUNCH-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentId = generateId();

    try {
      await addDoc(collection(db, "students"), {
        ...form,
        studentId,
        allergies: form.allergies.split(",").map((a) => a.trim()),
        createdAt: new Date(),
      });
      setGeneratedId(studentId);
    } catch (error) {
      console.error("Error registering student:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Student Registration</h1>

      {generatedId ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Registration Successful!</p>
          <p>
            Student ID: <span className="font-mono">{generatedId}</span>
          </p>
          <button
            onClick={() => router.push("/check-in")}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Proceed to Check-In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Student Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Grade Level</label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Grade</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Grade {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Allergies (comma separated)</label>
            <input
              type="text"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="peanuts, dairy, etc."
            />
          </div>

          <div>
            <label className="block mb-1">Parent Email</label>
            <input
              type="email"
              value={form.parentEmail}
              onChange={(e) =>
                setForm({ ...form, parentEmail: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Register Student
          </button>
        </form>
      )}
    </div>
  );
}
