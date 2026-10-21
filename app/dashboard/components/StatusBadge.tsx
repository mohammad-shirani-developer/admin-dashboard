import { withClasses } from "@/app/components/ui/form-controls";

/**
 * Single source of truth for status/role badge styling across all tables and
 * detail panels. Keys cover product, order, user and customer statuses plus
 * user roles. Dark mode uses translucent backgrounds with lighter text.
 */
export const STATUS_BADGE_STYLES = {
  // Product statuses
  "In Stock":
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  "Low Stock":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Out of Stock":
    "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  // Order statuses
  Delivered:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  // User / customer statuses
  Active:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Inactive: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  // User roles
  Admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Manager: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  User: "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
} as const;

export type BadgeStatus = keyof typeof STATUS_BADGE_STYLES;

type StatusBadgeProps = {
  status: BadgeStatus;
  className?: string;
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={withClasses(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-5",
        STATUS_BADGE_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
