import RegisterForm from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">LMS Platform</h1>
          <p className="text-gray-600 text-center mb-8">Create your account</p>
          
          <RegisterForm />
          
          <div className="mt-6 text-center text-sm">
            Already have an account?
            <Link
              href="/login"
              className="text-blue-600 ml-1 hover:text-blue-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
