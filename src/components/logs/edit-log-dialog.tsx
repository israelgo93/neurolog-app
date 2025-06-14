// src/components/logs/edit-log-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useCategories } from '@/hooks/use-categories'
import { useLogs } from '@/hooks/use-logs'
import { Star, Loader2 } from 'lucide-react'

interface LogData {
  id: string
  title: string
  content: string
  mood_score: number | null
  intensity_level: 'low' | 'medium' | 'high'
  log_date: string
  category_id: string | null
}

interface EditLogDialogProps {
  readonly log: LogData
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

interface FormData {
  title: string
  content: string
  mood_score: number | null
  intensity_level: 'low' | 'medium' | 'high'
  log_date: string
  category_id: string
}

export function EditLogDialog({ log, open, onOpenChange }: EditLogDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    mood_score: null,
    intensity_level: 'medium',
    log_date: '',
    category_id: ''
  })
  const [loading, setLoading] = useState(false)

  const { categories } = useCategories()
  const { updateLog } = useLogs({})
  const { toast } = useToast()

  // Cargar datos del log cuando se abre el diálogo
  useEffect(() => {
    if (open && log) {
      setFormData({
        title: log.title,
        content: log.content,
        mood_score: log.mood_score,
        intensity_level: log.intensity_level,
        log_date: log.log_date,
        category_id: log.category_id ?? ''
      })
    }
  }, [open, log])

  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error de validación",
        description: "El título y contenido son requeridos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const updates = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        mood_score: formData.mood_score,
        intensity_level: formData.intensity_level,
        log_date: formData.log_date,
        category_id: formData.category_id || null
      }

      await updateLog(log.id, updates)
      
      toast({
        title: "¡Éxito!",
        description: "Registro actualizado correctamente",
      })
      
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "No se pudo actualizar el registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const intensityOptions = [
    { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar registro</DialogTitle>
          <DialogDescription>
            Modifica la información del registro diario.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título del registro *</Label>
            <Input
              id="edit-title"
              placeholder="Breve descripción del evento"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Descripción detallada *</Label>
            <Textarea
              id="edit-content"
              placeholder="Describe qué ocurrió, cómo reaccionó el niño, contexto, etc."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoría</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleInputChange('category_id', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado de ánimo</Label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('mood_score', 
                      formData.mood_score === star ? null : star
                    )}
                    disabled={loading}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        formData.mood_score && star <= formData.mood_score
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intensidad</Label>
              <Select 
                value={formData.intensity_level} 
                onValueChange={(value) => handleInputChange('intensity_level', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intensityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge variant="outline" className={option.color}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-log_date">Fecha</Label>
            <Input
              id="edit-log_date"
              type="date"
              value={formData.log_date}
              onChange={(e) => handleInputChange('log_date', e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}