import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function LeadsPerUserBar({ data = [] }) {
  // expects [{ name, role, leads }]
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">Leads per User</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Legend />
          <Bar dataKey="leads" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
