import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface PolygonData {
  id: string
  coordinates: { lat: number; lng: number }[]
  label: string
  color: string
  createdAt: Date
}

interface PolygonState {
  polygons: PolygonData[]
  selectedPolygonId: string | null
  drawingMode: boolean
}

type PolygonAction =
  | { type: 'ADD_POLYGON'; payload: PolygonData }
  | { type: 'UPDATE_POLYGON'; payload: { id: string; updates: Partial<PolygonData> } }
  | { type: 'DELETE_POLYGON'; payload: string }
  | { type: 'SELECT_POLYGON'; payload: string | null }
  | { type: 'TOGGLE_DRAWING_MODE' }
  | { type: 'LOAD_POLYGONS'; payload: PolygonData[] }

const initialState: PolygonState = {
  polygons: [],
  selectedPolygonId: null,
  drawingMode: false
}

function polygonReducer(state: PolygonState, action: PolygonAction): PolygonState {
  switch (action.type) {
    case 'ADD_POLYGON':
      const newState = {
        ...state,
        polygons: [...state.polygons, action.payload],
        drawingMode: false
      }
      localStorage.setItem('saved-polygons', JSON.stringify(newState.polygons))
      return newState
    case 'UPDATE_POLYGON':
      const updatedState = {
        ...state,
        polygons: state.polygons.map(polygon =>
          polygon.id === action.payload.id
            ? { ...polygon, ...action.payload.updates }
            : polygon
        )
      }
      localStorage.setItem('saved-polygons', JSON.stringify(updatedState.polygons))
      return updatedState
    case 'DELETE_POLYGON':
      const deletedState = {
        ...state,
        polygons: state.polygons.filter(polygon => polygon.id !== action.payload),
        selectedPolygonId: state.selectedPolygonId === action.payload ? null : state.selectedPolygonId
      }
      localStorage.setItem('saved-polygons', JSON.stringify(deletedState.polygons))
      return deletedState
    case 'SELECT_POLYGON':
      return {
        ...state,
        selectedPolygonId: action.payload
      }
    case 'TOGGLE_DRAWING_MODE':
      return {
        ...state,
        drawingMode: !state.drawingMode,
        selectedPolygonId: null
      }
    case 'LOAD_POLYGONS':
      return {
        ...state,
        polygons: action.payload
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
    const savedPolygons = localStorage.getItem('saved-polygons')
    if (savedPolygons) {
      try {
        const parsedPolygons = JSON.parse(savedPolygons)
        const polygonsWithDates = parsedPolygons.map((polygon: any) => ({
          ...polygon,
          createdAt: new Date(polygon.createdAt)
        }))
        dispatch({ type: 'LOAD_POLYGONS', payload: polygonsWithDates })
      } catch (error) {
        console.error('Error loading saved polygons:', error)
      }
    }
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