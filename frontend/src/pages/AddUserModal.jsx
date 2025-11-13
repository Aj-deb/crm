import { useState } from 'react';
import api from '../lib/axios';

export default function AddUserModal({ onClose, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 mb-3 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border p-2 mb-3 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border p-2 mb-3 rounded"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 mb-4 rounded"
          >
            <option value="manager">Manager</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="viewer">Viewer</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
