import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ initialValue = '', onChange, height = '100%' }) {
  const elRef = useRef(null)
  const cbRef = useRef(onChange)
  cbRef.current = onChange

  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark')
    const editor = new Editor({
      el: elRef.current,
      initialValue,
      height,
      previewStyle: window.innerWidth > 900 ? 'vertical' : 'tab',
      initialEditType: 'markdown',
      usageStatistics: false,
      theme: dark ? 'dark' : 'light',
      placeholder: 'Tulis isi artikel dalam format Markdown…',
      events: { change: () => cbRef.current?.(editor.getMarkdown()) },
    })
    return () => editor.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={elRef} className="h-full" />
}
