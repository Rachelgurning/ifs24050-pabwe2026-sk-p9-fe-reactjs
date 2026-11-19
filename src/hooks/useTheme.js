import { useEffect, useState } from 'react'

const KEY = 'delcom_blog_theme'

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(KEY) || 'light'
    } catch {
      return 'light'
    }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem(KEY, theme)
    } catch {
      /* abaikan */
    }
  }, [theme])
  return { theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
