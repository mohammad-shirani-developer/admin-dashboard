import { withClasses } from "@/app/components/ui/form-controls";

/**
 * Single source of truth for status/role badge styling across all tables and
 * detail panels. Keys cover product, order, user and customer statuses plus
 * user roles.
 */
export const STATUS_BADGE_STYLES = {
  // Product statuses
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
  // Order statuses
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  // User / customer statuses
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  // User roles
  Admin: "bg-purple-100 text-purple-700",
  Manager: "bg-blue-100 text-blue-700",
  User: "bg-gray-100 text-gray-600",
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
