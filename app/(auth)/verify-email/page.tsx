"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type StatusType = "loading" | "success" | "error" | "input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusType>("input");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = searchParams.get("email") || "";

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setMessage("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/callback/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Email verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setStatus("success");
      setMessage("Email verified successfully! Redirecting...");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("An error occurred during email verification. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {status === "input" && (
            <>
              <div className="text-blue-600 text-5xl mb-4">📧</div>
              <h1 className="text-2xl font-bold text-gray-800">Verify Your Email</h1>
              <p className="mt-2 text-gray-600 text-sm">
                {email ? `Enter the 6-digit code sent to ${email}` : "Enter the 6-digit code sent to your email"}
              </p>
              
              <div className="mt-6">
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
                />
              </div>

              {message && (
                <p className="mt-3 text-red-600 text-sm">{message}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              <p className="mt-4 text-sm text-gray-600">
                Didn&apos;t receive the code?{" "}
                <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                  Try again
                </Link>
              </p>
            </>
          )}

          {status === "loading" && (
            <>
              <div className="inline-block animate-spin">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-800">Verifying Your Email</h1>
              <p className="mt-2 text-gray-600">Please wait...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
              <p className="mt-2 text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-red-500 text-5xl mb-4">✕</div>
              <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
              <p className="mt-2 text-gray-600">{message}</p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setStatus("input");
                    setCode("");
                    setMessage("");
                  }}
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Try Another Code
                </button>
                <Link
                  href="/register"
                  className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Register Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
