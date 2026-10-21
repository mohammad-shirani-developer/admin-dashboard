"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useOutsideClick from "@/app/hooks/useOutsideClick";

/**
 * Notification bell from the mockup. The red dot is decorative mockup styling;
 * the dropdown honestly reports "No new notifications" — this demo has no
 * backend event source, so no notification data is ever fabricated.
 */
const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOutsideClick(wrapperRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Notifications
          </p>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No new notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
