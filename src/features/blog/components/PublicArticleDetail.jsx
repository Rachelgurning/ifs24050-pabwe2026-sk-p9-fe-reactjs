import { useEffect, useState } from 'react'
import { IconArrowLeft, IconCalendar, IconClock, IconUser } from '@tabler/icons-react'
import Link from '../../../components/Link'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { blogApi } from '../api/blogApi'
import { formatDate, setMeta } from '../../../helpers/toolsHelper'

const backCls = 'inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300'

export default function PublicArticleDetail({ slug }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    blogApi
      .publicPost(slug)
      .then((d) => {
        if (!active) return
        setPost(d.post)
        setMeta(`${d.post.title} | Delcom Blog`, d.post.excerpt)
      })
      .catch((e) => {
        if (!active) return
        setError(e.message)
        setMeta('Artikel tidak ditemukan | Delcom Blog')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="w-full px-4 py-8 sm:px-8">
        <p role="status" className="text-slate-600 dark:text-slate-300">Memuat artikel…</p>
        <div aria-hidden="true" className="mt-4 h-12 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div aria-hidden="true" className="mt-6 h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Artikel tidak ditemukan</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{error || 'Artikel mungkin sudah dihapus atau belum diterbitkan.'}</p>
        <Link to="/" className={`${backCls} mt-6`}><IconArrowLeft size={18} aria-hidden="true" />Kembali ke beranda</Link>
      </div>
    )
  }

  return (
    <article className="w-full px-4 py-8 sm:px-8">
      <Link to="/" className={backCls}><IconArrowLeft size={18} aria-hidden="true" />Kembali ke beranda</Link>
      <header className="mt-4 border-b border-slate-200 pb-6 dark:border-slate-700">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{post.category}</span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl dark:text-white">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{post.excerpt}</p>}
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1"><IconUser size={16} aria-hidden="true" />{post.author?.name || post.author?.username}</span>
          <span className="inline-flex items-center gap-1"><IconCalendar size={16} aria-hidden="true" /><time dateTime={post.published_at || ''}>{formatDate(post.published_at)}</time></span>
          <span className="inline-flex items-center gap-1"><IconClock size={16} aria-hidden="true" />{post.reading_time} menit baca</span>
        </p>
      </header>
      {post.cover_image_path && (
        <img src={post.cover_image_path} alt={`Gambar sampul: ${post.title}`} width="1600" height="900" className="mt-6 aspect-video w-full rounded-2xl object-cover" />
      )}
      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-10 dark:bg-slate-900">
        <MarkdownViewer content={post.content} />
      </div>
    </article>
  )
}
