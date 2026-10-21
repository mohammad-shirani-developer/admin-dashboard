import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  /** Optional tooltip explaining where the trend comes from. */
  changeTitle?: string;
  /** Soft tint classes for the icon square, light + dark variants. */
  iconClassName?: string;
  icon?: ReactNode;
};

const StatCard = ({
  title,
  value,
  change,
  changeTitle,
  icon,
  iconClassName,
}: StatCardProps) => {
  const isPositive = change ? change.startsWith("+") : true;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {icon && (
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            iconClassName ??
            "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400"
          }`}
        >
          {icon}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{title}</p>

      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>

      {change && (
        <p
          className="mt-2 flex flex-wrap items-center gap-1 text-sm"
          title={changeTitle}
        >
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {change}
          </span>
          <span className="text-gray-400 dark:text-gray-500">
            from last week
          </span>
        </p>
      )}
    </div>
  );
};

export default StatCard;
