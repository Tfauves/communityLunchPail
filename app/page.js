import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">School Lunch Tracker</h1>
      <div className="space-y-4">
        <Link
          href="/register"
          className="block bg-blue-500 text-white px-6 py-3 rounded text-center"
        >
          Register Student
        </Link>
        <Link
          href="/check-in"
          className="block bg-green-500 text-white px-6 py-3 rounded text-center"
        >
          Daily Check-In
        </Link>
      </div>
    </div>
  );
}
