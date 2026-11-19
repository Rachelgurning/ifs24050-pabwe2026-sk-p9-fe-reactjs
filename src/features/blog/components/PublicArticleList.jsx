import { useEffect, useState } from 'react'
import { IconCalendar, IconClock, IconSearch, IconUser } from '@tabler/icons-react'
import Link from '../../../components/Link'
import { blogApi, CATEGORIES } from '../api/blogApi'
import { formatDate, setMeta } from '../../../helpers/toolsHelper'

const FILTERS = [{ label: 'Semua', value: '' }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]

export default function PublicArticleList() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setMeta(
      'Delcom Blog — Artikel Teknologi, Pendidikan & Gaya Hidup',
      'Delcom Blog — platform publikasi artikel teknologi, pendidikan, gaya hidup, dan bisnis dengan editor Markdown serta AI Content Generator terintegrasi mesin pencari.',
    )
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    const t = setTimeout(() => {
      blogApi
        .publicPosts(query.trim(), category)
        .then((d) => {
          if (!active) return
          setPosts(d.posts || [])
          setError('')
        })
        .catch((e) => active && setError(e.message))
        .finally(() => active && setLoading(false))
    }, query ? 300 : 0)
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [query, category])

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <section aria-labelledby="hero-title" className="rounded-2xl bg-indigo-700 px-6 py-10 text-white sm:px-10">
        <h1 id="hero-title" className="text-3xl font-extrabold sm:text-4xl">Delcom Blog</h1>
        <p className="mt-3 max-w-2xl text-base text-indigo-100">
          Baca artikel terbaru seputar teknologi, pendidikan, gaya hidup, bisnis, dan opini dari para penulis Delcom.
        </p>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6 max-w-xl">
          <label htmlFor="search-posts" className="sr-only">Cari artikel</label>
          <div className="relative">
            <IconSearch size={20} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="search-posts"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul atau isi artikel…"
              className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            />
          </div>
        </form>
      </section>

      <div role="group" aria-label="Filter kategori" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((c) => {
          const active = category === c.value
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c.value)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${active ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'}`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <section aria-labelledby="list-title" className="mt-8">
        <h2 id="list-title" className="text-xl font-bold text-slate-900 dark:text-white">
          {category ? `Artikel ${category}` : 'Artikel Terbaru'}
        </h2>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {loading ? (
          <>
            <p role="status" className="sr-only">Memuat artikel…</p>
            <div aria-hidden="true" className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
            </div>
          </>
        ) : posts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Belum ada artikel yang cocok dengan pencarian Anda.
          </p>
        ) : (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{p.category}</span>
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <IconClock size={14} aria-hidden="true" />{p.reading_time} menit baca
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug">
                    <Link to={`/posts/${p.slug}`} className="text-slate-900 hover:text-indigo-700 hover:underline dark:text-white">{p.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-300">{p.excerpt}</p>
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1"><IconUser size={14} aria-hidden="true" />{p.author?.name || p.author?.username || 'Penulis'}</span>
                    <span className="inline-flex items-center gap-1"><IconCalendar size={14} aria-hidden="true" /><time dateTime={p.published_at || ''}>{formatDate(p.published_at)}</time></span>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
