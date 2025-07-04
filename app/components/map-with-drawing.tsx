import { GoogleMap, InfoWindow, Polygon } from '@react-google-maps/api'
import { useCallback, useRef, useState } from 'react'
import { useGoogleMaps } from '../contexts/google-maps'
import {
  calculatePolygonArea,
  formatArea,
  usePolygon,
} from '../contexts/polygon'
import { LocationSearch } from './location-search'
import { Button } from './ui/button'

const containerStyle = { width: '100%', height: '600px' }
const center = { lat: -23.55052, lng: -46.633308 }

interface MapWithDrawingProps {
  initialCenter?: { lat: number; lng: number }
}

// Função para centralizar mapa em um polígono específico
let centerOnPolygon: (polygonId: string) => void

// Exportar função para uso externo
export const useCenterOnPolygon = () => centerOnPolygon

export function MapWithDrawing({ initialCenter }: MapWithDrawingProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  const { state, dispatch } = usePolygon()
  const [mapCenter, setMapCenter] = useState(initialCenter || center)
  const [mapZoom, setMapZoom] = useState(16)
  const drawingManagerRef = useRef<any>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const onMapLoad = useCallback(
    (map: any) => {
      mapRef.current = map
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          editable: true,
          draggable: false,
          fillColor: '#FF0000',
          fillOpacity: 0.3,
          strokeColor: '#FF0000',
          strokeOpacity: 1,
          strokeWeight: 2,
        },
      })

      drawingManager.setMap(map)
      drawingManager.setDrawingMode(null)
      drawingManagerRef.current = drawingManager

      window.google.maps.event.addListener(
        drawingManager,
        'polygoncomplete',
        (polygon: any) => {
          const path = polygon.getPath().getArray()
          const coords = path.map((pt: any) => ({
            lat: pt.lat(),
            lng: pt.lng(),
          }))

          const area = calculatePolygonArea(coords)
          const newPolygon = {
            id: crypto.randomUUID(),
            coordinates: coords,
            label: `Área ${state.polygons.length + 1}`,
            color: '#FF0000',
            createdAt: new Date(),
            area: area,
          }

          dispatch({ type: 'ADD_POLYGON', payload: newPolygon })
          polygon.setMap(null)
        }
      )
    },
    [state.polygons.length, dispatch]
  )

  const toggleDrawingMode = () => {
    if (drawingManagerRef.current) {
      const currentMode = drawingManagerRef.current.getDrawingMode()
      const newMode =
        currentMode === window.google.maps.drawing.OverlayType.POLYGON
          ? null
          : window.google.maps.drawing.OverlayType.POLYGON

      drawingManagerRef.current.setDrawingMode(newMode)
      dispatch({ type: 'TOGGLE_DRAWING_MODE' })
    }
  }

  const handlePolygonClick = (polygonId: string) => {
    dispatch({ type: 'SELECT_POLYGON', payload: polygonId })

    // Encontrar o polígono selecionado
    const selectedPolygon = state.polygons.find((p) => p.id === polygonId)
    if (selectedPolygon && selectedPolygon.coordinates.length > 0) {
      const center = getPolygonCenter(selectedPolygon.coordinates)
      const optimalZoom = calculateOptimalZoom(selectedPolygon.coordinates)
      setMapCenter(center)
      setMapZoom(optimalZoom)

      if (mapRef.current) {
        mapRef.current.panTo(center)
        mapRef.current.setZoom(optimalZoom)
      }
    }
  }

  const getPolygonCenter = (coordinates: { lat: number; lng: number }[]) => {
    if (coordinates.length === 0) return { lat: 0, lng: 0 }

    const totalLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0)
    const totalLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0)

    return {
      lat: totalLat / coordinates.length,
      lng: totalLng / coordinates.length,
    }
  }

  const calculateBounds = (coordinates: { lat: number; lng: number }[]) => {
    if (coordinates.length === 0) return null

    const lats = coordinates.map((coord) => coord.lat)
    const lngs = coordinates.map((coord) => coord.lng)

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    }
  }

  const calculateOptimalZoom = (
    coordinates: { lat: number; lng: number }[]
  ) => {
    const bounds = calculateBounds(coordinates)
    if (!bounds) return 16

    const latDiff = bounds.north - bounds.south
    const lngDiff = bounds.east - bounds.west
    const maxDiff = Math.max(latDiff, lngDiff)

    // Adicionando margem de 30% ao tamanho do polígono para dar "respiro"
    const adjustedDiff = maxDiff * 1.3

    // Calculando zoom baseado na diferença ajustada
    let zoom = 16
    if (adjustedDiff > 0.01) zoom = 12 // Área muito grande
    else if (adjustedDiff > 0.005) zoom = 14 // Área grande
    else if (adjustedDiff > 0.002) zoom = 16 // Área média
    else if (adjustedDiff > 0.001) zoom = 17 // Área pequena
    else if (adjustedDiff > 0.0005) zoom = 18 // Área muito pequena
    else zoom = 19 // Área minúscula

    // Garantindo que o zoom nunca seja menor que 10 nem maior que 20
    return Math.max(10, Math.min(20, zoom))
  }

  const handleLocationSelect = (location: {
    lat: number
    lng: number
    address: string
  }) => {
    setMapCenter({ lat: location.lat, lng: location.lng })
    setMapZoom(15)

    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.lat, lng: location.lng })
      mapRef.current.setZoom(15)
    }
  }

  // Função para centralizar no polígono (pode ser chamada externamente)
  const centerOnPolygonById = (polygonId: string) => {
    const selectedPolygon = state.polygons.find((p) => p.id === polygonId)
    if (selectedPolygon && selectedPolygon.coordinates.length > 0) {
      const center = getPolygonCenter(selectedPolygon.coordinates)
      const optimalZoom = calculateOptimalZoom(selectedPolygon.coordinates)
      setMapCenter(center)
      setMapZoom(optimalZoom)

      if (mapRef.current) {
        mapRef.current.panTo(center)
        mapRef.current.setZoom(optimalZoom)
      }
    }
  }

  // Disponibilizar a função globalmente
  centerOnPolygon = centerOnPolygonById

  if (loadError)
    return <div className="text-red-500">Erro ao carregar mapa</div>
  if (!isLoaded) return <div className="text-gray-500">Carregando mapa...</div>

  return (
    <div className="w-full">
      <div className="mb-4 space-y-4">
        <LocationSearch onLocationSelect={handleLocationSelect} />

        <div className="flex gap-2">
          <Button
            onClick={toggleDrawingMode}
            variant={state.drawingMode ? 'default' : 'outline'}
          >
            {state.drawingMode ? 'Cancelar Desenho' : 'Desenhar Polígono'}
          </Button>
          <Button
            onClick={() => dispatch({ type: 'SELECT_POLYGON', payload: null })}
            variant="outline"
            disabled={!state.selectedPolygonId}
          >
            Desselecionar
          </Button>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          zoomControl: true,
          scaleControl: false,
          rotateControl: false,
        }}
      >
        {state.polygons.map((polygon) => (
          <div key={polygon.id}>
            <Polygon
              paths={polygon.coordinates}
              options={{
                fillColor: polygon.color,
                fillOpacity: polygon.id === state.selectedPolygonId ? 0.5 : 0.3,
                strokeColor: polygon.color,
                strokeOpacity: 1,
                strokeWeight: polygon.id === state.selectedPolygonId ? 3 : 2,
              }}
              onClick={() => handlePolygonClick(polygon.id)}
            />
            <InfoWindow
              position={getPolygonCenter(polygon.coordinates)}
              options={{
                disableAutoPan: true,
                headerDisabled: true,
                pixelOffset: new window.google.maps.Size(0, 0),
              }}
            >
              <div
                className="bg-white px-3 py-2 rounded shadow-lg border text-sm font-medium max-w-xs"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  {polygon.label}
                </div>
                <div className="text-gray-600 text-xs">
                  Área: {formatArea(polygon.area)}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {polygon.coordinates.length} pontos
                </div>
              </div>
            </InfoWindow>
          </div>
        ))}
      </GoogleMap>
    </div>
  )
}
