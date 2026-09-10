'use client'

import { useEffect } from 'react'

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })
          
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] New version available; refresh to update.')
                  } else {
                    console.log('[PWA] Content cached for offline use.')
                  }
                }
              })
            }
          })
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error)
        }
      }

      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
        return () => window.removeEventListener('load', registerSW)
      }
    }
  }, [])

  return null
}
