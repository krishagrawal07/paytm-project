const PageHeader = ({ title, subtitle, badge, actions = null }) => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.1),transparent_35%)]" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {badge ? (
            <span className="mb-2 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-blue-700">
              {badge}
            </span>
          ) : null}
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p> : null}
        </div>

        {actions ? <div className="relative">{actions}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;
