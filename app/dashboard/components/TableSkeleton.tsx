type TableSkeletonProps = {
  label?: string;
  minHeight?: string;
};

const TableSkeleton = ({
  label = "Loading data, please wait.",
  minHeight = "min-h-[320px]",
}: TableSkeletonProps) => {
  return (
    <div
      className={`flex ${minHeight} flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900`}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"
        aria-hidden="true"
      />
      <p className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        Loading...
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <span className="sr-only">Loading data, please wait.</span>
    </div>
  );
};

export default TableSkeleton;
