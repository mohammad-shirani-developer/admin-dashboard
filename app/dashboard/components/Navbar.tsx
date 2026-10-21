"use client";

import { ChevronDown, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { inputClasses, withClasses } from "@/app/components/ui/form-controls";
import NotificationsMenu from "./NotificationsMenu";
import ThemeToggle from "./ThemeToggle";

type NavbarProps = {
  onMenuClick: () => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    router.push(
      query
        ? `/dashboard/products?q=${encodeURIComponent(query)}`
        : "/dashboard/products",
    );
  };

  return (
    <header className="relative z-50 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:px-4 dark:border-gray-800 dark:bg-gray-950">
      <button
        type="button"
        aria-label="Toggle navigation menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 lg:hidden dark:hover:bg-gray-800"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className="relative hidden w-full max-w-md lg:block"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search anything..."
          aria-label="Search anything"
          className={withClasses(inputClasses, "h-10 py-2! pl-9")}
        />
      </form>

      <div className="ml-auto flex items-center gap-2 pl-2 sm:gap-3 sm:pl-4">
        <NotificationsMenu />

        {/* Static profile display from the mockup — no auth in this demo. */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
          >
            M
          </span>
          <span className="hidden text-sm font-medium text-gray-700 sm:inline dark:text-gray-300">
            Mohammad
          </span>
          <ChevronDown
            className="hidden h-4 w-4 text-gray-400 sm:block"
            aria-hidden="true"
          />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
