import { Edit3, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { formatArea, usePolygon } from '../contexts/polygon'
import { useCenterOnPolygon } from './map-with-drawing'
import { Button } from './ui/button'
import { Input } from './ui/input'

const colors = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#FFC0CB',
]

export function PolygonManager() {
  const { state, dispatch } = usePolygon()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleStartEdit = (polygon: any) => {
    setEditingId(polygon.id)
    setEditLabel(polygon.label)
  }

  const handleSaveEdit = () => {
    if (editingId && editLabel.trim()) {
      dispatch({
        type: 'UPDATE_POLYGON',
        payload: { id: editingId, updates: { label: editLabel.trim() } },
      })
      setEditingId(null)
      setEditLabel('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
  }

  const handleDeletePolygon = (polygonId: string) => {
    dispatch({ type: 'DELETE_POLYGON', payload: polygonId })
  }

  const handleColorChange = (polygonId: string, color: string) => {
    dispatch({
      type: 'UPDATE_POLYGON',
      payload: { id: polygonId, updates: { color } },
    })
  }

  const handlePolygonSelect = (polygonId: string) => {
    dispatch({ type: 'SELECT_POLYGON', payload: polygonId })

    // Centralizar mapa no polígono selecionado
    const centerOnPolygon = useCenterOnPolygon()
    if (centerOnPolygon) {
      centerOnPolygon(polygonId)
    }
  }

  if (state.polygons.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum polígono criado ainda. Use a ferramenta de desenho no mapa para
        criar áreas.
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">
        Áreas Criadas ({state.polygons.length})
      </h3>

      <div className="space-y-3">
        {state.polygons.map((polygon) => (
          <div
            key={polygon.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              polygon.id === state.selectedPolygonId
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => handlePolygonSelect(polygon.id)}
          >
            {editingId === polygon.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1"
                    placeholder="Nome da área"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveEdit()
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelEdit()
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {polygon.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-blue-600">
                          {formatArea(polygon.area)}
                        </span>
                        <span className="text-gray-500">
                          {polygon.coordinates.length} pontos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {colors.slice(0, 6).map((color) => (
                      <button
                        key={color}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          polygon.color === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorChange(polygon.id, color)
                        }}
                      />
                    ))}
                    <div className="flex gap-1 ml-1">
                      {colors.slice(6).map((color) => (
                        <button
                          key={color}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            polygon.color === color
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleColorChange(polygon.id, color)
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartEdit(polygon)
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePolygon(polygon.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
