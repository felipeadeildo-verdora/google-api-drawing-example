import { createContext, useContext, useReducer } from 'react'
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

const initialState: PolygonState = {
  polygons: [],
  selectedPolygonId: null,
  drawingMode: false
}

function polygonReducer(state: PolygonState, action: PolygonAction): PolygonState {
  switch (action.type) {
    case 'ADD_POLYGON':
      return {
        ...state,
        polygons: [...state.polygons, action.payload],
        drawingMode: false
      }
    case 'UPDATE_POLYGON':
      return {
        ...state,
        polygons: state.polygons.map(polygon =>
          polygon.id === action.payload.id
            ? { ...polygon, ...action.payload.updates }
            : polygon
        )
      }
    case 'DELETE_POLYGON':
      return {
        ...state,
        polygons: state.polygons.filter(polygon => polygon.id !== action.payload),
        selectedPolygonId: state.selectedPolygonId === action.payload ? null : state.selectedPolygonId
      }
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