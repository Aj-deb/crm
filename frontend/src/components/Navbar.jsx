import ThemeToggle from './ThemeToggle'
import { useAuth } from '../lib/authStore'
import { useNavigate } from 'react-router-dom'

export default function Navbar(){
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="md:hidden font-bold">CRM 1.0</div>
        <div className="flex items-center gap-3">
          <ThemeToggle/>
          <button onClick={()=>{logout(); nav('/login')}} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
