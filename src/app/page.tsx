import Link from "next/link";

import { api } from "@/trpc/server";
import Users from "./_components/users";

export default async function Home() {
  const hello = await api.hello({ text: "Nayan Radadiya" });
  const users = await api.user.getUsers();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <p className="text-2xl text-white">
        {hello ? hello.greeting : "Loading tRPC query..."}
      </p>
      <main>
        <Users initialUsers={users} />
      </main>
    </main>
  );
}
