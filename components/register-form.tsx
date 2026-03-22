"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { resendVerificationEmail } from "@/actions/resend-verification-email";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.username,
      });

      if (error) {
        console.error("REGISTER ERROR:", error);
        setServerError(error?.message || "Something went wrong");
        setLoading(false);
        return;
      }

      // If teacher role selected, update the user role
      if (isTeacher) {
        try {
          const roleRes = await fetch("/api/auth/update-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, role: "TEACHER" }),
          });
          
          if (!roleRes.ok) {
            console.warn("Failed to set teacher role");
          }
        } catch (err) {
          console.warn("Could not update role:", err);
        }
      }

      // Send verification email manually to ensure it's sent
      try {
        const emailResult = await resendVerificationEmail(data.email);
        if (!emailResult.success) {
          console.warn("Email sending failed:", emailResult.error);
        }
      } catch (emailErr) {
        console.warn("Error sending verification email:", emailErr);
      }

      // Show verification code input
      setRegistrationSuccess(true);
      setRegisteredEmail(data.email);
      setLoading(false);
    } catch (err) {
      console.error("UNEXPECTED ERROR:", err);
      setServerError("Something went wrong.");
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setCodeMessage({
        type: "error",
        text: "Please enter a valid 6-digit code",
      });
      return;
    }

    setVerifyingCode(true);
    setCodeMessage(null);

    try {
      const response = await fetch("/api/auth/callback/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCodeMessage({
          type: "error",
          text: data.error || "Invalid or expired code. Please try again.",
        });
        setVerifyingCode(false);
        return;
      }

      setCodeMessage({
        type: "success",
        text: "Email verified successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setCodeMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
      setVerifyingCode(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage(null);

    try {
      const result = await resendVerificationEmail(registeredEmail);
      
      if (result.success) {
        setResendMessage({
          type: "success",
          text: "Verification code sent! Check your email.",
        });
        setVerificationCode("");
      } else {
        setResendMessage({
          type: "error",
          text: result.error || "Failed to resend code",
        });
      }
    } catch (error) {
      setResendMessage({
        type: "error",
        text: "An error occurred while resending the code",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Check Your Email</h2>
          <p className="text-blue-800 mb-4">
            We've sent a 6-digit verification code to <strong>{registeredEmail}</strong>
          </p>
          <p className="text-blue-700 text-sm">
            Enter the code below to complete your registration. The code will expire in 15 minutes.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Verification Code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            disabled={verifyingCode}
            className="w-full px-4 py-3 text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100 font-bold"
          />
          {codeMessage && (
            <div
              className={`p-3 rounded text-sm ${
                codeMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {codeMessage.text}
            </div>
          )}
        </div>

        <button
          onClick={handleVerifyCode}
          disabled={verifyingCode || verificationCode.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition"
        >
          {verifyingCode ? "Verifying..." : "Verify Email"}
        </button>

        {resendMessage && (
          <div
            className={`p-3 rounded text-sm ${
              resendMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {resendMessage.text}
          </div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={resendLoading}
          className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 py-2 rounded-lg font-semibold transition"
        >
          {resendLoading ? "Sending..." : "Resend Verification Code"}
        </button>

        <Link
          href="/login"
          className="block text-center text-blue-600 hover:text-blue-800 underline"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {serverError && (
        <p className="text-red-500 text-sm">{serverError}</p>
      )}

      <div>
        <input
          placeholder="Email"
          {...register("email")}
          className="w-full border p-2 rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          placeholder="Username"
          {...register("username")}
          className="w-full border p-2 rounded"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      <div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
            className="w-full border p-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword")}
            className="w-full border p-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-2.5 text-gray-600 hover:text-gray-800"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isTeacher"
          checked={isTeacher}
          onChange={(e) => setIsTeacher(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="isTeacher" className="text-sm text-gray-700">
          I want to create and teach courses
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}