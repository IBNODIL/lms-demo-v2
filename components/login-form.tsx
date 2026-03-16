"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await authClient.signIn.email({
                email: data.email,
                password: data.password,
            });
        } catch (error) {
            console.error("Login failed", error);
        }
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
                Login
            </button>
        </form>
    );
}