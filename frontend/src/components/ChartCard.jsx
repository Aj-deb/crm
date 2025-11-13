import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function ChartCard({title, data}){
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-950">
      <div className="mb-3 font-semibold">{title}</div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="value" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
