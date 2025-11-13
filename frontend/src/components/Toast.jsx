import { motion, AnimatePresence } from 'framer-motion'
import { useUI } from '../lib/uiStore'

export default function Toast() {
  const { toast, clearToast } = useUI()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium cursor-pointer ${
            toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'success'
              ? 'bg-green-600'
              : 'bg-blue-600'
          }`}
          onClick={clearToast}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
