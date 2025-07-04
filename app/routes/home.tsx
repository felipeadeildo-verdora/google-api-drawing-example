import { MapWithDrawing } from '../components/map-with-drawing'
import { PolygonManager } from '../components/polygon-manager'
import { GoogleMapsProvider } from '../contexts/google-maps'
import { PolygonProvider } from '../contexts/polygon'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Google Maps Drawing Tool' },
    {
      name: 'description',
      content: 'POC POC - who is?',
    },
  ]
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Ferramenta de Desenho de Polígonos
        </h1>
        <GoogleMapsProvider>
          <PolygonProvider>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MapWithDrawing />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md">
                  <PolygonManager />
                </div>
              </div>
            </div>
          </PolygonProvider>
        </GoogleMapsProvider>
      </div>
    </div>
  )
}
