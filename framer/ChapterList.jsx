import { useEffect, useState } from 'react'
import { addPropertyControls } from 'framer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ohzikpdbuhdaqrzscoxu.supabase.co',
  'sb_publishable_5xBXzSwlU9WP88nd4pX2BA_klBTf0SN'
)

export default function ChapterList({ onSelectChapter, selectedChapterId }) {
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    async function fetchChapters() {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (error) {
        console.error('Error fetching chapters:', error)
      } else {
        setChapters(data)
      }
    }

    fetchChapters()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          onClick={() => onSelectChapter?.(chapter.id)}
          style={{
            background: '#ffffff',
            border: '0.5px solid #e5e7eb',
            borderLeft: selectedChapterId === chapter.id ? '3px solid #534AB7' : '0.5px solid #e5e7eb',
            borderRadius: 8,
            padding: 16,
            cursor: onSelectChapter ? 'pointer' : 'default',
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>
            {chapter.title}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {chapter.year} · {chapter.location}
          </div>
        </div>
      ))}
    </div>
  )
}

addPropertyControls(ChapterList, {})
