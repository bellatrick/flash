'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteFlashcard } from '../lib/api'

export default function DeleteButton({ id, audioPath }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteFlashcard(id, audioPath)
    router.push('/')
    router.refresh()
  }

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleDelete} disabled={loading} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        <button onClick={() => setConfirm(false)} className="btn-secondary">Cancel</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
      Delete
    </button>
  )
}