import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function LeadsByPriorityBar({ data = [] }) {
  const formatted = data.map(d => ({ priority: d._id || d.priority, count: d.count }))
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">Leads by Priority</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <XAxis dataKey="priority" />
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Legend />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
