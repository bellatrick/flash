import './globals.css'
import Link from 'next/link'
import { SettingsProvider } from '../components/SettingsProvider'
import NavbarSettings from '../components/NavbarSettings'

export const metadata = {
  title: 'Flashcards',
  description: 'Personal flashcard study app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh' }}>
        <SettingsProvider>
          <nav style={{
            backgroundColor: '#1e293b',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa', textDecoration: 'none' }}>
              Flashcards
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
              <Link href="/create" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                + New Card
              </Link>
              <NavbarSettings />
            </div>
          </nav>
          <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  )
}