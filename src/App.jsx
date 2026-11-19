import { lazy, Suspense, useEffect, useState } from 'react'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import Link from './components/Link'
import { authApi } from './features/auth/api/authApi'
import { clearSession, getToken, getUser } from './helpers/apiHelper'
import { navigate, setMeta } from './helpers/toolsHelper'
import useTheme from './hooks/useTheme'

const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

function parseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/public') return { name: 'home' }
  const m = path.match(/^\/posts\/([^/]+)$/)
  if (m) return { name: 'detail', slug: decodeURIComponent(m[1]) }
  if (['/author', '/admin', '/login', '/register'].includes(path)) return { name: path.slice(1) }
  return { name: 'notfound' }
}

function NotFound() {
  useEffect(() => setMeta('Halaman tidak ditemukan | Delcom Blog'), [])
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">404 — Halaman tidak ditemukan</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">Halaman yang Anda cari tidak tersedia.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 font-semibold text-white">Kembali ke beranda</Link>
    </div>
  )
}

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [user, setUser] = useState(() => (getToken() ? getUser() : null))
  const [expired, setExpired] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const route = parseRoute(path)
  const loggedIn = Boolean(user && getToken())

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    const onExpired = () => {
      setUser(null)
      setExpired(true)
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('auth:expired', onExpired)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('auth:expired', onExpired)
    }
  }, [])

  let redirect = null
  if ((route.name === 'author' || route.name === 'admin') && !loggedIn && !expired) redirect = '/login'
  else if (route.name === 'admin' && loggedIn && user.role !== 'admin') redirect = '/author'
  else if ((route.name === 'login' || route.name === 'register') && loggedIn) redirect = '/author'

  useEffect(() => {
    if (redirect) navigate(redirect, true)
  }, [redirect])

  const onLoggedIn = () => {
    setExpired(false)
    window.location.assign('/author')
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      /* abaikan */
    }
    clearSession()
    setUser(null)
    navigate('/')
  }

  let page = null
  if (!redirect) {
    switch (route.name) {
      case 'home':
        page = <PublicArticleList />
        break
      case 'detail':
        page = <PublicArticleDetail key={route.slug} slug={route.slug} />
        break
      case 'login':
      case 'register':
        page = <AuthPage key={route.name} mode={route.name} onLoggedIn={onLoggedIn} />
        break
      case 'author':
        page = loggedIn ? <AuthorDashboard user={user} /> : null
        break
      case 'admin':
        page = loggedIn ? <AdminDashboard /> : null
        break
      default:
        page = <NotFound />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <StickyNavbar user={loggedIn ? user : null} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" className="flex-1">
        <Suspense fallback={<p role="status" className="p-8 text-slate-600 dark:text-slate-300">Memuat halaman…</p>}>{page}</Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        © 2026 Delcom Blog · Studi Kasus PABWE P9 · ifs24050
      </footer>
      {expired && !loggedIn && route.name !== 'login' && route.name !== 'register' && (
        <AuthModal
          onClose={() => {
            setExpired(false)
            navigate('/login')
          }}
          onLoggedIn={onLoggedIn}
        />
      )}
    </div>
  )
}
