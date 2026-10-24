"use client";

import { ChevronDown, LogOut, LoaderCircle, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import type { SessionUser } from "@/app/lib/session";

type UserMenuProps = {
  user: SessionUser | null;
};

/**
 * Account menu behind the avatar/name in the navbar. Shows the signed-in
 * session user (decoded from the httpOnly session cookie server-side), and
 * Sign out really signs out: POST /api/auth/logout clears the cookie, then
 * the visitor is sent back to the login screen.
 */
const UserMenu = ({ user }: UserMenuProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Demo account";
  const initials = displayName.charAt(0).toUpperCase() || "?";

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      /* The cookie survives only if the call failed; let the user retry. */
      setIsSigningOut(false);
      return;
    }
  };

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
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-gray-700 sm:inline dark:text-gray-300">
          {displayName}
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
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.username ? `@${user.username} — demo account` : "demo account"}
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
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {isSigningOut ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
