import { IconHome, IconLogout, IconMoon, IconNews, IconPencil, IconShieldLock, IconSun } from '@tabler/icons-react'
import Link from '../../../components/Link'

const linkCls = 'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'

export default function StickyNavbar({ user, onLogout, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-2 text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
          <IconNews size={26} aria-hidden="true" />
          Delcom Blog
        </Link>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className={linkCls}><IconHome size={18} aria-hidden="true" />Beranda</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/author" className={linkCls}><IconPencil size={18} aria-hidden="true" />Ruang Penulis</Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className={linkCls}><IconShieldLock size={18} aria-hidden="true" />Panel Admin</Link>
                </li>
              )}
              <li>
                <button type="button" onClick={onLogout} className={linkCls}><IconLogout size={18} aria-hidden="true" />Keluar</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={linkCls}>Masuk</Link>
              </li>
              <li>
                <Link to="/register" className="inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800">Daftar</Link>
              </li>
            </>
          )}
          <li>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <IconSun size={20} aria-hidden="true" /> : <IconMoon size={20} aria-hidden="true" />}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
