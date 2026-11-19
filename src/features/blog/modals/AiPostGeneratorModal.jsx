import { useEffect, useState } from 'react'
import { IconExternalLink, IconSparkles, IconX } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { blogApi, CATEGORIES } from '../api/blogApi'

const inputCls = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
const labelCls = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200'

export default function AiPostGeneratorModal({ onClose, onApply }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [tone, setTone] = useState('informatif')
  const [web, setWeb] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const generate = async (e) => {
    e.preventDefault()
    if (topic.trim().length < 3) {
      setError('Topik minimal 3 karakter.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      setResult(await blogApi.aiGenerate({ topic: topic.trim(), category, tone, include_web_search: web }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const draft = result ? result.post || result : null
  const sources = result?.sources || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-violet-700 px-5 py-4 text-white">
          <h2 id="ai-modal-title" className="inline-flex items-center gap-2 text-lg font-bold"><IconSparkles size={22} aria-hidden="true" />AI Blog Generator</h2>
          <button type="button" onClick={onClose} aria-label="Tutup AI generator" className="rounded-lg p-2 hover:bg-violet-800"><IconX size={22} aria-hidden="true" /></button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <form id="ai-form" onSubmit={generate} className="space-y-4">
            <div>
              <label htmlFor="ai-topic" className={labelCls}>Topik Artikel</label>
              <textarea id="ai-topic" rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls} placeholder="Contoh: Tren kecerdasan buatan di dunia pendidikan 2026" />
            </div>
            <div>
              <label htmlFor="ai-category" className={labelCls}>Kategori</label>
              <select id="ai-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ai-tone" className={labelCls}>Gaya Bahasa</label>
              <select id="ai-tone" value={tone} onChange={(e) => setTone(e.target.value)} className={inputCls}>
                <option value="informatif">Informatif</option>
                <option value="santai">Santai</option>
                <option value="formal">Formal</option>
                <option value="persuasif">Persuasif</option>
              </select>
            </div>
            <label htmlFor="ai-web" className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800 dark:border-slate-700 dark:text-slate-200">
              <input id="ai-web" type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} className="mt-0.5 h-5 w-5 accent-violet-700" />
              <span><strong>Sertakan penelusuran Search Engine</strong><br />Artikel memakai fakta terkini dan daftar sumber rujukan web.</span>
            </label>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 font-semibold text-white hover:bg-violet-800 disabled:opacity-60">
              <IconSparkles size={20} aria-hidden="true" />{loading ? 'AI sedang menulis…' : 'Generate Artikel'}
            </button>
          </form>

          <section aria-labelledby="ai-preview-title" className="min-w-0 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
            <h3 id="ai-preview-title" className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Pratinjau</h3>
            {loading && <p role="status" className="mt-4 text-slate-600 dark:text-slate-300">Menelusuri web dan menyusun artikel, mohon tunggu…</p>}
            {!loading && !draft && <p className="mt-4 text-slate-600 dark:text-slate-300">Isi topik lalu klik “Generate Artikel”.</p>}
            {draft && (
              <div className="mt-4">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">{draft.category}</span>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{draft.title}</p>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{draft.excerpt}</p>
                <MarkdownViewer content={draft.content} className="mt-6" />
                {sources.length > 0 && (
                  <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">Sumber Penelusuran Search Engine</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      {sources.map((s) => (
                        <li key={s.url}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-violet-800 underline dark:text-violet-300">
                            {s.title}<IconExternalLink size={14} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">Batal</button>
          <button
            type="button"
            disabled={!draft}
            onClick={() => onApply({ title: draft.title, category: draft.category, excerpt: draft.excerpt, content: draft.content })}
            className="min-h-11 rounded-lg bg-violet-700 px-6 font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
          >
            Terapkan ke Editor
          </button>
        </div>
      </div>
    </div>
  )
}
