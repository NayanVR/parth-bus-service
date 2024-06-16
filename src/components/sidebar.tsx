"use client";

import {
  BusIcon,
  ConstructionIcon,
  ContactRoundIcon,
  LogOutIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  TicketIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
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
  {
    name: "Maintenance",
    href: "/dashboard/maintenance",
    icon: ConstructionIcon,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* <nav
        className={`${isOpen ? "left-0" : "-left-full md:w-20 md:min-w-20"} absolute z-50 flex min-h-screen w-72 min-w-72 flex-col justify-between border-r bg-background transition-all md:relative md:left-0`}
      > */}
      <nav
        className={`${isOpen ? "left-0" : "-left-full"} absolute z-50 flex min-h-screen flex-col justify-between border-r bg-background transition-all md:relative md:left-0`}
      >
        <ul>
          <div className="flex h-20 items-center justify-between gap-4 bg-primary p-7 text-primary-foreground">
            <h4 className={`font-bold`}>Parth Bus Service</h4>
            {/* <h4 className={`font-bold ${isOpen ? "md:block" : "md:hidden"}`}>
              Parth Bus Service
            </h4>
            <button
              onClick={(_) => setIsOpen((prev) => !prev)}
              className="hidden rounded-md md:block"
            >
              {isOpen ? (
                <PanelLeftCloseIcon size={24} />
              ) : (
                <PanelLeftOpenIcon size={24} />
              )}
            </button> */}
          </div>
          {pages.map((page) => (
            <li key={page.name}>
              {/* <Link
                href={page.href}
                className={`m-2 flex items-center gap-2 rounded-md p-4 transition-colors ${isOpen ? "" : "md:h-16 md:justify-center md:p-2"} ${pathname === page.href ? "bg-primary text-primary-foreground" : "hover:text-primary"}`}
              > */}
              <Link
                href={page.href}
                className={`m-2 flex items-center gap-2 rounded-md p-4 transition-colors ${pathname === page.href ? "bg-primary text-primary-foreground" : "hover:text-primary"}`}
              >
                <page.icon size={22} />
                {/* <span className={`${isOpen ? "md:block" : "md:hidden"}`}> */}
                <span>{page.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Button
          className="m-2 flex gap-2"
          variant="outline"
          onClick={(_) => logout.mutate()}
        >
          {/* <LogOutIcon size={20} />
          <span className={`${isOpen ? "md:block" : "md:hidden"}`}>Logout</span> */}
          Logout
        </Button>
      </nav>
      <button
        onClick={(_) => setIsOpen((prev) => !prev)}
        className="fixed bottom-2 right-2 z-50 block rounded-md border bg-background p-4 md:hidden"
      >
        <MenuIcon
          size={24}
          className={`${isOpen ? "rotate-90" : "rotate-0"} transition-all`}
        />
      </button>
    </>
  );
}
