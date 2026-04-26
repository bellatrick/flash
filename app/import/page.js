'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { bulkCreateFlashcards, getCategories, createCategory } from '../../lib/api'

export default function ImportPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [jsonInput, setJsonInput] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setLoading(true)
    setError('')
    setSuccess('')

    let parsedData = []
    try {
      parsedData = JSON.parse(jsonInput)
      if (!Array.isArray(parsedData)) {
        throw new Error("Input must be a JSON array of objects.")
      }
    } catch (err) {
      setError('Invalid JSON format: ' + err.message)
      setLoading(false)
      return
    }

    const flashcardsToInsert = parsedData.map((item, index) => {
      const prompt = item.prompt || item.question || item.front
      const answer = item.answer || item.back
      if (!prompt || !answer) {
        throw new Error(`Item at index ${index} is missing a prompt/question or answer/back field.`)
      }
      return {
        prompt: prompt.toString().trim(),
        answer: answer.toString().trim(),
        category_id: categoryId || null
      }
    })

    if (flashcardsToInsert.length === 0) {
      setError('JSON array is empty.')
      setLoading(false)
      return
    }

    try {
      await bulkCreateFlashcards(flashcardsToInsert)
      setSuccess(`Successfully imported ${flashcardsToInsert.length} flashcards!`)
      setJsonInput('')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>Bulk Import Flashcards</h1>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Paste a JSON array containing your flashcards. Each object must have a `question` (or `prompt`) and `answer` field.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
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
              JSON Array
            </label>
            <textarea className="input" rows={12} value={jsonInput} onChange={e => setJsonInput(e.target.value)}
              placeholder="[\n  {\n    &quot;question&quot;: &quot;Bonjour&quot;,\n    &quot;answer&quot;: &quot;Hello&quot;\n  }\n]" 
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>

        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</p>}
        {success && <p style={{ color: '#4ade80', fontSize: '0.9rem' }}>{success}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Importing...' : 'Import JSON'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
