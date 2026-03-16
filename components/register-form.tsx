"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.username,
    });

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <div>
        <input
          placeholder="Email"
          {...register("email")}
          className="w-full border p-2 rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <input
          placeholder="Username"
          {...register("username")}
          className="w-full border p-2 rounded"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">
            {errors.username.message}
          </p>
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
          <p className="text-red-500 text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded"
      >
        Register
      </button>
    </form>
  );
}