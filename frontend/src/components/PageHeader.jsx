const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
};

export default PageHeader;
