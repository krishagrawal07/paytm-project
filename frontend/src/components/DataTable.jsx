const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found",
  renderActions,
}) => {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 text-center text-slate-600 shadow-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {column.label}
              </th>
            ))}
            {renderActions ? (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={`${column.key}-${rowIndex}`} className="px-4 py-3 text-sm text-slate-700">
                    {row[column.key] !== null && row[column.key] !== undefined
                      ? String(row[column.key])
                      : "-"}
                  </td>
                ))}
                {renderActions ? (
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {renderActions(row)}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
