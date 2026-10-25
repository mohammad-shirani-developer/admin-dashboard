"use client";

import {
  LayoutDashboard,
  LayoutGrid,
  Package,
  ShoppingCart,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
  { href: "/dashboard/customers", label: "Customers", icon: UsersRound },
];

/** Settings group from the mockup — Profile only; sign-out lives in the navbar's account menu. */
const SETTINGS_ITEMS = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const Sidebar = ({ isOpen, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  /* Mobile drawer behavior: Escape closes it and the page behind the overlay
     stops scrolling until it is closed (desktop keeps its permanent sidebar,
     so the lock only applies below the lg breakpoint). */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onNavigate?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (window.matchMedia("(min-width: 1024px)").matches) {
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onNavigate]);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  const renderItem = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={withClasses(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          active
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onNavigate}
        />
      )}

      {/* Navy slate-900 in BOTH themes — the mockup keeps the sidebar dark. */}
      <aside
        aria-label="Dashboard navigation"
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-60 flex-col bg-slate-900 p-4 text-white
          lg:top-0 lg:h-screen
          ${isOpen ? "flex" : "hidden"}
          lg:flex`}
      >
        <div className="mb-6 flex items-center gap-3 px-2 pt-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold">TechAdmin</span>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-1"
        >
          {NAV_ITEMS.map(renderItem)}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p
            className="px-3 pb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase"
            id="sidebar-settings-label"
          >
            Settings
          </p>

          <nav aria-labelledby="sidebar-settings-label" className="flex flex-col gap-1">
            {SETTINGS_ITEMS.map(renderItem)}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
