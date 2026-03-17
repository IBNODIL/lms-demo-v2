import LoginForm from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white shadow p-4">
        <h1 className="text-xl font-bold">My App</h1>
      </nav>
      
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm">
            Don't have an account?
            <Link
              href="/register"
              className="text-blue-500 ml-1 hover:text-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}