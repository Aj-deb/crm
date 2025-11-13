import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/axios'
import { useUI } from '../lib/uiStore'

export default function CustomerDetail(){
  const { id } = useParams()
  const [c,setC]=useState(null)
  const [note,setNote]=useState('')
  const [task,setTask]=useState('')
  const { notify } = useUI()

  const load=async()=>{ const {data}=await api.get(`/customers/${id}`); setC(data) }
  useEffect(()=>{ load().catch(()=>{}) },[id])

  const addNote=async()=>{ if(!note.trim()) return; await api.post(`/customers/${id}/notes`,{text:note}); setNote(''); notify('Note added'); load() }
  const addTask=async()=>{ if(!task.trim()) return; await api.post(`/customers/${id}/tasks`,{text:task}); setTask(''); notify('Task added'); load() }

  if(!c) return null
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <div className="p-4 rounded-2xl border bg-white dark:bg-neutral-950">
          <div className="text-2xl font-bold">{c.name}</div>
          <div className="text-sm text-gray-500">{c.email} • {c.phone}</div>
          <div className="mt-2 text-sm"><span className="font-semibold">Stage:</span> {c.stage}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white dark:bg-neutral-950">
          <div className="font-semibold mb-2">Notes</div>
          <div className="space-y-2">
            {c.notes?.map(n=><div key={n._id} className="p-2 rounded-lg bg-gray-50 dark:bg-white/5">{n.text}</div>)}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-lg border bg-transparent" value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a note…"/>
            <button onClick={addNote} className="px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black">Add</button>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-white dark:bg-neutral-950">
          <div className="font-semibold mb-2">Activity</div>
          <div className="space-y-2">
            {c.activity?.map(a=><div key={a._id} className="text-sm">{a.when} — {a.text}</div>)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl border bg-white dark:bg-neutral-950">
          <div className="font-semibold mb-2">Tasks</div>
          <div className="space-y-2">
            {c.tasks?.map(t=><div key={t._id} className="text-sm flex items-center justify-between">
              <span>{t.text}</span>
            </div>)}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-lg border bg-transparent" value={task} onChange={e=>setTask(e.target.value)} placeholder="Add a task…"/>
            <button onClick={addTask} className="px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black">Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
