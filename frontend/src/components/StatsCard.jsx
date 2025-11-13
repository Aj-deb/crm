import { TrendingUp, Users, Target, Frown } from 'lucide-react'

export default function StatsCards({ stats }) {
  const {
    totalLeads = 0,
    activeLeads = 0,
    converted = 0,
    lost = 0,
  } = stats || {}

  const convRate = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) : 0

  const Card = ({ icon, label, value, accent }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card icon={<Users size={18}/>} label="Total Leads" value={totalLeads} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/40"/>
      <Card icon={<TrendingUp size={18}/>} label="Active Leads" value={activeLeads} accent="bg-amber-100 text-amber-600 dark:bg-amber-900/40"/>
      <Card icon={<Target size={18}/>} label="Converted" value={`${converted} (${convRate}%)`} accent="bg-green-100 text-green-600 dark:bg-green-900/40"/>
      <Card icon={<Frown size={18}/>} label="Lost" value={lost} accent="bg-rose-100 text-rose-600 dark:bg-rose-900/40"/>
    </div>
  )
}
