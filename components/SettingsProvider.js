'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [playMode, setPlayMode] = useState('manual')
  const [loopCount, setLoopCount] = useState(2)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem('flash_playMode')
    const savedLoop = localStorage.getItem('flash_loopCount')
    if (savedMode) setPlayMode(savedMode)
    if (savedLoop) setLoopCount(Number(savedLoop))
    setIsLoaded(true)
  }, [])

  const savePlayMode = (mode) => {
    setPlayMode(mode)
    localStorage.setItem('flash_playMode', mode)
  }

  const saveLoopCount = (count) => {
    setLoopCount(count)
    localStorage.setItem('flash_loopCount', count.toString())
  }

  return (
    <SettingsContext.Provider value={{ playMode, savePlayMode, loopCount, saveLoopCount, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
