"use client";

import { BusIcon, ContactRoundIcon, TicketIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { trpc } from "@/trpc/react";

type Props = {};

const pages = [
  {
    name: "Bookings",
    href: "/dashboard",
    icon: TicketIcon,
  },
  {
    name: "Driver Duty Vouchers",
    href: "/dashboard/duty-vouchers",
    icon: ContactRoundIcon,
  },
  {
    name: "Vehicles",
    href: "/dashboard/vehicles",
    icon: BusIcon,
  },
];

export default function SideBar({}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: (_) => {
      router.push("/login");
    },
  });

  return (
    <nav className="absolute z-50 flex min-h-screen min-w-fit flex-col justify-between border-r bg-background p-2 md:relative">
      <ul>
        {pages.map((page) => (
          <li key={page.name}>
            <Link
              href={page.href}
              className={`flex items-center gap-2 rounded-md p-4 transition-colors ${pathname === page.href ? "bg-primary text-primary-foreground" : "hover:text-primary"}`}
            >
              <page.icon size={20} />
              <span>{page.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="outline" onClick={(_) => logout.mutate()}>
        Logout
      </Button>
    </nav>
  );
}
