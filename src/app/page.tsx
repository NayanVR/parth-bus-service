import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/utils/get-auth-user";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await getAuthUser({ shouldRedirect: false });
  return (
    <main className="bg-gradient flex min-h-screen flex-col items-center justify-center gap-12 text-center">
      <Image
        width={150}
        height={150}
        src="/logo.jpeg"
        alt="Parth Bus Service"
        className="rounded-full border-8 border-white shadow-lg"
      />
      <h1 className="bg-gradient-to-b from-white to-accent bg-clip-text font-bold text-transparent">
        Welcome to
        <br />
        Parth Bus Service
      </h1>
      <Link href={`${user ? "/dashboard" : "/login"}`}>
        <Button className="px-8 py-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
          Let's Go
        </Button>
      </Link>
    </main>
  );
}
