'use client'

import Link from 'next/link'

export default function CategoryCard({ category }) {
  return (
    <Link href={`/categories/${category.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
      >
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(139,92,246,0.15)', 
          color: '#a78bfa', 
          border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1.25rem', 
          fontWeight: 700, 
          marginBottom: '1rem' 
        }}>
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
          {category.name}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {category.count} card{category.count !== 1 ? 's' : ''}
        </div>
      </div>
    </Link>
  )
}
