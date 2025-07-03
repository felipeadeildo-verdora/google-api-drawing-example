import { useState, useCallback, useRef } from 'react'
import { GoogleMap, Polygon } from '@react-google-maps/api'
import { usePolygon } from '../lib/polygon-context'
import { useGoogleMaps } from '../lib/google-maps-provider'
import { Button } from './ui/button'

const containerStyle = { width: '100%', height: '600px' }
const center = { lat: -23.55052, lng: -46.633308 }

interface MapWithDrawingProps {
  initialCenter?: { lat: number; lng: number }
}

export default function MapWithDrawing({ initialCenter }: MapWithDrawingProps) {
  const { isLoaded, loadError } = useGoogleMaps()
  
  const { state, dispatch } = usePolygon()
  const [mapCenter] = useState(initialCenter || center)
  const drawingManagerRef = useRef<any>(null)

  const onMapLoad = useCallback((map: any) => {
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        editable: true,
        draggable: false,
        fillColor: '#FF0000',
        fillOpacity: 0.3,
        strokeColor: '#FF0000',
        strokeOpacity: 1,
        strokeWeight: 2
      }
    })
    
    drawingManager.setMap(map)
    drawingManagerRef.current = drawingManager

    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
      const path = polygon.getPath().getArray()
      const coords = path.map((pt: any) => ({ lat: pt.lat(), lng: pt.lng() }))
      
      const newPolygon = {
        id: crypto.randomUUID(),
        coordinates: coords,
        label: `Área ${state.polygons.length + 1}`,
        color: '#FF0000',
        createdAt: new Date()
      }
      
      dispatch({ type: 'ADD_POLYGON', payload: newPolygon })
      polygon.setMap(null)
    })
  }, [state.polygons.length, dispatch])

  const toggleDrawingMode = () => {
    if (drawingManagerRef.current) {
      const currentMode = drawingManagerRef.current.getDrawingMode()
      const newMode = currentMode === window.google.maps.drawing.OverlayType.POLYGON 
        ? null 
        : window.google.maps.drawing.OverlayType.POLYGON
      
      drawingManagerRef.current.setDrawingMode(newMode)
      dispatch({ type: 'TOGGLE_DRAWING_MODE' })
    }
  }

  const handlePolygonClick = (polygonId: string) => {
    dispatch({ type: 'SELECT_POLYGON', payload: polygonId })
  }

  if (loadError) return <div className="text-red-500">Erro ao carregar mapa</div>
  if (!isLoaded) return <div className="text-gray-500">Carregando mapa...</div>

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-2">
        <Button 
          onClick={toggleDrawingMode}
          variant={state.drawingMode ? "default" : "outline"}
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
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={onMapLoad}
      >
        {state.polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            paths={polygon.coordinates}
            options={{
              fillColor: polygon.color,
              fillOpacity: polygon.id === state.selectedPolygonId ? 0.5 : 0.3,
              strokeColor: polygon.color,
              strokeOpacity: 1,
              strokeWeight: polygon.id === state.selectedPolygonId ? 3 : 2
            }}
            onClick={() => handlePolygonClick(polygon.id)}
          />
        ))}
      </GoogleMap>
    </div>
  )
}