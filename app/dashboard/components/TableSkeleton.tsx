type TableSkeletonProps = {
  label?: string;
  minHeight?: string;
};

const TableSkeleton = ({
  label = "Loading data, please wait",
  minHeight = "min-h-[320px]",
}: TableSkeletonProps) => {
  return (
    <div
      className={`flex ${minHeight} flex-col items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm`}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <span className="sr-only">Loading data, please wait</span>
    </div>
  );
};

export default TableSkeleton;
