import { useEffect, useState } from 'react'
import { addPropertyControls } from 'framer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ohzikpdbuhdaqrzscoxu.supabase.co',
  'sb_publishable_5xBXzSwlU9WP88nd4pX2BA_klBTf0SN'
)

const SAMPLE_ENTRIES = [
  { id: 'sample-1', year: 2024, title: 'Sample entry 2024' },
  { id: 'sample-2', year: 2023, title: 'Sample entry 2023' },
  { id: 'sample-3', year: 2018, title: 'Sample entry 2018' },
  { id: 'sample-4', year: 1995, title: 'Sample entry 1995' },
  { id: 'sample-5', year: 1970, title: 'Sample entry 1970' },
]

export default function Timeline() {
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    async function fetchChapters() {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('year', { ascending: false })

      if (error) {
        console.error('Error fetching chapters:', error)
        setChapters(SAMPLE_ENTRIES)
      } else {
        console.log('Chapters:', data)
        setChapters(data.length > 0 ? data : SAMPLE_ENTRIES)
      }
    }

    fetchChapters()
  }, [])

  // Calculate positions with spread to prevent overlap
  const MIN_GAP = 24
  const HEIGHT = 460
  const positions = chapters.map((ch) => ({
    ...ch,
    top: (1 - Math.pow((ch.year - 1900) / (2024 - 1900), 0.38)) * HEIGHT,
  }))

  // Sort by top position
  positions.sort((a, b) => a.top - b.top)

  // Push overlapping entries apart (20 iterations)
  for (let i = 0; i < 20; i++) {
    for (let j = 1; j < positions.length; j++) {
      const gap = positions[j].top - positions[j - 1].top
      if (gap < MIN_GAP) {
        const push = (MIN_GAP - gap) / 2
        positions[j - 1].top -= push
        positions[j].top += push
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: 500, overflow: 'hidden' }}>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 0,
          bottom: 0,
          width: 1,
          background: '#534AB7',
          opacity: 0.3,
        }}
      />

      {positions.map((chapter) => (
        <div
          key={chapter.id}
          style={{
            position: 'absolute',
            top: chapter.top,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#534AB7',
              flexShrink: 0,
              marginLeft: 15,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{chapter.year}</div>
            <div style={{ fontSize: 12, color: '#333' }}>{chapter.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

addPropertyControls(Timeline, {})
