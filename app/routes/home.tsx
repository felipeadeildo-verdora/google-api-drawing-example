import { AlertTriangle, Key } from 'lucide-react'
import { useEffect, useState } from 'react'
import AddressSearch from '../components/address-search'
import MapWithDrawing from '../components/map-with-drawing'
import PolygonManager from '../components/polygon-manager'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { GoogleMapsProvider } from '../lib/google-maps-provider'
import { PolygonProvider } from '../lib/polygon-context'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Google Maps Drawing Tool' },
    { name: 'description', content: 'Ferramenta para desenhar polígonos no mapa' },
  ]
}

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem('google-maps-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    } else {
      setShowApiKeyForm(true)
    }
  }, [])

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('google-maps-api-key', apiKeyInput.trim())
      setApiKey(apiKeyInput.trim())
      setShowApiKeyForm(false)
    }
  }

  const handlePlaceSelected = (place: any) => {
    setSelectedPlace(place)
  }

  const handleChangeApiKey = () => {
    setApiKeyInput(apiKey)
    setShowApiKeyForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Ferramenta de Desenho de Polígonos
          </h1>
          
          {/* API Key Configuration */}
          {showApiKeyForm ? (
            <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Configuração da API Key</h2>
              </div>
              
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Google Maps API Key necessária</p>
                    <p>Para usar esta ferramenta, você precisa:</p>
                    <ul className="mt-2 ml-4 list-disc space-y-1">
                      <li>Obter uma API Key do Google Cloud Console</li>
                      <li>Habilitar as APIs: Maps JavaScript API, Places API, Drawing API</li>
                      <li>Inserir a chave no campo abaixo</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Cole sua Google Maps API Key aqui"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveApiKey} className="flex-1">
                    Salvar e Continuar
                  </Button>
                  {apiKey && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApiKeyForm(false)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* API Key Status */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Key className="w-4 h-4" />
                  <span>API Key configurada</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeApiKey}
                  >
                    Alterar
                  </Button>
                </div>
              </div>
              
              {apiKey && (
                <GoogleMapsProvider apiKey={apiKey}>
                  <PolygonProvider>
                    <div className="mb-6 flex justify-center">
                      <AddressSearch onPlaceSelected={handlePlaceSelected} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <MapWithDrawing 
                          initialCenter={
                            selectedPlace?.geometry?.location 
                              ? {
                                  lat: selectedPlace.geometry.location.lat(),
                                  lng: selectedPlace.geometry.location.lng()
                                }
                              : undefined
                          }
                        />
                      </div>
                      
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md">
                          <PolygonManager />
                        </div>
                      </div>
                    </div>
                  </PolygonProvider>
                </GoogleMapsProvider>
              )}
            </>
          )}
        </div>
      </div>
  )
}
