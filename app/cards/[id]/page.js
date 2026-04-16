import Link from 'next/link'
import { getFlashcard, getFlashcardsByCategory } from '../../../lib/api'
import InteractiveFlashcard from '../../../components/InteractiveFlashcard'
import DeleteButton from '../../../components/DeleteButton'

export const revalidate = 0

export default async function CardPage({ params }) {
  const { id } = await params;
  const card = await getFlashcard(id)

  let nextCardId = null;
  if (card.category_id) {
    const categoryCards = await getFlashcardsByCategory(card.category_id);
    const currentIndex = categoryCards.findIndex(c => c.id === card.id);
    if (currentIndex !== -1 && currentIndex < categoryCards.length - 1) {
      nextCardId = categoryCards[currentIndex + 1].id;
    } else if (categoryCards.length > 1) {
      nextCardId = categoryCards[0].id;
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back</Link>
        {card.categories && (
          <>
            <span style={{ color: '#334155' }}>/</span>
            <Link href={`/categories/${card.categories.slug}`} style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>{card.categories.name}</Link>
          </>
        )}
      </div>

      <InteractiveFlashcard card={card} nextCardId={nextCardId} />

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href={`/cards/${card.id}/edit`} className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>
          Edit Card
        </Link>
        <DeleteButton id={card.id} audioPath={card.audio_path} />
      </div>
    </div>
  )
}