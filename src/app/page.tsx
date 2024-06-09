import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to Parth Bus Service</h1>
      <Link href="/login">
        <Button>LOGIN</Button>
      </Link>
    </main>
  );
}
