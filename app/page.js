import Link from 'next/link'
import { getCategories, getFlashcards } from '../lib/api'
import CategoryCard from '../components/CategoryCard'
import CardItem from '../components/CardItem'

export const revalidate = 0

export default async function HomePage() {
  const [categories, cards] = await Promise.all([getCategories(), getFlashcards()])

  const categoryCardCounts = categories.map(cat => ({
    ...cat,
    count: cards.filter(c => c.category_id === cat.id).length,
  }))

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>
          Your Flashcards
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{cards.length} cards across {categories.length} categories</p>
      </div>

      {/* Categories Grid */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#a78bfa', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Categories
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {categoryCardCounts.map(cat => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

    </div>
  )
}