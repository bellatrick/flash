import Link from 'next/link'
import { getCategories, getFlashcardsByCategory, getFlashcards } from '../../../lib/api'
import FlashcardCard from '../../../components/FlashcardCard'

export const revalidate = 0

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  let category, cards;

  if (slug === 'all') {
    category = { id: 'all', name: 'All Cards', slug: 'all' };
    cards = await getFlashcards();
  } else {
    const categories = await getCategories()
    const decodedSlug = decodeURIComponent(slug)
    const matchingCategories = categories.filter(c => 
      c.slug === slug || 
      c.slug === decodedSlug || 
      encodeURIComponent(c.slug) === slug ||
      encodeURIComponent(c.slug) === decodedSlug
    )
    if (matchingCategories.length === 0) return <p style={{ color: '#64748b' }}>Category not found.</p>
    
    category = matchingCategories[0] // taking the first one for the title
    
    const allCards = await getFlashcards()
    const matchingIds = matchingCategories.map(c => c.id)
    cards = allCards.filter(c => matchingIds.includes(c.category_id))
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← All Categories</Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>{category.name}</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
      </div>

      {cards.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
          <p style={{ marginBottom: '1rem' }}>No cards in this category yet.</p>
          <Link href="/create" className="btn-primary" style={{ textDecoration: 'none' }}>Add a card</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cards.map(card => (
            <FlashcardCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}