import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function LeadsBySourceBar({ data = [] }) {
  const formatted = data.map(d => ({ source: d._id || d.source, count: d.count }))
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">Leads by Source</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <XAxis dataKey="source" />
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Legend />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
