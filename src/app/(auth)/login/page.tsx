"use client";

import { trpc } from "@/trpc/react";
import React from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { loginUserSchema } from "@/lib/types/user-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toFormikValidate } from "zod-formik-adapter";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const login = trpc.auth.login.useMutation({
    onSuccess: (opts) => {
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: toFormikValidate(loginUserSchema),
    onSubmit: async (values) => {
      const res = login.mutateAsync(values);

      toast.promise(res, {
        loading: "Logging in...",
        success: "Logged in successfully",
      });
    },
  });

  return (
    <main className="bg-gradient container flex h-screen items-center justify-center">
      <form
        className="flex w-full flex-col gap-2 rounded-md bg-background p-4 shadow-md sm:w-1/2 md:max-w-sm md:p-8"
        onSubmit={formik.handleSubmit}
      >
        <h1 className="mb-2 text-center text-2xl font-bold">Login</h1>
        <Input
          id="email"
          placeholder="Email"
          type="text"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.errors.email}
        />
        <Input
          id="password"
          placeholder="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.errors.password}
        />
        {/*
        <Link className="my-2 text-sm hover:underline" href="/register">
          Don't have an account? Register
        </Link>
        */}
        <Button className="text-md w-full" type="submit">
          Login
        </Button>
      </form>
    </main>
  );
}
