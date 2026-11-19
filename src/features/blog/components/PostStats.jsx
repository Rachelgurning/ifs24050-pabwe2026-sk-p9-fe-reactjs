import { IconCircleCheck, IconFileText, IconPencil } from '@tabler/icons-react'

export default function PostStats({ stats }) {
  const items = [
    { label: 'Total Artikel', value: stats?.total_posts ?? 0, Icon: IconFileText, cls: 'bg-indigo-100 text-indigo-800' },
    { label: 'Total Terbit', value: stats?.published_posts ?? 0, Icon: IconCircleCheck, cls: 'bg-emerald-100 text-emerald-800' },
    { label: 'Belum Selesai / Draf', value: stats?.draft_posts ?? 0, Icon: IconPencil, cls: 'bg-amber-100 text-amber-900' },
  ]
  return (
    <ul aria-label="Statistik artikel" className="grid gap-4 sm:grid-cols-3">
      {items.map(({ label, value, Icon, cls }) => (
        <li key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span className={`rounded-xl p-3 ${cls}`}><Icon size={26} aria-hidden="true" /></span>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
