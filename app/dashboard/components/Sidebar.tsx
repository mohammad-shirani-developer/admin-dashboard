"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { withClasses } from "@/app/components/ui/form-controls";

type SidebarProps = {
  isOpen: boolean;
  /** Called after a navigation link is clicked so the mobile drawer can close. */
  onNavigate?: () => void;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/customers", label: "Customers", icon: UserRound },
];

const Sidebar = ({ isOpen, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onNavigate}
        />
      )}

      <aside
        aria-label="Dashboard navigation"
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-col bg-gray-800 p-4 text-white
          lg:top-0 lg:h-screen
          ${isOpen ? "flex" : "hidden"}
          lg:flex`}
      >
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={withClasses(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
                  active
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
