'use client'

import Link from 'next/link'

export default function FlashcardCard({ card, listContext }) {
  const query = listContext ? `?list=${encodeURIComponent(listContext)}` : '';
  return (
    <Link href={`/cards/${card.id}${query}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
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
          <span
            style={{
              marginTop: '0.5rem',
              display: 'inline-block',
              color: '#a78bfa',
              fontSize: '0.8rem',
            }}
          >
            🔊 Audio
          </span>
        )}
      </div>
    </Link>
  )
}
