type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
};

const StatCard = ({ title, value, change }: StatCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 ">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p
          className={`text-base font-medium ${
            change
              ? change.startsWith("+")
                ? "text-green-500"
                : "text-red-500"
              : "invisible"
          }`}
        >
          {change || "0%"}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
