import { useEffect, useState } from 'react'
import { IconCircleCheck, IconFileText, IconPencil, IconUsers, IconX } from '@tabler/icons-react'
import Link from '../../../components/Link'
import { adminApi } from '../api/adminApi'
import { formatDate, setMeta, showErrorAlert } from '../../../helpers/toolsHelper'

const th = 'px-5 py-3'
const td = 'px-5 py-3 text-slate-700 dark:text-slate-200'
const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'

function StatusBadge({ published }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
      {published ? 'Terbit' : 'Draf'}
    </span>
  )
}

function PostsTable({ posts, label }) {
  if (!posts.length) return <p className="p-5 text-slate-600 dark:text-slate-300">Belum ada artikel.</p>
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <tr>
            <th scope="col" className={th}>Judul</th>
            <th scope="col" className={th}>Penulis</th>
            <th scope="col" className={th}>Kategori</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={th}>Waktu Baca</th>
            <th scope="col" className={th}>Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
              <td className={`${td} font-medium`}>
                {p.is_published ? <Link to={`/posts/${p.slug}`} className="text-indigo-700 underline dark:text-indigo-300">{p.title}</Link> : p.title}
              </td>
              <td className={td}>{p.author?.username || '-'}</td>
              <td className={td}>{p.category}</td>
              <td className={td}><StatusBadge published={p.is_published} /></td>
              <td className={td}>{p.reading_time} menit</td>
              <td className={td}>{formatDate(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMeta('Panel Admin | Delcom Blog', 'Panel administrasi Delcom Blog untuk memantau seluruh pengguna dan artikel.')
    Promise.all([adminApi.users(), adminApi.posts()])
      .then(([u, p]) => {
        setUsers(u.users || [])
        setPosts(p.posts || [])
      })
      .catch((e) => showErrorAlert('Gagal memuat data admin', e.message))
      .finally(() => setLoading(false))
  }, [])

  const showUser = async (u) => {
    try {
      const d = await adminApi.userPosts(u.id)
      setSelected({ user: d.user || u, posts: d.posts || [] })
    } catch (e) {
      showErrorAlert('Gagal memuat artikel pengguna', e.message)
    }
  }

  const published = posts.filter((p) => p.is_published).length
  const stats = [
    { label: 'Total Pengguna', value: users.length, Icon: IconUsers, cls: 'bg-sky-100 text-sky-900' },
    { label: 'Total Artikel', value: posts.length, Icon: IconFileText, cls: 'bg-indigo-100 text-indigo-800' },
    { label: 'Artikel Terbit', value: published, Icon: IconCircleCheck, cls: 'bg-emerald-100 text-emerald-800' },
    { label: 'Artikel Draf', value: posts.length - published, Icon: IconPencil, cls: 'bg-amber-100 text-amber-900' },
  ]

  return (
    <div className="w-full px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Panel Administrasi</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">Pantau seluruh pengguna dan arsip artikel dalam sistem.</p>

      <ul aria-label="Ringkasan sistem" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, cls }) => (
          <li key={label} className={`${card} flex items-center gap-4 p-5`}>
            <span className={`rounded-xl p-3 ${cls}`}><Icon size={26} aria-hidden="true" /></span>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '…' : value}</p>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="users-title" className={`${card} mt-8`}>
        <h2 id="users-title" className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-slate-900 dark:border-slate-700 dark:text-white">Direktori Pengguna</h2>
        {loading ? (
          <p role="status" className="p-5 text-slate-600 dark:text-slate-300">Memuat data…</p>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel pengguna">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th scope="col" className={th}>ID</th>
                  <th scope="col" className={th}>Username</th>
                  <th scope="col" className={th}>Nama</th>
                  <th scope="col" className={th}>Email</th>
                  <th scope="col" className={th}>Role</th>
                  <th scope="col" className={th}>Total Artikel</th>
                  <th scope="col" className={th}>Total Terbit</th>
                  <th scope="col" className={th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className={td}>{u.id}</td>
                    <td className={`${td} font-semibold`}>{u.username}</td>
                    <td className={td}>{u.name}</td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-100 text-violet-900' : 'bg-slate-100 text-slate-800'}`}>{u.role}</span>
                    </td>
                    <td className={td}>{u.total_posts}</td>
                    <td className={td}>{u.published_posts}</td>
                    <td className={td}>
                      <button type="button" onClick={() => showUser(u)} aria-label={`Lihat artikel milik ${u.username}`} className="min-h-11 rounded-lg border border-indigo-700 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-300 dark:hover:bg-slate-800">
                        Lihat Artikel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section aria-labelledby="selected-title" className={`${card} mt-8`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 id="selected-title" className="text-lg font-bold text-slate-900 dark:text-white">Artikel oleh {selected.user.username}</h2>
            <button type="button" onClick={() => setSelected(null)} aria-label="Tutup daftar artikel pengguna" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <IconX size={20} aria-hidden="true" />
            </button>
          </div>
          <PostsTable posts={selected.posts} label={`Tabel artikel ${selected.user.username}`} />
        </section>
      )}

      <section aria-labelledby="all-posts-title" className={`${card} mt-8`}>
        <h2 id="all-posts-title" className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-slate-900 dark:border-slate-700 dark:text-white">Arsip Seluruh Artikel</h2>
        {loading ? <p role="status" className="p-5 text-slate-600 dark:text-slate-300">Memuat data…</p> : <PostsTable posts={posts} label="Tabel seluruh artikel" />}
      </section>
    </div>
  )
}
