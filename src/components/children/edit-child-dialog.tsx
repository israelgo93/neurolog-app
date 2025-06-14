// src/components/children/edit-child-dialog.tsx
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
import { useToast } from '@/components/ui/use-toast'
import { useChildren } from '@/hooks/use-children'
import { Loader2 } from 'lucide-react'

interface Child {
  id: string
  name: string
  birth_date: string | null
  diagnosis: string | null
  notes: string | null
}

interface EditChildDialogProps {
  readonly child: Child
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  birth_date: string
  diagnosis: string
  notes: string
}

export function EditChildDialog({ child, open, onOpenChange }: EditChildDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birth_date: '',
    diagnosis: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const { updateChild } = useChildren()
  const { toast } = useToast()

  // Cargar datos del niño cuando se abre el diálogo
  useEffect(() => {
    if (open && child) {
      setFormData({
        name: child.name || '',
        birth_date: child.birth_date ?? '',
        diagnosis: child.diagnosis ?? '',
        notes: child.notes ?? ''
      })
    }
  }, [open, child])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const updates = {
        name: formData.name.trim(),
        birth_date: formData.birth_date ?? null,
        diagnosis: formData.diagnosis.trim() ?? null,
        notes: formData.notes.trim() ?? null
      }

      await updateChild(child.id, updates)
      
      toast({
        title: "¡Éxito!",
        description: "Información actualizada correctamente",
      })
      
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "No se pudo actualizar la información",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar información</DialogTitle>
          <DialogDescription>
            Actualiza la información de {child.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre completo *</Label>
            <Input
              id="edit-name"
              placeholder="Nombre del niño"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-birth_date">Fecha de nacimiento</Label>
            <Input
              id="edit-birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-diagnosis">Diagnóstico</Label>
            <Input
              id="edit-diagnosis"
              placeholder="Diagnóstico o condición"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas adicionales</Label>
            <Textarea
              id="edit-notes"
              placeholder="Información adicional relevante..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={loading}
              rows={3}
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