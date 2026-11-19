import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconEdit, IconEye, IconPlus, IconSparkles, IconTrash } from '@tabler/icons-react'
import Link from '../../../components/Link'
import PostStats from './PostStats'
import { blogApi } from '../api/blogApi'
import { formatDate, setMeta, showConfirm, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

const PostModal = lazy(() => import('../modals/PostModal'))
const AiPostGeneratorModal = lazy(() => import('../modals/AiPostGeneratorModal'))

const menuItemCls = 'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800'

export default function AuthorDashboard({ user }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [menuId, setMenuId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([blogApi.myPosts(), blogApi.stats()])
      setPosts(p.posts || [])
      setStats(s.stats || s)
    } catch (e) {
      showErrorAlert('Gagal memuat artikel', e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMeta('Ruang Kerja Penulis | Delcom Blog', 'Kelola artikel, status publikasi, dan buat draf otomatis dengan AI Blog Generator.')
    load()
  }, [load])

  useEffect(() => {
    if (menuId === null) return undefined
    const close = (e) => {
      if (!e.target.closest('[data-kebab]')) setMenuId(null)
    }
    const esc = (e) => e.key === 'Escape' && setMenuId(null)
    document.addEventListener('click', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', esc)
    }
  }, [menuId])

  const toggle = async (p) => {
    try {
      const d = await blogApi.togglePublish(p.id)
      setPosts((list) => list.map((x) => (x.id === p.id ? d.post : x)))
      const s = await blogApi.stats()
      setStats(s.stats || s)
    } catch (e) {
      showErrorAlert('Gagal mengubah status', e.message)
    }
  }

  const edit = async (p) => {
    setMenuId(null)
    try {
      const d = await blogApi.getPost(p.id)
      setEditing(d.post)
    } catch (e) {
      showErrorAlert('Gagal membuka artikel', e.message)
    }
  }

  const remove = async (p) => {
    setMenuId(null)
    if (!(await showConfirm('Hapus artikel?', `"${p.title}" akan dihapus permanen.`))) return
    try {
      await blogApi.deletePost(p.id)
      showSuccessAlert('Artikel berhasil dihapus')
      load()
    } catch (e) {
      showErrorAlert('Gagal menghapus', e.message)
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Ruang Kerja Penulis</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Halo, {user?.name || user?.username}! Kelola seluruh artikel Anda di sini.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAiOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 font-semibold text-white hover:bg-violet-800">
            <IconSparkles size={20} aria-hidden="true" />AI Generator
          </button>
          <button type="button" onClick={() => setEditing({})} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-700 px-4 font-semibold text-white hover:bg-indigo-800">
            <IconPlus size={20} aria-hidden="true" />Tambah Artikel
          </button>
        </div>
      </div>

      <div className="mt-6"><PostStats stats={stats} /></div>

      <section aria-labelledby="my-posts-title" className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 id="my-posts-title" className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-slate-900 dark:border-slate-700 dark:text-white">Daftar Artikel Saya</h2>
        {loading ? (
          <p role="status" className="p-5 text-slate-600 dark:text-slate-300">Memuat artikel…</p>
        ) : posts.length === 0 ? (
          <p className="p-5 text-slate-600 dark:text-slate-300">Belum ada artikel. Klik “Tambah Artikel” atau gunakan AI Generator.</p>
        ) : (
          <div className="overflow-x-auto pb-24" tabIndex={0} role="region" aria-label="Tabel artikel saya">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Judul</th>
                  <th scope="col" className="px-5 py-3">Kategori</th>
                  <th scope="col" className="px-5 py-3">Status Publikasi</th>
                  <th scope="col" className="px-5 py-3">Diperbarui</th>
                  <th scope="col" className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{p.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{p.reading_time} menit baca</p>
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{p.category}</td>
                    <td className="px-5 py-3">
                      <button type="button" role="switch" aria-checked={p.is_published} aria-label={`Terbitkan: ${p.title}`} onClick={() => toggle(p)} className="inline-flex min-h-11 items-center gap-2">
                        <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${p.is_published ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                          <span className={`inline-block h-5 w-5 rounded-full bg-white transition ${p.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </span>
                        <span className={`text-sm font-medium ${p.is_published ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>{p.is_published ? 'Terbit' : 'Draf'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{formatDate(p.updated_at)}</td>
                    <td className="relative px-5 py-3 text-right" data-kebab>
                      <button
                        type="button"
                        aria-label={`Menu aksi: ${p.title}`}
                        aria-haspopup="menu"
                        aria-expanded={menuId === p.id}
                        onClick={() => setMenuId(menuId === p.id ? null : p.id)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <IconDotsVertical size={20} aria-hidden="true" />
                      </button>
                      {menuId === p.id && (
                        <ul role="menu" className="absolute right-5 top-14 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1 text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                          <li role="none">
                            <button type="button" role="menuitem" onClick={() => edit(p)} className={menuItemCls}><IconEdit size={18} aria-hidden="true" />Edit</button>
                          </li>
                          {p.is_published && (
                            <li role="none">
                              <Link to={`/posts/${p.slug}`} role="menuitem" className={menuItemCls}><IconEye size={18} aria-hidden="true" />Lihat</Link>
                            </li>
                          )}
                          <li role="none">
                            <button type="button" role="menuitem" onClick={() => remove(p)} className={`${menuItemCls} text-red-700 dark:text-red-400`}><IconTrash size={18} aria-hidden="true" />Hapus</button>
                          </li>
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        {editing && (
          <PostModal
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              load()
            }}
          />
        )}
        {aiOpen && (
          <AiPostGeneratorModal
            onClose={() => setAiOpen(false)}
            onApply={(draft) => {
              setAiOpen(false)
              setEditing({ ...draft, is_published: false })
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
