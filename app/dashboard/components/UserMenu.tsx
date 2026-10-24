"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useOutsideClick from "@/app/hooks/useOutsideClick";

/**
 * Account menu behind the avatar/name in the navbar. The mockup only shows a
 * static profile chip; the chevron suggested a dropdown that was never wired
 * up. This one works: Profile navigates, and Sign out is honestly disabled
 * because the demo has no authentication.
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(wrapperRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:gap-2.5 dark:hover:bg-gray-800"
      >
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
          className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Mohammad
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrator — demo account
            </p>
          </div>

          <Link
            role="menuitem"
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="mt-1.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <UserRound className="h-4 w-4 text-gray-400" aria-hidden="true" />
            Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            aria-disabled="true"
            title="Authentication is not part of this demo"
            className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
