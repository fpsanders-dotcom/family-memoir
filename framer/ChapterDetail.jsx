import { useEffect, useState } from 'react'
import { addPropertyControls, ControlType } from 'framer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ohzikpdbuhdaqrzscoxu.supabase.co',
  'sb_publishable_5xBXzSwlU9WP88nd4pX2BA_klBTf0SN'
)

export default function ChapterDetail({ chapterId }) {
  const [chapter, setChapter] = useState(null)
  const [photos, setPhotos] = useState([])
  const [reflections, setReflections] = useState([])

  useEffect(() => {
    if (!chapterId) return

    async function fetchData() {
      const [chapterRes, photosRes, reflectionsRes] = await Promise.all([
        supabase.from('chapters').select('*').eq('id', chapterId).single(),
        supabase.from('photos').select('*').eq('chapter_id', chapterId).order('sort_order'),
        supabase
          .from('reflections')
          .select('*, members(name, initials, avatar_color)')
          .eq('chapter_id', chapterId),
      ])

      if (chapterRes.error) {
        console.error('Error fetching chapter:', chapterRes.error)
      } else {
        setChapter(chapterRes.data)
      }

      if (photosRes.error) {
        console.error('Error fetching photos:', photosRes.error)
      } else {
        setPhotos(photosRes.data)
      }

      if (reflectionsRes.error) {
        console.error('Error fetching reflections:', reflectionsRes.error)
      } else {
        setReflections(reflectionsRes.data)
      }
    }

    fetchData()
  }, [chapterId])

  if (!chapterId) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>
        Select a chapter
      </div>
    )
  }

  if (!chapter) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, padding: 16 }}>
      {/* Header */}
      <div style={{ fontWeight: 500, fontSize: 18 }}>{chapter.title}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
        {chapter.year}{chapter.month ? `.${chapter.month}` : ''} · {chapter.location}
      </div>

      {/* Context */}
      {chapter.context && (
        <div
          style={{
            marginTop: 16,
            fontSize: 14,
            color: '#333',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.6,
          }}
        >
          {chapter.context}
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {photos.map((photo) => {
            const { data } = supabase.storage.from('photos').getPublicUrl(photo.storage_path)
            return (
              <div key={photo.id}>
                <img
                  src={data.publicUrl}
                  alt={photo.caption || ''}
                  style={{ width: '100%', borderRadius: 4, display: 'block' }}
                />
                {photo.caption && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                    {photo.caption}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reflections */}
      {reflections.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reflections.map((reflection) => {
            const member = reflection.members
            return (
              <div
                key={reflection.id}
                style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: member?.avatar_color || '#534AB7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    {member?.initials || '?'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>
                    {member?.name || 'Unknown'}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>
                  {reflection.content}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

addPropertyControls(ChapterDetail, {
  chapterId: {
    type: ControlType.String,
    title: 'Chapter ID',
    defaultValue: '',
  },
})
