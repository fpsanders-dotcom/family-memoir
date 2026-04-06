import { useEffect, useState, useRef } from 'react'
import { addPropertyControls, ControlType } from 'framer'
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

// --- SVG Icons ---

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M20 24l-8-8 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M12 8l8 8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- Inline Sub-Components ---

function TimelinePanel() {
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

  positions.sort((a, b) => a.top - b.top)

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
    <div style={{ position: 'relative', width: '100%', height: 500, overflow: 'hidden' }}>
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

function ChapterListPanel({ onSelectChapter, selectedChapterId }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>{chapter.title}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {chapter.year} · {chapter.location}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChapterDetailPanel({ chapterId, onPhotoClick }) {
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

      if (chapterRes.error) console.error('Error fetching chapter:', chapterRes.error)
      else setChapter(chapterRes.data)

      if (photosRes.error) console.error('Error fetching photos:', photosRes.error)
      else setPhotos(photosRes.data)

      if (reflectionsRes.error) console.error('Error fetching reflections:', reflectionsRes.error)
      else setReflections(reflectionsRes.data)
    }

    fetchData()
  }, [chapterId])

  if (!chapterId) return null

  if (!chapter) {
    return <div style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: 400, padding: 16 }}>
      <div style={{ fontWeight: 500, fontSize: 18 }}>{chapter.title}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
        {chapter.year}{chapter.month ? `.${chapter.month}` : ''} · {chapter.location}
      </div>

      {chapter.context && (
        <div style={{ marginTop: 16, fontSize: 14, color: '#333', fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
          {chapter.context}
        </div>
      )}

      {photos.length > 0 && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {photos.map((photo) => {
            const { data } = supabase.storage.from('photos').getPublicUrl(photo.storage_path)
            return (
              <div key={photo.id}>
                <img
                  src={data.publicUrl}
                  alt={photo.caption || ''}
                  onClick={(e) => { e.stopPropagation(); console.log('Grid photo clicked:', photo.id); onPhotoClick?.(photo.id) }}
                  style={{ width: '100%', borderRadius: 4, display: 'block', cursor: 'pointer' }}
                />
                {photo.caption && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{photo.caption}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {reflections.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reflections.map((reflection) => {
            const member = reflection.members
            return (
              <div
                key={reflection.id}
                style={{ background: '#ffffff', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: 12 }}
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
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{member?.name || 'Unknown'}</div>
                </div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{reflection.content}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Main Layout ---

export default function MemoirLayout({ defaultView = 'exploring', defaultSidebarCollapsed = false }) {
  const [view, setView] = useState(defaultView)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed)
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [allPhotos, setAllPhotos] = useState([])
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedPhotoId, setSelectedPhotoId] = useState(null)
  const [photoTags, setPhotoTags] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [promptSaved, setPromptSaved] = useState(null)
  const fileInputRef = useRef(null)

  // Fetch all members once
  useEffect(() => {
    async function fetchMembers() {
      const { data, error } = await supabase.from('members').select('id, name, initials, avatar_color')
      if (!error) setAllMembers(data)
    }
    fetchMembers()
  }, [])

  // Fetch photo tags when a photo is selected
  useEffect(() => {
    if (!selectedPhotoId) return
    async function fetchTags() {
      const { data, error } = await supabase
        .from('photo_tags')
        .select('*, members(id, name, initials, avatar_color)')
        .eq('photo_id', selectedPhotoId)
      if (!error) setPhotoTags(data)
    }
    fetchTags()
    setPromptSaved(null)
  }, [selectedPhotoId])

  // Tag a member
  async function handleTagMember(memberId) {
    const { error } = await supabase.from('photo_tags').insert({ photo_id: selectedPhotoId, member_id: memberId })
    if (error) { console.error('Tag error:', error); return }
    const { data } = await supabase
      .from('photo_tags')
      .select('*, members(id, name, initials, avatar_color)')
      .eq('photo_id', selectedPhotoId)
    if (data) setPhotoTags(data)
  }

  // Untag a member
  async function handleUntagMember(tagId) {
    await supabase.from('photo_tags').delete().eq('id', tagId)
    setPhotoTags((prev) => prev.filter((t) => t.id !== tagId))
  }

  // Ask for input — create prompt row
  async function handleAskForInput(member) {
    const photo = allPhotos.find((p) => p.id === selectedPhotoId)
    if (!photo) return
    const { error } = await supabase.from('prompts').insert({
      member_id: member.id,
      chapter_id: photo.chapter_id,
      photo_id: selectedPhotoId,
      question: 'What do you remember about this photo?',
      status: 'pending',
      sent_at: null,
      replied_at: null,
    })
    if (error) console.error('Prompt error:', error)
    else setPromptSaved(member.id)
  }

  // Fetch all photos for carousel
  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from('photos')
        .select('*, chapters(title, year)')
        .order('sort_order')

      if (error) console.error('Error fetching photos:', error)
      else setAllPhotos(data)
    }
    fetchPhotos()
  }, [refreshKey])

  // Keyboard navigation for carousel
  useEffect(() => {
    if (view !== 'exploring' || allPhotos.length === 0) return
    function handleKey(e) {
      if (e.key === 'ArrowLeft') setCarouselIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)
      if (e.key === 'ArrowRight') setCarouselIndex((i) => (i + 1) % allPhotos.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [view, allPhotos.length])

  // Photo upload handler
  async function handlePhotoUpload(e) {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedChapterId) return
    setUploading(true)

    for (const file of files) {
      const path = `${selectedChapterId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { error: insertError } = await supabase.from('photos').insert({
        chapter_id: selectedChapterId,
        storage_path: path,
        caption: '',
        sort_order: 0,
      })

      if (insertError) console.error('Insert error:', insertError)
    }

    setUploading(false)
    setRefreshKey((k) => k + 1)
    e.target.value = ''
  }

  // Reflection submit handler
  async function handleReflectionSubmit() {
    if (!reflectionText.trim() || !selectedChapterId) return
    setSubmitting(true)

    const { data: members } = await supabase
      .from('members')
      .select('id')
      .eq('is_admin', true)
      .limit(1)

    const memberId = members?.[0]?.id

    const { error } = await supabase.from('reflections').insert({
      chapter_id: selectedChapterId,
      member_id: memberId,
      content: reflectionText.trim(),
      is_private: false,
      source: 'web',
    })

    if (error) {
      console.error('Reflection error:', error)
    } else {
      setReflectionText('')
      setRefreshKey((k) => k + 1)
    }
    setSubmitting(false)
  }

  // Current carousel photo
  const currentPhoto = allPhotos[carouselIndex]
  const currentPhotoUrl = currentPhoto
    ? supabase.storage.from('photos').getPublicUrl(currentPhoto.storage_path).data.publicUrl
    : null

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f9f9fb' }}>
      {/* ===== SIDEBAR ===== */}
      <div
        style={{
          width: sidebarCollapsed ? 40 : 200,
          minWidth: sidebarCollapsed ? 40 : 200,
          transition: 'width 0.2s ease, min-width 0.2s ease',
          borderRight: '1px solid #e5e7eb',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Collapse/expand toggle */}
        <div style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-end', padding: 4, flexShrink: 0 }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {sidebarCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 4 }}>
            <button
              onClick={() => { setView('exploring'); setSidebarCollapsed(false) }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: view === 'exploring' ? '#534AB7' : 'transparent',
                color: view === 'exploring' ? '#fff' : '#666',
              }}
            >
              <CompassIcon />
            </button>
            <button
              onClick={() => { setView('sharing'); setSidebarCollapsed(false) }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: view === 'sharing' ? '#534AB7' : 'transparent',
                color: view === 'sharing' ? '#fff' : '#666',
              }}
            >
              <PencilIcon />
            </button>
          </div>
        ) : (
          <>
            {/* Segmented control */}
            <div style={{ display: 'flex', margin: '0 8px 8px', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
              {['exploring', 'sharing'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 11,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: view === v ? '#534AB7' : 'transparent',
                    color: view === v ? '#fff' : '#666',
                  }}
                >
                  {v === 'exploring' ? 'Exploring' : 'Sharing'}
                </button>
              ))}
            </div>

            {/* Sidebar content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
              {view === 'exploring' ? (
                <TimelinePanel />
              ) : (
                <ChapterListPanel
                  onSelectChapter={setSelectedChapterId}
                  selectedChapterId={selectedChapterId}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ===== MAIN PANEL ===== */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'exploring' ? (
          /* --- Photo Carousel --- */
          <div
            style={{
              flex: 1,
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {allPhotos.length === 0 ? (
              <div style={{ color: '#888', fontSize: 14 }}>No photos yet</div>
            ) : (
              <>
                <button
                  onClick={() => setCarouselIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)}
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowLeftIcon />
                </button>

                <img
                  src={currentPhotoUrl}
                  alt={currentPhoto.caption || ''}
                  onClick={(e) => { e.stopPropagation(); console.log('Photo clicked:', currentPhoto.id); setSelectedPhotoId(currentPhoto.id) }}
                  style={{ maxWidth: '80%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 4, cursor: 'pointer' }}
                />

                <button
                  onClick={() => setCarouselIndex((i) => (i + 1) % allPhotos.length)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRightIcon />
                </button>

                {/* Caption bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                  }}
                >
                  {currentPhoto.caption && (
                    <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>{currentPhoto.caption}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#aaa' }}>
                    {currentPhoto.chapters?.title} · {currentPhoto.chapters?.year}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                    {carouselIndex + 1} / {allPhotos.length}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* --- Sharing / Edit Panel --- */
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
            {!selectedChapterId ? (
              <div style={{ alignSelf: 'center', color: '#6b7280', fontSize: 13 }}>
                Select a chapter from the sidebar
              </div>
            ) : (
              <div style={{ maxWidth: 500, width: '100%', padding: '16px 24px' }}>
                {/* Chapter detail (read-only display) */}
                <ChapterDetailPanel chapterId={selectedChapterId} key={refreshKey} onPhotoClick={setSelectedPhotoId} />

                {/* Add Photos */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: 8 }}>Add Photos</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: 20,
                      border: '1.5px dashed #d1d5db',
                      borderRadius: 8,
                      background: '#fafafa',
                      cursor: uploading ? 'wait' : 'pointer',
                      fontSize: 13,
                      color: '#6b7280',
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Click to upload photos'}
                  </button>
                </div>

                {/* Add Memory */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: 8 }}>Add Memory</div>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Share a memory about this chapter..."
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: 12,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 13,
                      fontFamily: 'Georgia, serif',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleReflectionSubmit}
                    disabled={submitting || !reflectionText.trim()}
                    style={{
                      marginTop: 8,
                      padding: '8px 16px',
                      background: '#534AB7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: submitting ? 'wait' : 'pointer',
                      opacity: !reflectionText.trim() ? 0.5 : 1,
                    }}
                  >
                    {submitting ? 'Saving...' : 'Save Memory'}
                  </button>
                </div>

                {/* AI Prompt */}
                <div style={{ marginTop: 24, marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: 8 }}>AI Assistant</div>
                  <div
                    style={{
                      padding: 16,
                      background: '#f3f0ff',
                      borderRadius: 8,
                      border: '1px solid #e0d9f6',
                    }}
                  >
                    <div style={{ fontSize: 13, color: '#534AB7', marginBottom: 8 }}>
                      What else do you remember about this moment?
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Tell me more..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: 6,
                          fontSize: 12,
                          boxSizing: 'border-box',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') console.log('AI prompt:', e.target.value)
                        }}
                      />
                      <button
                        onClick={() => console.log('AI prompt submitted')}
                        style={{
                          padding: '8px 12px',
                          background: '#534AB7',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ===== PHOTO DETAIL MODAL ===== */}
      {selectedPhotoId && (() => {
        const photo = allPhotos.find((p) => p.id === selectedPhotoId)
        console.log('Modal render:', { selectedPhotoId, photoFound: !!photo, allPhotosCount: allPhotos.length })
        if (!photo) return null
        const url = supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl
        const taggedIds = photoTags.map((t) => t.member_id)
        const untaggedMembers = allMembers.filter((m) => !taggedIds.includes(m.id))

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedPhotoId(null) }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhotoId(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Photo */}
            <img
              src={url}
              alt={photo.caption || ''}
              style={{ maxWidth: '60%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4 }}
            />

            {/* Right panel */}
            <div
              style={{
                width: 220,
                background: '#fff',
                borderRadius: 8,
                padding: 16,
                maxHeight: '80vh',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              {/* Tagged people */}
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Tagged people</div>
              {photoTags.length === 0 && (
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>No one tagged yet</div>
              )}
              {photoTags.map((tag) => {
                const m = tag.members
                return (
                  <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: m?.avatar_color || '#534AB7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {m?.initials || '?'}
                    </div>
                    <div style={{ fontSize: 12, color: '#333', flex: 1 }}>{m?.name || 'Unknown'}</div>
                    <button
                      onClick={() => handleUntagMember(tag.id)}
                      style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', padding: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

              {/* Tag someone */}
              {untaggedMembers.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Tag someone</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {untaggedMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleTagMember(m.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          border: '1px solid #e5e7eb',
                          borderRadius: 4,
                          background: '#fafafa',
                          cursor: 'pointer',
                          color: '#333',
                        }}
                      >
                        + {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />

              {/* Ask for input */}
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Ask for input</div>
              {photoTags.length === 0 && (
                <div style={{ fontSize: 12, color: '#aaa' }}>Tag someone first</div>
              )}
              {photoTags.map((tag) => {
                const m = tag.members
                if (!m) return null
                return (
                  <button
                    key={m.id}
                    onClick={() => handleAskForInput(m)}
                    disabled={promptSaved === m.id}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 10px',
                      marginBottom: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 6,
                      cursor: promptSaved === m.id ? 'default' : 'pointer',
                      background: promptSaved === m.id ? '#e5e7eb' : '#534AB7',
                      color: promptSaved === m.id ? '#666' : '#fff',
                      textAlign: 'left',
                    }}
                  >
                    {promptSaved === m.id ? `Prompt saved for ${m.name}` : `${m.name} — Ask for input`}
                  </button>
                )
              })}

              {/* Caption */}
              {photo.caption && (
                <>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>Caption</div>
                  <div style={{ fontSize: 12, color: '#333' }}>{photo.caption}</div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

addPropertyControls(MemoirLayout, {
  defaultView: {
    type: ControlType.Enum,
    options: ['exploring', 'sharing'],
    optionTitles: ['Exploring', 'Sharing'],
    defaultValue: 'exploring',
  },
  defaultSidebarCollapsed: {
    type: ControlType.Boolean,
    title: 'Sidebar Collapsed',
    defaultValue: false,
  },
})
