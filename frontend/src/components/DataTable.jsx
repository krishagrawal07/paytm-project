import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const alignClassMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found",
  renderActions,
  searchable = true,
  searchPlaceholder = "Search records...",
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
}) => {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!normalizedQuery) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(normalizedQuery);
      })
    );
  }, [columns, data, normalizedQuery]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, pageSize, data.length]);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const colSpan = Math.max(columns.length + (renderActions ? 1 : 0), 1);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {searchable ? (
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center px-4 py-10">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
            Loading records...
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100/90 backdrop-blur-sm">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 ${
                      alignClassMap[column.align] || "text-left"
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                {renderActions ? (
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const primaryKey = columns[0]?.key;
                  const rowKey = primaryKey ? row[primaryKey] : `${safePage}-${index}`;

                  return (
                    <tr
                      key={rowKey ?? `${safePage}-${index}`}
                      className={`transition-colors hover:bg-blue-50/60 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      {columns.map((column) => {
                        const value = row[column.key];
                        const content =
                          typeof column.render === "function"
                            ? column.render(value, row)
                            : value !== null && value !== undefined
                              ? String(value)
                              : "-";

                        return (
                          <td
                            key={`${column.key}-${rowKey}-${index}`}
                            className={`whitespace-nowrap px-4 py-3 text-sm text-slate-700 ${
                              alignClassMap[column.align] || "text-left"
                            }`}
                          >
                            {content}
                          </td>
                        );
                      })}

                      {renderActions ? (
                        <td className="px-4 py-3 text-sm text-slate-700">{renderActions(row)}</td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:text-sm sm:px-5">
        <p>
          Showing {totalRows === 0 ? 0 : startIndex + 1} to {endIndex} of {totalRows} entries
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
            disabled={safePage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700">
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
            disabled={safePage >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
