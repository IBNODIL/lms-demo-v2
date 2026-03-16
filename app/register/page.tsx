"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [email,setEmail] = useState("");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const register = async () => {
    await authClient.signUp.email({
      email,
      password,
      name: username
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[400px] p-6 shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <input
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Username"
          onChange={(e)=>setUsername(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={register}
          className="bg-black text-white w-full py-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}