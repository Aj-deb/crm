import { useUI } from '../lib/uiStore'
import { useEffect } from 'react'

export default function ThemeToggle(){
  const { theme, setTheme } = useUI()
  useEffect(()=>{ setTheme(theme) },[])
  return (
    <button
      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/20"
      onClick={()=> setTheme(theme==='dark'?'light':'dark')}>
      {theme==='dark'?'Light':'Dark'} mode
    </button>
  )
}
