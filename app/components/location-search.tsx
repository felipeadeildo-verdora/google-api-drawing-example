import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useGoogleMaps } from '../lib/google-maps-provider'

interface LocationResult {
  place_id: string
  description: string
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const { isLoaded } = useGoogleMaps()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (isLoaded && window.google) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService())
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div')
      setPlacesService(new window.google.maps.places.PlacesService(dummyDiv))
    }
  }, [isLoaded])

  const searchPlaces = useCallback(
    async (searchQuery: string) => {
      if (!autocompleteService || !searchQuery.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      
      try {
        autocompleteService.getPlacePredictions(
          {
            input: searchQuery,
            types: ['establishment', 'geocode'],
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setResults(predictions.map(prediction => ({
                place_id: prediction.place_id,
                description: prediction.description
              })))
            } else {
              setResults([])
            }
            setIsSearching(false)
          }
        )
      } catch (error) {
        console.error('Error searching places:', error)
        setResults([])
        setIsSearching(false)
      }
    },
    [autocompleteService]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(true)
    
    if (value.length > 2) {
      searchPlaces(value)
    } else {
      setResults([])
    }
  }

  const handleResultClick = (result: LocationResult) => {
    if (!placesService) return

    placesService.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry', 'formatted_address']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || result.description
          
          onLocationSelect({ lat, lng, address })
          setQuery(address)
          setShowResults(false)
          setResults([])
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Pesquisar localização..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setShowResults(false)
            setQuery('')
            setResults([])
          }}
          disabled={!query}
        >
          Limpar
        </Button>
      </div>

      {showResults && (results.length > 0 || isSearching) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-sm text-gray-500">Pesquisando...</div>
          ) : (
            results.map((result) => (
              <button
                key={result.place_id}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                onClick={() => handleResultClick(result)}
              >
                {result.description}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}