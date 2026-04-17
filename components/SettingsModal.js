'use client'

import { useSettings } from './SettingsProvider'

export default function SettingsModal({ isOpen, onClose }) {
  const { playMode, savePlayMode, loopCount, saveLoopCount } = useSettings()

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#1e293b', padding: '2rem', borderRadius: '12px',
        border: '1px solid rgba(139,92,246,0.2)', width: '90%', maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Study Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.75rem' }}>Play Mode</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => savePlayMode('manual')}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: playMode === 'manual' ? '#a78bfa' : 'rgba(139,92,246,0.2)',
                backgroundColor: playMode === 'manual' ? 'rgba(139,92,246,0.1)' : 'transparent',
                color: playMode === 'manual' ? '#e2e8f0' : '#64748b'
              }}>Manual</button>
            <button 
              onClick={() => savePlayMode('auto')}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: playMode === 'auto' ? '#a78bfa' : 'rgba(139,92,246,0.2)',
                backgroundColor: playMode === 'auto' ? 'rgba(139,92,246,0.1)' : 'transparent',
                color: playMode === 'auto' ? '#e2e8f0' : '#64748b'
              }}>Automatic</button>
          </div>
        </div>

        {playMode === 'auto' && (
          <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.5rem' }}>Card Loop Times</label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>How many times to loop the audio before auto-advancing.</p>
            <input 
              type="number"
              min="1"
              max="20"
              value={loopCount}
              onChange={(e) => saveLoopCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(15, 23, 42, 0.4)', color: '#e2e8f0' }}
            />
          </div>
        )}

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Done
        </button>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
