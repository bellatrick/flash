'use client'
import { useState, useRef } from 'react'

export default function AudioRecorder({ onRecordingComplete, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  async function startRecording() {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        const extension = mimeType === 'audio/webm' ? 'webm' : 'm4a'
        const file = new File([blob], `recording-${Date.now()}.${extension}`, { type: mimeType })
        onRecordingComplete(file)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError(err.message === 'Permission denied' ? 'Microphone access denied' : err.message)
      setIsRecording(false)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  function clearRecording() {
    setRecordedBlob(null)
    audioChunksRef.current = []
  }

  return (
    <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {!isRecording && !recordedBlob && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            style={{
              padding: '0.5rem 1rem',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🎤 Record
          </button>
        )}

        {isRecording && (
          <>
            <div style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              Recording...
            </div>
            <button
              type="button"
              onClick={stopRecording}
              style={{
                padding: '0.5rem 1rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              ⏹ Stop
            </button>
          </>
        )}

        {recordedBlob && !isRecording && (
          <>
            <button
              type="button"
              onClick={clearRecording}
              style={{
                padding: '0.5rem 1rem',
                background: '#f87171',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              🗑 Clear
            </button>
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled}
              style={{
                padding: '0.5rem 1rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              🎤 Record Again
            </button>
          </>
        )}
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0.5rem 0' }}>
          ⚠️ {error}
        </p>
      )}

      {recordedBlob && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ color: '#86efac', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
            ✅ Recording ready ({(recordedBlob.size / 1024).toFixed(1)} KB)
          </p>
          <audio
            src={URL.createObjectURL(recordedBlob)}
            controls
            style={{ width: '100%', height: '32px', borderRadius: '4px' }}
          />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
