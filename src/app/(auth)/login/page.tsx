"use client";

import { trpc } from "@/trpc/react";
import React, { useState } from "react";

type Props = {};

export default function Login({}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: (opts) => {
      if (opts.status === "success") localStorage.setItem("token", opts.token);
    },
  });

  return (
    <div>
      <div className="flex flex-col">
        <h1>Login</h1>
        <input
          type="text"
          className="border-2 border-gray-300 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border-2 border-gray-300 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={async () => {
            const { token } = await login.mutateAsync({ email, password });
            localStorage.setItem("token", token);
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
