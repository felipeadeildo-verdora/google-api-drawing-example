import { Edit3, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { usePolygon } from '../contexts/polygon'
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
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              polygon.id === state.selectedPolygonId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePolygonSelect(polygon.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: polygon.color }}
                />

                {editingId === polygon.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1"
                      placeholder="Nome da área"
                      autoFocus
                    />
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
                ) : (
                  <div className="flex-1">
                    <div className="font-medium">{polygon.label}</div>
                    <div className="text-sm text-gray-500">
                      {polygon.coordinates.length} pontos
                    </div>
                  </div>
                )}
              </div>

              {editingId !== polygon.id && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 ${
                          polygon.color === color
                            ? 'border-gray-800'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorChange(polygon.id, color)
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit(polygon)
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePolygon(polygon.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
