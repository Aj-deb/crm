export default function DataTable({ columns, rows, onRowClick }){
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 dark:bg-white/5">
          <tr>{columns.map(c=><th key={c.key} className="text-left px-4 py-2 font-semibold">{c.label}</th>)}</tr>
        </thead>
      <tbody>
        {rows.map((r)=>(
          <tr key={r._id || r.id} className="border-t border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
              onClick={()=>onRowClick?.(r)}>
            {columns.map(c=><td key={c.key} className="px-4 py-2">{c.render?c.render(r[c.key], r):r[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  )
}
