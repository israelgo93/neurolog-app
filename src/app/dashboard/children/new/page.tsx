'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import Link from 'next/link';
import type { ChildInsert, EmergencyContact} from '@/types';

export default function NewChildPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createChild, loading } = useChildren();
  
  const [formData, setFormData] = useState<ChildInsert>({
    name: '',
    birth_date: '',
    diagnosis: '',
    notes: '',
    emergency_contact: [],
    medical_info: {
      allergies: [],
      medications: [],
      conditions: [],
      emergency_notes: ''
    },
    educational_info: {
      school: '',
      grade: '',
      teacher: '',
      iep_goals: [],
      accommodations: []
    },
    privacy_settings: {
      share_with_specialists: true,
      share_progress_reports: true,
      allow_photo_sharing: false,
      data_retention_months: 36
    }
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relationship: '',
    is_primary: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'La fecha de nacimiento no puede ser futura';
      }
    }

    if (emergencyContact.name && !emergencyContact.phone) {
      newErrors.emergency_phone = 'El teléfono es requerido si agregaste un contacto';
    }

    if (emergencyContact.phone && !emergencyContact.name) {
      newErrors.emergency_name = 'El nombre es requerido si agregaste un teléfono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos de contacto de emergencia
      const emergencyContacts: EmergencyContact[] = [];
      if (emergencyContact.name && emergencyContact.phone) {
        emergencyContacts.push(emergencyContact);
      }

      // Crear el niño
      await createChild({
        ...formData,
        name: formData.name.trim(),
        emergency_contact: emergencyContacts,
        birth_date: formData.birth_date ?? null,
        diagnosis: formData.diagnosis ?? null,
        notes: formData.notes ?? null
      });
      
      // Redirigir a la lista de niños
      router.push('/dashboard/children');
    } catch (error) {
      console.error('Error creating child:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Error al crear el niño' 
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/children');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/children">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Niño</h1>
            <p className="text-gray-600">
              Agrega la información básica para comenzar el seguimiento
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del niño/a"
                  className={errors.name ? 'border-red-500' : ''}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-sm font-medium">
                  Fecha de nacimiento
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className={errors.birth_date ? 'border-red-500' : ''}
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-500">{errors.birth_date}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm font-medium">
                Diagnóstico o condición
              </Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                placeholder="TEA, TDAH, Síndrome de Down, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Información relevante, características especiales, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_name" className="text-sm font-medium">
                  Nombre del contacto
                </Label>
                <Input
                  id="emergency_name"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                  placeholder="Nombre completo"
                  className={errors.emergency_name ? 'border-red-500' : ''}
                />
                {errors.emergency_name && (
                  <p className="text-sm text-red-500">{errors.emergency_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                  placeholder="+593 99 123 4567"
                  className={errors.emergency_phone ? 'border-red-500' : ''}
                />
                {errors.emergency_phone && (
                  <p className="text-sm text-red-500">{errors.emergency_phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_relationship" className="text-sm font-medium">
                  Relación
                </Label>
                <Input
                  id="emergency_relationship"
                  value={emergencyContact.relationship}
                  onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})}
                  placeholder="Madre, Padre, Tutor, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Educativa */}
        <Card>
          <CardHeader>
            <CardTitle>Información Educativa (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school" className="text-sm font-medium">
                  Institución educativa
                </Label>
                <Input
                  id="school"
                  value={formData.educational_info?.school ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    educational_info: {
                      ...formData.educational_info!,
                      school: e.target.value
                    }
                  })}
                  placeholder="Nombre de la escuela/colegio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-medium">
                  Grado/Nivel
                </Label>
                <Input
                  id="grade"
                  value={formData.educational_info?.grade ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    educational_info: {
                      ...formData.educational_info!,
                      grade: e.target.value
                    }
                  })}
                  placeholder="1ro Básica, Preparatoria, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher" className="text-sm font-medium">
                Profesor/a principal
              </Label>
              <Input
                id="teacher"
                value={formData.educational_info?.teacher ?? ''}
                onChange={(e) => setFormData({
                  ...formData,
                  educational_info: {
                    ...formData.educational_info!,
                    teacher: e.target.value
                  }
                })}
                placeholder="Nombre del profesor/a"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Privacidad */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compartir con especialistas</Label>
                  <p className="text-sm text-gray-500">
                    Permitir que especialistas vean los registros
                  </p>
                </div>
                <Switch
                  checked={formData.privacy_settings?.share_with_specialists ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings!,
                        share_with_specialists: checked
                      }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Reportes de progreso</Label>
                  <p className="text-sm text-gray-500">
                    Incluir en reportes de progreso compartidos
                  </p>
                </div>
                <Switch
                  checked={formData.privacy_settings?.share_progress_reports ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings!,
                        share_progress_reports: checked
                      }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compartir fotos</Label>
                  <p className="text-sm text-gray-500">
                    Permitir compartir fotos en registros
                  </p>
                </div>
                <Switch
                  checked={formData.privacy_settings?.allow_photo_sharing ?? false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings!,
                        allow_photo_sharing: checked
                      }
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error de envío */}
        {errors.submit && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{errors.submit}</p>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Niño
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}