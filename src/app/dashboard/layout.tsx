import SideBar from "@/components/sidebar";
import { getAuthUser } from "@/lib/utils/get-auth-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <main className="min-h-screen w-full md:grid md:grid-cols-5">
      <SideBar />
      <div className="md:col-span-4">{children}</div>
    </main>
  );
}
