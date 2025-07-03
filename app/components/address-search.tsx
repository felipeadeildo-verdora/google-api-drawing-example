import { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AddressSearchProps {
  onPlaceSelected: (place: any) => void
}

export default function AddressSearch({ onPlaceSelected }: AddressSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['geocode']
      }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place) {
        onPlaceSelected(place)
        setInputValue(place.formatted_address || '')
      }
    })

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [onPlaceSelected])

  const handleClearSearch = () => {
    setInputValue('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex gap-2 w-full max-w-md">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Digite um endereço..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button 
        onClick={handleClearSearch}
        variant="outline"
        size="sm"
      >
        Limpar
      </Button>
    </div>
  )
}