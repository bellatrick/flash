'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { getCategories, getSubCategories, getFlashcardsBySubCategory } from '../../../../lib/api'
import SelectionToolbar from '../../../../components/SelectionToolbar'

export default function SubCategoryPage({ params }) {
  const { slug, subslug } = use(params)
  const decodedSlug = decodeURIComponent(slug)
  const decodedSubSlug = decodeURIComponent(subslug)

  const [category, setCategory] = useState(null)
  const [subCategory, setSubCategory] = useState(null)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  // Selection states
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    loadSubCategoryData()
  }, [slug, subslug])

  async function loadSubCategoryData() {
    setLoading(true)
    try {
      const allCategories = await getCategories()
      const matchingCat = allCategories.filter(c =>
        c.slug === slug ||
        c.slug === decodedSlug ||
        encodeURIComponent(c.slug) === slug ||
        encodeURIComponent(c.slug) === decodedSlug
      )

      if (matchingCat.length > 0) {
        const cat = matchingCat[0]
        setCategory(cat)

        // Find the specific sub-category
        const subs = await getSubCategories(cat.id)
        const matchingSub = subs.filter(s =>
          s.slug === subslug ||
          s.slug === decodedSubSlug ||
          encodeURIComponent(s.slug) === subslug ||
          encodeURIComponent(s.slug) === decodedSubSlug
        )

        if (matchingSub.length > 0) {
          const sub = matchingSub[0]
          setSubCategory(sub)

          // Fetch cards in this subcategory
          const subCards = await getFlashcardsBySubCategory(sub.id)
          setCards(subCards)
        } else {
          setSubCategory(null)
        }
      } else {
        setCategory(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading sub-category...</p>
  }

  if (!category || !subCategory) {
    return <p style={{ color: '#64748b', padding: '2rem' }}>Sub-category or Category not found.</p>
  }

  function toggleSelectCard(cardId) {
    setSelectedIds(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  function handleActionDone() {
    setIsSelectMode(false)
    setSelectedIds([])
    loadSubCategoryData()
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          <Link href="/" className="back-link" style={{ fontSize: '0.9rem' }}>Categories</Link>
          <span>/</span>
          <Link href={`/categories/${category.slug}`} style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            {category.name}
          </Link>
          <span>/</span>
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{subCategory.name}</span>
        </div>

        {cards.length > 0 && (
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode)
              setSelectedIds([])
            }}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              borderColor: isSelectMode ? '#a78bfa' : 'rgba(139,92,246,0.3)',
              background: isSelectMode ? 'rgba(139,92,246,0.1)' : 'transparent',
              color: isSelectMode ? '#a78bfa' : '#94a3b8'
            }}
          >
            {isSelectMode ? 'Cancel Selection' : 'Select Cards'}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📁</span> {subCategory.name}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {cards.length} card{cards.length !== 1 ? 's' : ''} in this sub-category
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
          <p style={{ marginBottom: '1rem' }}>No cards in this sub-category yet.</p>
          <Link href="/create" className="btn-primary" style={{ textDecoration: 'none' }}>Add a card</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cards.map(card => {
            const isSelected = selectedIds.includes(card.id)
            const query = `?list=${encodeURIComponent(slug)}`

            if (isSelectMode) {
              return (
                <div
                  key={card.id}
                  onClick={() => toggleSelectCard(card.id)}
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(139,92,246,0.2)',
                    background: isSelected ? 'rgba(139,92,246,0.08)' : 'var(--navy-card)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Controlled by outer click
                    style={{
                      accentColor: '#8b5cf6',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 500 }}>
                      {card.prompt}
                    </p>
                    {card.audio_url && (
                      <span style={{ marginTop: '0.4rem', display: 'inline-block', color: '#a78bfa', fontSize: '0.8rem' }}>
                        🔊 Audio
                      </span>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <Link key={card.id} href={`/cards/${card.id}${query}`} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
                >
                  <p style={{ color: '#e2e8f0', fontWeight: 500, marginBottom: '0.3rem' }}>
                    {card.prompt}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    Click to review...
                  </p>
                  {card.audio_url && (
                    <span style={{ marginTop: '0.5rem', display: 'inline-block', color: '#a78bfa', fontSize: '0.8rem' }}>
                      🔊 Audio
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Floating actions toolbar */}
      <SelectionToolbar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onDone={handleActionDone}
      />
    </div>
  )
}
