export default function TopPerformers({ list = [] }) {
  // expects [{ name, role, total }] from /api/reports.topPerformers
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">Top Performers</h3>
      <ul className="space-y-2">
        {list.length === 0 && <li className="text-sm text-gray-500">No data</li>}
        {list.map((u, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm">
            <span className="font-medium">{u.name} <span className="text-gray-500">({u.role})</span></span>
            <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 font-semibold">{u.total}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
