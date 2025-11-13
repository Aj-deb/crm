import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

export default function LeadStatusPie({ data = [] }) {
  const formatted = data.map((d, i) => ({ name: d._id || d.status, value: d.count || d.value }))
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">Leads by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={formatted} dataKey="value" nameKey="name" outerRadius={110} label>
            {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
