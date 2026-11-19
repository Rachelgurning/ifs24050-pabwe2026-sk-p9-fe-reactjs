import { useEffect, useState } from 'react'
import { IconLogin, IconUserPlus } from '@tabler/icons-react'
import Link from '../../../components/Link'
import useInput from '../../../hooks/useInput'
import { authApi } from '../api/authApi'
import { setSession } from '../../../helpers/apiHelper'
import { setMeta } from '../../../helpers/toolsHelper'

const inputCls = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
const btnCls = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60'

function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200">{label}</label>
      <input id={id} name={id} className={inputCls} {...props} />
    </div>
  )
}

function ErrorBox({ message }) {
  if (!message) return null
  return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{message}</p>
}

export function LoginForm({ onSuccess }) {
  const [username, onUsername] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(username.trim(), password)
      setSession(data.token, data.user)
      onSuccess(data.user)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <ErrorBox message={error} />
      <Field id="login-username" label="Username atau Email" value={username} onChange={onUsername} autoComplete="username" required />
      <Field id="login-password" label="Password" type="password" value={password} onChange={onPassword} autoComplete="current-password" required />
      <button id="login-submit" type="submit" disabled={loading} className={btnCls}>
        <IconLogin size={20} aria-hidden="true" />
        {loading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const [name, onName] = useInput('')
  const [username, onUsername] = useInput('')
  const [email, onEmail] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^[a-zA-Z0-9_.]{3,50}$/.test(username.trim())) return setError('Username 3-50 karakter (huruf, angka, titik, underscore).')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Format email tidak valid.')
    if (password.length < 6) return setError('Password minimal 6 karakter.')
    setLoading(true)
    try {
      await authApi.register({ name: name.trim(), username: username.trim(), email: email.trim(), password })
      const data = await authApi.login(username.trim(), password)
      setSession(data.token, data.user)
      onSuccess(data.user)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <ErrorBox message={error} />
      <Field id="register-name" label="Nama Lengkap" value={name} onChange={onName} autoComplete="name" />
      <Field id="register-username" label="Username" value={username} onChange={onUsername} autoComplete="username" required />
      <Field id="register-email" label="Email" type="email" value={email} onChange={onEmail} autoComplete="email" required />
      <Field id="register-password" label="Password (min. 6 karakter)" type="password" value={password} onChange={onPassword} autoComplete="new-password" required />
      <button id="register-submit" type="submit" disabled={loading} className={btnCls}>
        <IconUserPlus size={20} aria-hidden="true" />
        {loading ? 'Memproses…' : 'Daftar'}
      </button>
    </form>
  )
}

export default function AuthPage({ mode = 'login', onLoggedIn }) {
  const isLogin = mode === 'login'
  useEffect(() => {
    setMeta(
      isLogin ? 'Masuk | Delcom Blog' : 'Daftar Penulis | Delcom Blog',
      isLogin ? 'Masuk ke ruang kerja penulis Delcom Blog untuk mengelola artikel Anda.' : 'Daftar akun penulis Delcom Blog dan mulai menulis artikel dengan bantuan AI.',
    )
  }, [isLogin])

  return (
    <div className="flex justify-center px-4 py-12">
      <section aria-labelledby="auth-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <h1 id="auth-title" className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {isLogin ? 'Kelola artikel dan gunakan AI Blog Generator.' : 'Buat akun gratis untuk mulai menulis.'}
        </p>
        <div className="mt-6">{isLogin ? <LoginForm onSuccess={onLoggedIn} /> : <RegisterForm onSuccess={onLoggedIn} />}</div>
        <p className="mt-6 text-center text-sm text-slate-700 dark:text-slate-300">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-indigo-700 underline dark:text-indigo-300">
            {isLogin ? 'Daftar akun penulis' : 'Masuk ke akun Anda'}
          </Link>
        </p>
      </section>
    </div>
  )
}
