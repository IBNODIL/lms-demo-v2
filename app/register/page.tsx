import RegisterForm from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center h-screen">

      <div className="w-[400px] p-6 border rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Create account
        </h1>

        <RegisterForm />

        <div className="mt-6 text-center text-sm">
          Already have an account?
          <Link
            href="/login"
            className="text-blue-500 ml-1"
          >
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}