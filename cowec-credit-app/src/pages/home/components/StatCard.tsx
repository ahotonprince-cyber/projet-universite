interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'orange' | 'green' | 'red' | 'blue';
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  color = 'orange'
}: StatCardProps) {

  const colorMap: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-500',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-sky-50 text-sky-500',
  };

  const safeColor = colorMap[color] || colorMap.orange;

  const isNeutralTrend = !trend || trendUp === undefined;

  return (
    <div className="
      bg-white rounded-xl p-5 border border-gray-100
      hover:shadow-md hover:-translate-y-1
      transition-all duration-200
    ">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">

        {/* ICON */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${safeColor}`}>
          <i className={`${icon || 'ri-bar-chart-line'} text-2xl`} />
        </div>

        {/* TREND */}
        {!isNeutralTrend && trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${
              trendUp
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <i
              className={`text-xs ${
                trendUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
              }`}
            />
            {trend}
          </span>
        )}

      </div>

      {/* VALUE */}
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {value || '0'}
      </p>

      {/* LABEL */}
      <p className="text-sm text-gray-500">
        {label}
      </p>

    </div>
  );
}