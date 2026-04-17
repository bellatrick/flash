'use client'
import { useState, useRef } from 'react'

export default function AudioPlayer({ src, autoPlay = false, loop = false, onExternalEnd }) {
  const [playing, setPlaying] = useState(autoPlay)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  function handleEnded() { 
    if (onExternalEnd) onExternalEnd()
    
    if (loop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(e => console.error("Audio loop error", e))
      }
    } else {
      setPlaying(false); 
      setProgress(0) 
    }
  }

  function handleSeek(e) {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
    setProgress(ratio * 100)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} autoPlay={autoPlay} />
      <button onClick={toggle} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
        {playing ? '⏸' : '▶'}
      </button>
      <div style={{ flex: 1, height: '4px', background: 'rgba(139,92,246,0.2)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }} onClick={handleSeek}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#7c3aed', borderRadius: '2px', transition: 'width 0.1s linear' }} />
      </div>
    </div>
  )
}