'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCategories,
  getAllSubCategories,
  createSubCategory,
  deleteSubCategory,
  moveAllFlashcards,
  deleteAllFlashcardsInCategory,
  getFlashcards,
  convertCategoryToSubcategory
} from '../lib/api'

export default function CategoryManager() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)

  // Sub-category input states keyed by category ID
  const [newSubNames, setNewSubNames] = useState({})
  const [showSubInputs, setShowSubInputs] = useState({})

  // Move Modal State
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveSource, setMoveSource] = useState({ categoryId: '', subcategoryId: '', name: '' })
  const [moveTarget, setMoveTarget] = useState({ categoryId: '', subcategoryId: '' })

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ categoryId: '', subcategoryId: '', name: '', scope: 'root' }) // scope: 'root', 'all', 'sub'

  // Convert Category to Sub-category Modal State
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertSource, setConvertSource] = useState({ id: '', name: '' })
  const [convertTargetId, setConvertTargetId] = useState('')

  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      refreshData()
    }
  }, [isOpen])

  async function refreshData() {
    setLoading(true)
    try {
      const [cats, subs, cards] = await Promise.all([
        getCategories(),
        getAllSubCategories(),
        getFlashcards()
      ])
      setCategories(cats)
      setSubCategories(subs)
      setFlashcards(cards)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Count cards in a category/sub-category
  function getCardCount(catId, subCatId = null, scope = 'root') {
    if (scope === 'all') {
      return flashcards.filter(c => c.category_id === catId).length
    }
    if (subCatId) {
      return flashcards.filter(c => c.subcategory_id === subCatId).length
    }
    // root: category but no subcategory
    return flashcards.filter(c => c.category_id === catId && !c.subcategory_id).length
  }

  async function handleAddSubCategory(categoryId) {
    const name = newSubNames[categoryId]?.trim()
    if (!name) return
    try {
      await createSubCategory(categoryId, name)
      setNewSubNames(prev => ({ ...prev, [categoryId]: '' }))
      setShowSubInputs(prev => ({ ...prev, [categoryId]: false }))
      await refreshData()
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error creating sub-category')
    }
  }

  async function handleDeleteSubCat(subCatId) {
    if (!confirm('Are you sure you want to delete this sub-category? The questions in it will be set to "no sub-category" (still kept in the parent category).')) return
    try {
      await deleteSubCategory(subCatId)
      await refreshData()
      router.refresh()
    } catch (err) {
      alert(err.message || 'Error deleting sub-category')
    }
  }

  async function handleMoveSubmit() {
    if (!moveTarget.categoryId) {
      setError('Please select a destination category')
      return
    }
    setActionLoading(true)
    setError('')
    try {
      await moveAllFlashcards({
        fromCategoryId: moveSource.categoryId,
        fromSubcategoryId: moveSource.subcategoryId || null,
        toCategoryId: moveTarget.categoryId,
        toSubcategoryId: moveTarget.subcategoryId || null
      })
      setShowMoveModal(false)
      await refreshData()
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error moving questions')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteSubmit() {
    setActionLoading(true)
    setError('')
    try {
      await deleteAllFlashcardsInCategory({
        categoryId: deleteTarget.categoryId,
        subcategoryId: deleteTarget.subcategoryId || (deleteTarget.scope === 'all' ? '__all__' : null)
      })
      setShowDeleteModal(false)
      await refreshData()
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error deleting questions')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConvertSubmit() {
    if (!convertTargetId) {
      setError('Please select a target category')
      return
    }
    setActionLoading(true)
    setError('')
    try {
      await convertCategoryToSubcategory(convertSource.id, convertTargetId)
      setShowConvertModal(false)
      await refreshData()
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error converting category')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          color: '#e2e8f0',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚙️ Manage Categories &amp; Sub-categories
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="card"
          style={{
            marginTop: '0.75rem',
            padding: '1.5rem',
            background: 'var(--navy-card)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>Loading categories data...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {categories.map(cat => {
                const subs = subCategories.filter(s => s.category_id === cat.id)
                const rootCount = getCardCount(cat.id, null, 'root')
                const allCount = getCardCount(cat.id, null, 'all')

                return (
                  <div
                    key={cat.id}
                    style={{
                      borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                      paddingBottom: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    {/* Category Header Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', display: 'inline-block', marginRight: '0.75rem' }}>
                          {cat.name}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          ({allCount} cards total &bull; {rootCount} at root)
                        </span>
                      </div>

                      {/* Root Category Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setMoveSource({ categoryId: cat.id, subcategoryId: '', name: `${cat.name} (root)` })
                            setMoveTarget({ categoryId: '', subcategoryId: '' })
                            setError('')
                            setShowMoveModal(true)
                          }}
                          disabled={rootCount === 0}
                        >
                          ↗ Move Root Cards
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: 'rgba(167, 139, 250, 0.4)', color: '#a78bfa' }}
                          onClick={() => {
                            setConvertSource({ id: cat.id, name: cat.name })
                            setConvertTargetId('')
                            setError('')
                            setShowConvertModal(true)
                          }}
                        >
                          📁 Convert to Sub-cat
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                          onClick={() => {
                            setDeleteTarget({ categoryId: cat.id, subcategoryId: '', name: `${cat.name} (root)`, scope: 'root' })
                            setError('')
                            setShowDeleteModal(true)
                          }}
                          disabled={rootCount === 0}
                        >
                          🗑 Delete Root Cards
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)' }}
                          onClick={() => {
                            setDeleteTarget({ categoryId: cat.id, subcategoryId: '', name: `${cat.name} (All Cards & Sub-categories)`, scope: 'all' })
                            setError('')
                            setShowDeleteModal(true)
                          }}
                          disabled={allCount === 0}
                        >
                          🗑 Wipe Category
                        </button>
                      </div>
                    </div>

                    {/* Subcategories Section */}
                    <div style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(139, 92, 246, 0.2)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sub-categories</span>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                          onClick={() => setShowSubInputs(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        >
                          {showSubInputs[cat.id] ? 'Cancel' : '+ Add Sub-category'}
                        </button>
                      </div>

                      {showSubInputs[cat.id] && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', maxWidth: '350px' }}>
                          <input
                            className="input"
                            type="text"
                            placeholder="New sub-category name..."
                            value={newSubNames[cat.id] || ''}
                            onChange={e => setNewSubNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleAddSubCategory(cat.id)}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          />
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleAddSubCategory(cat.id)}
                          >
                            Add
                          </button>
                        </div>
                      )}

                      {subs.length === 0 ? (
                        <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>No sub-categories</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {subs.map(sub => {
                            const subCount = getCardCount(cat.id, sub.id, 'sub')
                            return (
                              <div
                                key={sub.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(30, 41, 59, 0.3)',
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(139, 92, 246, 0.05)'
                                }}
                              >
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                  {sub.name} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({subCount} cards)</span>
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => {
                                      setMoveSource({ categoryId: cat.id, subcategoryId: sub.id, name: `${cat.name} > ${sub.name}` })
                                      setMoveTarget({ categoryId: '', subcategoryId: '' })
                                      setError('')
                                      setShowMoveModal(true)
                                    }}
                                    disabled={subCount === 0}
                                  >
                                    ↗ Move
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                                    onClick={() => {
                                      setDeleteTarget({ categoryId: cat.id, subcategoryId: sub.id, name: `${cat.name} > ${sub.name}`, scope: 'sub' })
                                      setError('')
                                      setShowDeleteModal(true)
                                    }}
                                    disabled={subCount === 0}
                                  >
                                    🗑 Delete Cards
                                  </button>
                                  <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem' }}
                                    onClick={() => handleDeleteSubCat(sub.id)}
                                    title="Delete sub-category tag"
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Move All Modal */}
      {showMoveModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={e => e.target === e.currentTarget && setShowMoveModal(false)}
        >
          <div
            style={{
              background: '#1a2744', border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px',
            }}
          >
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Move all questions
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Source: <strong style={{ color: '#a78bfa' }}>{moveSource.name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Target Category
                </label>
                <select
                  className="input"
                  value={moveTarget.categoryId}
                  onChange={e => setMoveTarget({ categoryId: e.target.value, subcategoryId: '' })}
                >
                  <option value="">Select category…</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {moveTarget.categoryId && subCategories.filter(s => s.category_id === moveTarget.categoryId).length > 0 && (
                <div>
                  <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Target Sub-category <span style={{ color: '#475569', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <select
                    className="input"
                    value={moveTarget.subcategoryId}
                    onChange={e => setMoveTarget(prev => ({ ...prev, subcategoryId: e.target.value }))}
                  >
                    <option value="">No sub-category (root)</option>
                    {subCategories.filter(s => s.category_id === moveTarget.categoryId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                onClick={handleMoveSubmit}
                disabled={actionLoading || !moveTarget.categoryId}
                className="btn-primary"
                style={{ flex: 1, opacity: (actionLoading || !moveTarget.categoryId) ? 0.6 : 1 }}
              >
                {actionLoading ? 'Moving…' : 'Move Questions'}
              </button>
              <button
                onClick={() => setShowMoveModal(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirm Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div
            style={{
              background: '#1a2744', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            }}
          >
            <h3 style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Delete all questions?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
              You are about to delete all questions in: <strong style={{ color: '#e2e8f0' }}>{deleteTarget.name}</strong>.
            </p>
            <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              ⚠️ WARNING: This action is permanent and cannot be undone.
            </p>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
                style={{
                  flex: 1, background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '8px', padding: '0.6rem 1rem',
                  fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? 'Deleting…' : 'Yes, Delete All'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Sub-category Modal */}
      {showConvertModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={e => e.target === e.currentTarget && setShowConvertModal(false)}
        >
          <div
            style={{
              background: '#1a2744', border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px',
            }}
          >
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Convert Category to Sub-category
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              This will convert category <strong style={{ color: '#a78bfa' }}>{convertSource.name}</strong> into a sub-category, and move all its questions there.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Target Parent Category
                </label>
                <select
                  className="input"
                  value={convertTargetId}
                  onChange={e => setConvertTargetId(e.target.value)}
                >
                  <option value="">Select parent category…</option>
                  {categories
                    .filter(c => c.id !== convertSource.id) // Cannot convert into itself
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                onClick={handleConvertSubmit}
                disabled={actionLoading || !convertTargetId}
                className="btn-primary"
                style={{ flex: 1, opacity: (actionLoading || !convertTargetId) ? 0.6 : 1 }}
              >
                {actionLoading ? 'Converting…' : 'Convert Category'}
              </button>
              <button
                onClick={() => setShowConvertModal(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
