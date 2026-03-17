import RegisterForm from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white shadow p-4">
        <h1 className="text-xl font-bold">My App</h1>
      </nav>
      
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Create account</h2>
          
          <RegisterForm />
          
          <div className="mt-6 text-center text-sm">
            Already have an account?
            <Link
              href="/login"
              className="text-blue-500 ml-1 hover:text-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}