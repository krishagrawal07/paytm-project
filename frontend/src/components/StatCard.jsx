const StatCard = ({ label, value, colorClass = "bg-blue-600" }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <span className={`inline-block h-3 w-3 rounded-full ${colorClass}`}></span>
      </div>
    </div>
  );
};

export default StatCard;
