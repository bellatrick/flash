'use client'
import { useState, useEffect } from 'react'
import { getCategories, getAllSubCategories, moveSelectedFlashcards, deleteSelectedFlashcards } from '../lib/api'

export default function SelectionToolbar({ selectedIds, onClear, onDone }) {
  const count = selectedIds.length

  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categories, setCategories] = useState([])
  const [allSubCats, setAllSubCats] = useState([])
  const [targetCategoryId, setTargetCategoryId] = useState('')
  const [targetSubcategoryId, setTargetSubcategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (showMoveModal) {
      Promise.all([getCategories(), getAllSubCategories()])
        .then(([cats, subs]) => { setCategories(cats); setAllSubCats(subs) })
    }
  }, [showMoveModal])

  const filteredSubCats = allSubCats.filter(s => s.category_id === targetCategoryId)

  async function handleMove() {
    if (!targetCategoryId) { setError('Please select a destination category.'); return }
    setLoading(true); setError('')
    try {
      await moveSelectedFlashcards({
        cardIds: selectedIds,
        toCategoryId: targetCategoryId,
        toSubcategoryId: targetSubcategoryId || null,
      })
      setShowMoveModal(false)
      onDone()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true); setError('')
    try {
      await deleteSelectedFlashcards(selectedIds)
      setShowDeleteConfirm(false)
      onDone()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  if (count === 0) return null

  return (
    <>
      {/* Floating toolbar */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#1e293b',
        border: '1px solid rgba(139,92,246,0.5)',
        borderRadius: '16px',
        padding: '0.75rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.2)',
        backdropFilter: 'blur(12px)',
        animation: 'slideUp 0.2s ease-out',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a78bfa', fontWeight: 700, fontSize: '0.8rem',
        }}>
          {count}
        </div>
        <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
          {count} selected
        </span>
        <div style={{ width: '1px', height: '20px', background: 'rgba(139,92,246,0.2)' }} />
        <button
          onClick={() => { setShowMoveModal(true); setTargetCategoryId(''); setTargetSubcategoryId(''); setError('') }}
          style={{
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)',
            color: '#a78bfa', borderRadius: '8px', padding: '0.4rem 0.9rem',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)' }}
        >
          ↗ Move
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', borderRadius: '8px', padding: '0.4rem 0.9rem',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
        >
          🗑 Delete
        </button>
        <button
          onClick={onClear}
          style={{
            background: 'none', border: 'none', color: '#475569',
            cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1,
            padding: '0.2rem', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569' }}
          title="Cancel selection"
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Move Modal */}
      {showMoveModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={e => e.target === e.currentTarget && setShowMoveModal(false)}>
          <div style={{
            background: '#1a2744', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px',
          }}>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Move {count} card{count !== 1 ? 's' : ''}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Select the destination category and optionally a sub-category.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Destination Category
                </label>
                <select
                  className="input"
                  value={targetCategoryId}
                  onChange={e => { setTargetCategoryId(e.target.value); setTargetSubcategoryId('') }}
                >
                  <option value="">Select category…</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {targetCategoryId && filteredSubCats.length > 0 && (
                <div>
                  <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Sub-category <span style={{ color: '#475569', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <select
                    className="input"
                    value={targetSubcategoryId}
                    onChange={e => setTargetSubcategoryId(e.target.value)}
                  >
                    <option value="">No sub-category</option>
                    {filteredSubCats.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                onClick={handleMove}
                disabled={loading || !targetCategoryId}
                className="btn-primary"
                style={{ flex: 1, opacity: (loading || !targetCategoryId) ? 0.6 : 1 }}
              >
                {loading ? 'Moving…' : `Move ${count} card${count !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setShowMoveModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div style={{
            background: '#1a2744', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
          }}>
            <h3 style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Delete {count} card{count !== 1 ? 's' : ''}?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This will permanently delete the selected {count} card{count !== 1 ? 's' : ''}. This cannot be undone.
            </p>
            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  flex: 1, background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '8px', padding: '0.6rem 1rem',
                  fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
