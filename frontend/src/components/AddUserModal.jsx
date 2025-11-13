import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/axios'
import { useUI } from '../lib/uiStore'
import { useAuth } from '../lib/authStore'

export default function AddUserModal({ onClose }) {
  const { notify } = useUI()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      notify(data.message)
      onClose()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-[400px]"
      >
        <h2 className="text-lg font-semibold mb-4 text-center text-blue-700 dark:text-blue-400">
          Create New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {user.role === 'admin' && <option value="manager">Manager</option>}
            <option value="sales">Sales</option>
            <option value="trainee">Trainee</option>
          </select>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-md text-white font-semibold ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
