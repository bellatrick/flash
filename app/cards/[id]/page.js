import Link from 'next/link'
import { getFlashcard, getFlashcardsByCategory, getFlashcards, getCategories } from '../../../lib/api'
import InteractiveFlashcard from '../../../components/InteractiveFlashcard'
import DeleteButton from '../../../components/DeleteButton'

export const revalidate = 0

export default async function CardPage({ params, searchParams }) {
  const { id } = await params;
  const { list } = await searchParams;
  const card = await getFlashcard(id)

  let nextCardUrl = null;
  let playlist = [];

  // Determine study playlist based on URL Context dynamically
  if (list && list === 'all') {
    playlist = await getFlashcards();
  } else if (list) {
    const categories = await getCategories();
    const decodedList = decodeURIComponent(list);
    const matchingCategories = categories.filter(c => 
      c.slug === list || c.slug === decodedList || encodeURIComponent(c.slug) === list || encodeURIComponent(c.slug) === decodedList
    );
    if (matchingCategories.length > 0) {
      const allCards = await getFlashcards();
      const matchingIds = matchingCategories.map(c => c.id);
      playlist = allCards.filter(c => matchingIds.includes(c.category_id));
    }
  } else if (card.category_id) {
    playlist = await getFlashcardsByCategory(card.category_id);
  }

  // Iterate the loop cleanly through the localized playlist!
  if (playlist.length > 1) {
    const currentIndex = playlist.findIndex(c => c.id === card.id);
    let nextId = null;
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      nextId = playlist[currentIndex + 1].id;
    } else if (currentIndex !== -1) {
      nextId = playlist[0].id; // Graceful Infinite Loop wraparound
    }
    
    if (nextId) {
      nextCardUrl = `/cards/${nextId}${list ? `?list=${encodeURIComponent(list)}` : ''}`;
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href={list ? (list === 'all' ? '/categories/all' : `/categories/${list}`) : (card.categories ? `/categories/${card.categories.slug}` : '/')} className="back-link">
          <span>←</span> Back to {list === 'all' ? 'All Cards' : (card.categories ? card.categories.name : 'Home')}
        </Link>
      </div>

      <InteractiveFlashcard card={card} nextCardUrl={nextCardUrl} />

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href={`/cards/${card.id}/edit`} className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>
          Edit Card
        </Link>
        <DeleteButton id={card.id} audioPath={card.audio_path} />
      </div>
    </div>
  )
}