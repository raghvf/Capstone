export default function DataTable({ columns, rows, emptyMessage = 'No data found' }) {
  if (!rows?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={row._id || i} className="transition hover:bg-slate-50/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-slate-700">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
