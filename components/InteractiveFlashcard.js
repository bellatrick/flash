'use client'

import { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSettings } from './SettingsProvider'

export default function InteractiveFlashcard({ card, nextCardId }) {
  const [revealed, setRevealed] = useState(false)
  const [playTimes, setPlayTimes] = useState(0)
  const { playMode, loopCount, isLoaded } = useSettings()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && playMode === 'auto' && !revealed) {
      const timer = setTimeout(() => {
        setRevealed(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, playMode, revealed])

  const handleAudioEnd = () => {
    if (playMode === 'auto') {
      const nextCount = playTimes + 1;
      setPlayTimes(nextCount);
      
      if (nextCount >= loopCount) {
        if (nextCardId) {
          router.push(`/cards/${nextCardId}`);
        }
      }
    }
  }

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true)
      // Reset play tracking in case of manual override tracking
      setPlayTimes(0)
    }
  }

  return (
    <div 
      className="card" 
      onClick={handleReveal}
      style={{ 
        padding: '3rem', 
        marginBottom: '1.5rem',
        cursor: revealed ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        borderColor: revealed ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.1)',
        backgroundColor: revealed ? 'rgba(15, 23, 42, 0.6)' : 'rgba(30, 41, 59, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Prompt</p>
        <p style={{ fontSize: '2rem', color: '#f8fafc', lineHeight: 1.4, fontWeight: 700 }}>{card.prompt}</p>
      </div>

      <div style={{ 
        height: '2px', 
        width: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', 
        margin: '2rem 0',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 0.5s'
      }} />

      {!revealed && (
         <div style={{
           position: 'absolute',
           bottom: '3rem',
           color: '#64748b',
           fontSize: '0.95rem',
           animation: 'pulse 2s infinite',
           fontWeight: 500
         }}>
           Click to reveal answer
         </div>
      )}

      {revealed && (
        <div style={{ 
          width: '100%',
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out forwards',
        }}>
          <div style={{ marginBottom: card.audio_url ? '2rem' : 0 }}>
            <p style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Answer</p>
            <p style={{ fontSize: '1.5rem', color: '#cbd5e1', lineHeight: 1.5 }}>{card.answer}</p>
          </div>

          {card.audio_url && (
            <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'left' }}>Audio</p>
              <AudioPlayer 
                src={card.audio_url} 
                autoPlay={true} 
                loop={playMode === 'manual' || playTimes < loopCount - 1}
                onExternalEnd={handleAudioEnd} 
              />
            </div>
          )}

          {nextCardId && (
            <div style={{ marginTop: '2.5rem' }}>
              <Link 
                href={`/cards/${nextCardId}`} 
                className="btn-primary" 
                style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 2rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                Next Card →
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  )
}
