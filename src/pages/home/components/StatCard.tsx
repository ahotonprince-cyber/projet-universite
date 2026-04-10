interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export default function StatCard({ label, value, icon, trend, trendUp, color = 'orange' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-500',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-sky-50 text-sky-500',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${colorMap[color]}`}>
          <i className={`${icon} text-2xl`} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <i className={`${trendUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
