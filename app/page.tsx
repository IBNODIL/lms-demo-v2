import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold">LMS Platform</div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-900"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-[calc(100vh-80px)] max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Learn, Teach & Grow
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A modern Learning Management System where students explore courses
            and teachers share their expertise.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-slate-900 px-8 py-6 text-lg"
              >
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-16 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-700/50 rounded-lg">
              <h3 className="text-xl font-bold mb-3">For Students</h3>
              <p className="text-slate-300">
                Browse courses, track progress, and learn at your own pace.
              </p>
            </div>
            <div className="p-6 bg-slate-700/50 rounded-lg">
              <h3 className="text-xl font-bold mb-3">For Teachers</h3>
              <p className="text-slate-300">
                Create engaging courses with videos and chapters.
              </p>
            </div>
            <div className="p-6 bg-slate-700/50 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
              <p className="text-slate-300">
                Monitor your learning journey with detailed progress and completion tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
