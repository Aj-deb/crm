import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { useUI } from '../lib/uiStore'

export default function Tasks(){
  const [items,setItems]=useState([])
  const [text,setText]=useState('')
  const { notify } = useUI()

  const load=async()=> setItems((await api.get('/tasks')).data)
  useEffect(()=>{ load().catch(()=>{}) },[])

  const add = async()=>{
    if(!text.trim()) return
    await api.post('/tasks',{ text })
    setText(''); notify('Task added'); load()
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">All Tasks</div>
      <div className="flex gap-2">
        <input className="px-3 py-2 rounded-lg border bg-transparent" placeholder="New task…"
               value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={add} className="px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black">Add</button>
      </div>
      {items.map(t=><div key={t._id} className="p-3 rounded-xl border bg-white dark:bg-neutral-950">{t.text}</div>)}
    </div>
  )
}
