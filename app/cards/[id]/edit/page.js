import { getFlashcard, getCategories } from '../../../../lib/api'
import EditForm from '../../../../components/EditForm'

export const revalidate = 0

export default async function EditPage({ params }) {
  const { id } = await params;
  const [card, categories] = await Promise.all([getFlashcard(id), getCategories()])
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '2rem' }}>Edit Flashcard</h1>
      <EditForm card={card} categories={categories} />
    </div>
  )
}