'use client'

import Link from 'next/link'

export default function CardItem({ card }) {
  return (
    <Link href={`/cards/${card.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: '#e2e8f0',
              fontWeight: 500,
              marginBottom: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.prompt}
          </p>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.answer}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', flexShrink: 0 }}>
          {card.audio_url && <span style={{ color: '#a78bfa', fontSize: '0.8rem' }}>🔊</span>}
          {card.categories && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                background: 'rgba(139,92,246,0.15)',
                color: '#a78bfa',
                borderRadius: '20px',
                border: '1px solid rgba(139,92,246,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              {card.categories.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
