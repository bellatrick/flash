import Link from 'next/link'
import { getCategories, getFlashcards } from '../lib/api'
import CategoryCard from '../components/CategoryCard'
import CardItem from '../components/CardItem'

export const revalidate = 0

export default async function HomePage() {
  const [categories, cards] = await Promise.all([getCategories(), getFlashcards()])

  const categoryCardCountsMap = new Map();
  categories.forEach(cat => {
    if (!categoryCardCountsMap.has(cat.slug)) {
      categoryCardCountsMap.set(cat.slug, { ...cat, count: 0 });
    }
    const slugCat = categoryCardCountsMap.get(cat.slug);
    slugCat.count += cards.filter(c => c.category_id === cat.id).length;
  });
  const categoryCardCounts = Array.from(categoryCardCountsMap.values());

  const uniqueWords = new Set();
  cards.forEach(card => {
    let text = `${card.answer}`.toLowerCase();
    
    // Normalize French elisions into their root words so "j'ai" becomes "je" and "ai"
    text = text.replace(/\bj'/g, 'je ')
               .replace(/\bc'/g, 'ce ')
               .replace(/\bm'/g, 'me ')
               .replace(/\bt'/g, 'te ')
               .replace(/\bs'/g, 'se ')
               .replace(/\bn'/g, 'ne ')
               .replace(/\bl'/g, 'le ') 
               .replace(/\bd'/g, 'de ')
               .replace(/\bqu'/g, 'que ')
               .replace(/\bpuisqu'/g, 'puisque ')
               .replace(/\blorsqu'/g, 'lorsque ')
               .replace(/\bquoiqu'/g, 'quoique ');

    const words = text.match(/\p{L}+/gu) || [];
    
    // Only count words longer than 1 letter, except 'a', 'y', 'ô' which are valid French words
    words.forEach(w => {
      if (w.length > 1 || w === 'a' || w === 'y' || w === 'ô' || w === 'o') {
        uniqueWords.add(w);
      }
    });
  });
  const totalUniqueWords = uniqueWords.size;

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>
          Your Flashcards
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {cards.length} cards across {categories.length} categories &nbsp;•&nbsp; <span style={{ color: '#a78bfa', fontWeight: 600 }}>{totalUniqueWords} unique words</span>
        </p>
      </div>

      {/* Categories Grid */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#a78bfa', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Categories
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        <CategoryCard key="all" category={{ id: 'all', slug: 'all', name: 'All Cards', count: cards.length }} />
        {categoryCardCounts.map(cat => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

    </div>
  )
}