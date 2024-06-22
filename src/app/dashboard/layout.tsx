import SideBar from "@/components/sidebar";
import { getAuthUser } from "@/lib/utils/get-auth-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser({ shouldRedirect: true });

  return (
    <main className="min-h-screen w-full">
      <SideBar />
      <div className="w-full">{children}</div>
    </main>
  );
}
