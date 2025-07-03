import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

interface GoogleMapsContextType {
  isLoaded: boolean
  loadError: Error | undefined
}

const GoogleMapsContext = createContext<GoogleMapsContextType | null>(null)

interface GoogleMapsProviderProps {
  children: ReactNode
  apiKey: string
}

export function GoogleMapsProvider({ children, apiKey }: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['drawing', 'places']
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