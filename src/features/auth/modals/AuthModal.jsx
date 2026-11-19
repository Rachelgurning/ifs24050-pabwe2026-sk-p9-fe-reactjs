import { IconX } from '@tabler/icons-react'
import { LoginForm } from '../components/AuthPage'

export default function AuthModal({ onClose, onLoggedIn }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-indigo-700 px-5 py-4 text-white">
          <h2 id="auth-modal-title" className="text-lg font-bold">Sesi berakhir — silakan masuk kembali</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 hover:bg-indigo-800">
            <IconX size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">
          <LoginForm onSuccess={onLoggedIn} />
        </div>
      </div>
    </div>
  )
}
