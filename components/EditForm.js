'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateFlashcard, createCategory } from '../lib/api'

export default function EditForm({ card, categories: initialCategories }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [prompt, setPrompt] = useState(card.prompt)
  const [answer, setAnswer] = useState(card.answer)
  const [categoryId, setCategoryId] = useState(card.category_id || '')
  const [audioFile, setAudioFile] = useState(null)
  const [removeAudio, setRemoveAudio] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    try {
      const cat = await createCategory(newCategoryName.trim())
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(cat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch {
      setError('Category name already exists or is invalid.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim() || !answer.trim()) { setError('Prompt and answer are required.'); return }
    setLoading(true)
    setError('')
    try {
      await updateFlashcard(card.id, {
        prompt: prompt.trim(),
        answer: answer.trim(),
        categoryId: categoryId || null,
        audioFile: removeAudio ? null : audioFile,
        removeAudio,
        existingAudioPath: card.audio_path,
      })
      router.push(`/cards/${card.id}`)
      router.refresh()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt</label>
          <textarea className="input" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer</label>
          <textarea className="input" rows={4} value={answer} onChange={e => setAnswer(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ flex: 1 }}>
              <option value="">No category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <button type="button" className="btn-secondary" onClick={() => setShowNewCategory(!showNewCategory)}>+ New</button>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audio</label>
          {card.audio_url && !removeAudio ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>🔊 Current audio file</span>
              <button type="button" onClick={() => setRemoveAudio(true)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
            </div>
          ) : null}
          {removeAudio && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Audio will be removed on save.</p>}
          <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={e => { setAudioFile(e.target.files[0] || null); setRemoveAudio(false) }}
            style={{ color: '#94a3b8', fontSize: '0.9rem', width: '100%' }} />
          {audioFile && <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>New file: {audioFile.name}</p>}
        </div>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}