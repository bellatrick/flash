'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFlashcard, getCategories, createCategory } from '../../lib/api'

export default function CreatePage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    try {
      const cat = await createCategory(newCategoryName.trim())
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(cat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (e) {
      setError('Category name already exists or is invalid.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim() || !answer.trim()) { setError('Prompt and answer are required.'); return }
    setLoading(true)
    setError('')
    try {
      await createFlashcard({ prompt: prompt.trim(), answer: answer.trim(), categoryId: categoryId || null, audioFile })
      router.push('/')
      router.refresh()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '2rem' }}>Create Flashcard</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prompt / Question
            </label>
            <textarea className="input" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Enter the question or prompt..." style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Answer
            </label>
            <textarea className="input" rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Enter the answer..." style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ flex: 1 }}>
                <option value="">No category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <button type="button" className="btn-secondary" onClick={() => setShowNewCategory(!showNewCategory)}>
                + New
              </button>
            </div>
            {showNewCategory && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input className="input" type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Category name..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} />
                <button type="button" className="btn-primary" onClick={handleAddCategory}>Add</button>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audio File <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional, MP3)</span>
            </label>
            <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={e => setAudioFile(e.target.files[0] || null)}
              style={{ color: '#94a3b8', fontSize: '0.9rem', width: '100%' }} />
            {audioFile && <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>Selected: {audioFile.name}</p>}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Create Flashcard'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}