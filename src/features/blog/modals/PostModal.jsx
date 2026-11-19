import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { blogApi, CATEGORIES } from '../api/blogApi'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

const MarkdownEditor = lazy(() => import('../../../components/MarkdownEditor'))

const inputCls = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
const labelCls = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200'

export default function PostModal({ initial = {}, onClose, onSaved }) {
  const isEdit = Boolean(initial.id)
  const [title, setTitle] = useState(initial.title || '')
  const [category, setCategory] = useState(CATEGORIES.includes(initial.category) ? initial.category : 'Umum')
  const [excerpt, setExcerpt] = useState(initial.excerpt || '')
  const [cover, setCover] = useState(initial.cover_image_path || '')
  const [published, setPublished] = useState(Boolean(initial.is_published))
  const [saving, setSaving] = useState(false)
  const contentRef = useRef(initial.content || '')

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    const content = contentRef.current.trim()
    if (!title.trim() || !content) {
      showErrorAlert('Data belum lengkap', 'Judul dan konten artikel wajib diisi.')
      return
    }
    setSaving(true)
    const payload = { title: title.trim(), category, excerpt: excerpt.trim(), content, cover_image_path: cover.trim(), is_published: published }
    try {
      if (isEdit) await blogApi.updatePost(initial.id, payload)
      else await blogApi.createPost(payload)
      showSuccessAlert(isEdit ? 'Artikel diperbarui' : 'Artikel berhasil dibuat')
      onSaved()
    } catch (err) {
      showErrorAlert('Gagal menyimpan', err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="post-modal-title" className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-indigo-700 px-5 py-4 text-white">
          <h2 id="post-modal-title" className="text-lg font-bold">{isEdit ? 'Edit Artikel' : 'Tambah Artikel'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup editor artikel" className="rounded-lg p-2 hover:bg-indigo-800">
            <IconX size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label htmlFor="post-title" className={labelCls}>Judul Artikel</label>
              <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} maxLength={255} required />
            </div>
            <div>
              <label htmlFor="post-category" className={labelCls}>Kategori</label>
              <select id="post-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label htmlFor="post-published" className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input id="post-published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5 accent-indigo-700" />
                Langsung terbitkan
              </label>
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="post-excerpt" className={labelCls}>Ringkasan (excerpt)</label>
              <textarea id="post-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} placeholder="1-2 kalimat pemikat (opsional, otomatis jika kosong)" />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="post-cover" className={labelCls}>URL Gambar Sampul (opsional)</label>
              <input id="post-cover" type="url" value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
          </div>
          <p className={`${labelCls} mt-5`}>Konten Artikel (Markdown)</p>
          <div className="h-[62vh] min-h-[420px]">
            <Suspense fallback={<p className="p-4 text-slate-600">Memuat editor…</p>}>
              <MarkdownEditor initialValue={contentRef.current} onChange={(v) => { contentRef.current = v }} height="100%" />
            </Suspense>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">Batal</button>
          <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-indigo-700 px-6 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  )
}
