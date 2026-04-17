'use client'

import { useState, useEffect } from 'react'
import SettingsModal from './SettingsModal'

export default function NavbarSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        title="Study Settings"
      >
        ⚙️
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
