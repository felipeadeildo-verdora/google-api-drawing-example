import { useJsApiLoader } from '@react-google-maps/api'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

interface GoogleMapsContextType {
  isLoaded: boolean
  loadError: Error | undefined
}

const GoogleMapsContext = createContext<GoogleMapsContextType | null>(null)

interface GoogleMapsProviderProps {
  children: ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['drawing', 'places'],
  })

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext)
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider')
  }
  return context
}
