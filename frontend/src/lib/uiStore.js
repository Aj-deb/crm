import { create } from 'zustand'

export const useUI = create((set) => ({
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000) // auto-hide in 3s
  },
  clearToast: () => set({ toast: null }),
}))
