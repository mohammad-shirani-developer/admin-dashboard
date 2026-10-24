import type { Metadata } from "next";
import { Info, Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

/**
 * Static demo profile — this project has no authentication, so the card shows
 * the demo administrator identity and says so honestly (no logout button, no
 * editable fields that would pretend to persist).
 */
const ProfilePage = () => {
  return (
    <div className="mx-4 mt-6 pb-6 sm:mx-6 lg:mx-8">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your account details
        </p>
      </div>

      <section
        aria-label="Profile details"
        className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
          <span
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold text-white"
          >
            M
          </span>

          <div className="mt-4 sm:mt-0 sm:ml-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mohammad Shirani
            </h2>

            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Administrator
            </p>

            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start dark:text-gray-300">
              <Mail
                className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
              <span className="break-all">mohammad-shirani-developer@users.noreply.github.com</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is a demo profile — no auth in this project. Data comes from the
            public DummyJSON API and changes stay in the local query cache.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
