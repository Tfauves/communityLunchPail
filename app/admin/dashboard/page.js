"use client";

import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateParentAccount() {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [students, setStudents] = useState([{ name: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const addStudentField = () => {
    setStudents([...students, { name: "" }]);
  };

  const handleStudentChange = (index, value) => {
    const updated = [...students];
    updated[index].name = value;
    setStudents(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const tempPassword = Math.random().toString(36).slice(-8);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        parentEmail,
        tempPassword
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name: parentName,
        email: parentEmail,
        createdAt: serverTimestamp(),
      });

      for (let student of students) {
        const lunchId = `LUNCH-${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`;
        await addDoc(collection(db, "students"), {
          name: student.name,
          parentId: uid,
          lunchId,
          createdAt: serverTimestamp(),
        });
      }

      await sendPasswordResetEmail(auth, parentEmail);
      setMessage("✅ Account created and reset email sent!");
      setParentName("");
      setParentEmail("");
      setStudents([{ name: "" }]);
    } catch (error) {
      console.error("Account creation error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">
            ➕ Create Parent Account
          </h1>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm shadow-sm transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent/Guardian Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent/Guardian Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student(s)
              </label>
              {students.map((student, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Student ${idx + 1} Name`}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2focus:ring-yellow-200"
                  value={student.name}
                  onChange={(e) => handleStudentChange(idx, e.target.value)}
                  required
                />
              ))}
              <button
                type="button"
                onClick={addStudentField}
                className="text-sm text-yellow-700 font-medium bg-yellow-100 px-3 py-1 rounded-full hover:bg-yellow-200 transition"
              >
                ➕ Add Another Student
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition"
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>

            {message && (
              <div className="text-center mt-4 text-sm font-medium text-blue-700 bg-blue-100 p-2 rounded">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
