export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function navigate(to, replace = false) {
  if (window.location.pathname !== to) window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function setMeta(title, description) {
  document.title = title
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}

async function swal() {
  const mod = await import('sweetalert2')
  return mod.default
}

export async function showSuccessAlert(title, text = '') {
  const Swal = await swal()
  return Swal.fire({ icon: 'success', title, text, timer: 1600, showConfirmButton: false })
}

export async function showErrorAlert(title, text = '') {
  const Swal = await swal()
  return Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#4338ca' })
}

export async function showConfirm(title, text = '') {
  const Swal = await swal()
  const r = await Swal.fire({
    icon: 'warning', title, text, showCancelButton: true,
    confirmButtonText: 'Ya, hapus', cancelButtonText: 'Batal', confirmButtonColor: '#b91c1c',
  })
  return r.isConfirmed
}
