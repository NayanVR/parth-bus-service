"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserSchema } from "@/lib/types/user-schema";
import { trpc } from "@/trpc/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toFormikValidate } from "zod-formik-adapter";

export default function Register() {
  const router = useRouter();

  const register = trpc.auth.register.useMutation({
    onSuccess: (opts) => {
      router.push("/login");
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validate: toFormikValidate(createUserSchema),
    onSubmit: async (values) => {
      const res = register.mutateAsync(values);

      toast.promise(res, {
        loading: "Creating account...",
        success: "Account created successfully. Please login.",
        error: "Failed to create account",
      });
    },
  });

  return (
    <main className="flex h-screen items-center justify-center bg-primary">
      <form
        className="flex w-full flex-col gap-2 rounded-md bg-background p-4 shadow-md sm:w-1/2 md:max-w-sm md:p-8"
        onSubmit={formik.handleSubmit}
      >
        <h1 className="mb-2 text-center text-2xl font-bold">Register</h1>
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
        <Input
          id="passwordConfirm"
          placeholder="Confirm Password"
          type="password"
          value={formik.values.passwordConfirm}
          onChange={formik.handleChange}
          error={formik.errors.passwordConfirm}
        />
        <Link className="my-2 text-sm hover:underline" href="/login">
          Already have an account? Login
        </Link>
        <Button className="text-md w-full" type="submit">
          Register
        </Button>
      </form>
    </main>
  );
}
