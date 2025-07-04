import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';

// Função para calcular a área de um polígono usando Google Maps Geometry
export async function calculatePolygonArea(
  coordinates: { lat: number; lng: number }[]
): Promise<number> {
  if (coordinates.length < 3) return 0

  const { spherical } = (await google.maps.importLibrary(
    'geometry'
  )) as google.maps.GeometryLibrary

  const path = coordinates.map(
    (coord) => new google.maps.LatLng(coord.lat, coord.lng)
  )

  return spherical.computeArea(path)
}

// Função para formatar área em uma unidade legível
export function formatArea(areaInSquareMeters: number): string {
  if (areaInSquareMeters < 1000) {
    return `${areaInSquareMeters.toFixed(2)} m²`
  } else if (areaInSquareMeters < 10000) {
    return `${(areaInSquareMeters / 1000).toFixed(3)} km²`
  } else {
    return `${(areaInSquareMeters / 10000).toFixed(2)} ha`
  }
}

export interface PolygonData {
  id: string
  coordinates: { lat: number; lng: number }[]
  label: string
  color: string
  createdAt: Date
  area: number // área em metros quadrados
}

interface PolygonState {
  polygons: PolygonData[]
  selectedPolygonId: string | null
  drawingMode: boolean
}

type PolygonAction =
  | { type: 'ADD_POLYGON'; payload: PolygonData }
  | {
      type: 'UPDATE_POLYGON'
      payload: { id: string; updates: Partial<PolygonData> }
    }
  | { type: 'DELETE_POLYGON'; payload: string }
  | { type: 'SELECT_POLYGON'; payload: string | null }
  | { type: 'TOGGLE_DRAWING_MODE' }
  | { type: 'LOAD_POLYGONS'; payload: PolygonData[] }

const initialState: PolygonState = {
  polygons: [],
  selectedPolygonId: null,
  drawingMode: false,
}

function polygonReducer(
  state: PolygonState,
  action: PolygonAction
): PolygonState {
  switch (action.type) {
    case 'ADD_POLYGON':
      const newState = {
        ...state,
        polygons: [...state.polygons, action.payload],
        drawingMode: false,
      }
      localStorage.setItem('saved-polygons', JSON.stringify(newState.polygons))
      return newState
    case 'UPDATE_POLYGON':
      const updatedState = {
        ...state,
        polygons: state.polygons.map((polygon) =>
          polygon.id === action.payload.id
            ? { ...polygon, ...action.payload.updates }
            : polygon
        ),
      }
      localStorage.setItem(
        'saved-polygons',
        JSON.stringify(updatedState.polygons)
      )
      return updatedState
    case 'DELETE_POLYGON':
      const deletedState = {
        ...state,
        polygons: state.polygons.filter(
          (polygon) => polygon.id !== action.payload
        ),
        selectedPolygonId:
          state.selectedPolygonId === action.payload
            ? null
            : state.selectedPolygonId,
      }
      localStorage.setItem(
        'saved-polygons',
        JSON.stringify(deletedState.polygons)
      )
      return deletedState
    case 'SELECT_POLYGON':
      return {
        ...state,
        selectedPolygonId: action.payload,
      }
    case 'TOGGLE_DRAWING_MODE':
      return {
        ...state,
        drawingMode: !state.drawingMode,
        selectedPolygonId: null,
      }
    case 'LOAD_POLYGONS':
      return {
        ...state,
        polygons: action.payload,
      }
    default:
      return state
  }
}

const PolygonContext = createContext<{
  state: PolygonState
  dispatch: React.Dispatch<PolygonAction>
} | null>(null)

export function PolygonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(polygonReducer, initialState)

  useEffect(() => {
    const loadPolygons = async () => {
      const savedPolygons = localStorage.getItem('saved-polygons')
      if (savedPolygons) {
        try {
          const parsedPolygons = JSON.parse(savedPolygons)
          const polygonsWithDates = await Promise.all(
            parsedPolygons.map(async (polygon: any) => ({
              ...polygon,
              createdAt: new Date(polygon.createdAt),
              area:
                polygon.area ||
                (await calculatePolygonArea(polygon.coordinates)),
            }))
          )
          dispatch({ type: 'LOAD_POLYGONS', payload: polygonsWithDates })
        } catch (error) {
          console.error('Error loading saved polygons:', error)
        }
      }
    }

    loadPolygons()
  }, [])

  return (
    <PolygonContext.Provider value={{ state, dispatch }}>
      {children}
    </PolygonContext.Provider>
  )
}

export function usePolygon() {
  const context = useContext(PolygonContext)
  if (!context) {
    throw new Error('usePolygon must be used within a PolygonProvider')
  }
  return context
}
