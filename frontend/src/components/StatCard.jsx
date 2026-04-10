const variantClasses = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    soft: "from-blue-100 to-blue-50",
    text: "text-blue-700",
  },
  green: {
    gradient: "from-emerald-500 to-emerald-600",
    soft: "from-emerald-100 to-emerald-50",
    text: "text-emerald-700",
  },
  purple: {
    gradient: "from-violet-500 to-violet-600",
    soft: "from-violet-100 to-violet-50",
    text: "text-violet-700",
  },
  red: {
    gradient: "from-rose-500 to-red-500",
    soft: "from-rose-100 to-rose-50",
    text: "text-rose-700",
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    soft: "from-amber-100 to-amber-50",
    text: "text-amber-700",
  },
};

const StatCard = ({ label, value, icon: Icon, variant = "blue" }) => {
  const classes = variantClasses[variant] || variantClasses.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/50">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${classes.soft}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>

        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${classes.gradient} text-white shadow-md`}>
          {Icon ? <Icon size={20} /> : null}
        </span>
      </div>

      <div className="relative mt-4">
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className={`h-1.5 w-2/3 rounded-full bg-gradient-to-r ${classes.gradient}`} />
        </div>
        <p className={`mt-2 text-xs font-medium ${classes.text}`}>Live records synced</p>
      </div>
    </div>
  );
};

export default StatCard;
