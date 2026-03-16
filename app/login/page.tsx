"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const login = async () => {
    await authClient.signIn.username({
      username,
      password,
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[400px] p-6 shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

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
          onClick={login}
          className="bg-black text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}