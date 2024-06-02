"use client";

import { trpc } from "@/trpc/react";
import { useState } from "react";

type Props = {};

export default function Register(props: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const register = trpc.auth.register.useMutation();

  return (
    <div>
      <div className="flex flex-col">
        <h1>Register</h1>
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
        <input
          type="password"
          className="border-2 border-gray-300 text-black"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <button
          onClick={() => {
            register.mutate({ email, password, passwordConfirm });
          }}
        >
          Create User
        </button>
      </div>
    </div>
  );
}
