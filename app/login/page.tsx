import LoginForm from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">

      <div className="w-[400px] p-6 border rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Login
        </h1>

        <LoginForm />

        <div className="mt-6 text-center text-sm">
          Don't have an account?
          <Link
            href="/register"
            className="text-blue-500 ml-1"
          >
            Register
          </Link>
        </div>

      </div>

    </div>
  );
}