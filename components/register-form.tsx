"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

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

      router.push("/");
    } catch (err) {
      console.error("UNEXPECTED ERROR:", err);
      setServerError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
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