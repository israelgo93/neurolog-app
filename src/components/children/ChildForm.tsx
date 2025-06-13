// src/components/children/ChildForm.tsx
// Formulario actualizado para crear/editar niños con el nuevo modelo

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { uploadFile, getPublicUrl } from '@/lib/supabase';
import type { Child, ChildInsert, ChildUpdate, EmergencyContact } from '@/types';
import { 
  ImageIcon, 
  PlusIcon, 
  TrashIcon, 
  SaveIcon, 
  UserIcon,
  PhoneIcon,
  HeartIcon,
  GraduationCapIcon,
  ShieldIcon
} from 'lucide-react';
import { format } from 'date-fns';

// ================================================================
// ESQUEMAS DE VALIDACIÓN
// ================================================================

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  relationship: z.string().min(2, 'La relación es requerida'),
  is_primary: z.boolean().optional().default(false)
});

const childFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  birth_date: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  avatar_url: z.string().optional(),
  emergency_contact: z.array(emergencyContactSchema).default([]),
  medical_info: z.object({
    allergies: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([]),
    conditions: z.array(z.string()).default([]),
    emergency_notes: z.string().optional()
  }).default({}),
  educational_info: z.object({
    school: z.string().optional(),
    grade: z.string().optional(),
    teacher: z.string().optional(),
    iep_goals: z.array(z.string()).default([]),
    accommodations: z.array(z.string()).default([])
  }).default({}),
  privacy_settings: z.object({
    share_with_specialists: z.boolean().default(true),
    share_progress_reports: z.boolean().default(true),
    allow_photo_sharing: z.boolean().default(false),
    data_retention_months: z.number().default(24)
  }).default({})
});

type ChildFormData = z.infer<typeof childFormSchema>;

// ================================================================
// PROPS E INTERFACES
// ================================================================

interface ChildFormProps {
  child?: Child;
  mode: 'create' | 'edit';
  onSuccess?: (child: Child) => void;
  onCancel?: () => void;
}

interface EmergencyContactFormProps {
  contacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
}

interface MedicalInfoFormProps {
  medicalInfo: any;
  onChange: (info: any) => void;
}

interface EducationalInfoFormProps {
  educationalInfo: any;
  onChange: (info: any) => void;
}

interface PrivacySettingsFormProps {
  settings: any;
  onChange: (settings: any) => void;
}

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

function EmergencyContactForm({ contacts, onChange }: EmergencyContactFormProps) {
  const addContact = () => {
    onChange([...contacts, {
      name: '',
      phone: '',
      relationship: '',
      is_primary: contacts.length === 0
    }]);
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    onChange(newContacts);
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: any) => {
    const newContacts = contacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    onChange(newContacts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Contactos de Emergencia</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addContact}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Contacto
        </Button>
      </div>

      {contacts.map((contact, index) => (
        <Card key={`contact-${contact.name || 'unnamed'}-${contact.phone || 'nophone'}-${index}`} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`contact-name-${index}`}>Nombre</Label>
              <Input
                id={`contact-name-${index}`}
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <Label htmlFor={`contact-phone-${index}`}>Teléfono</Label>
              <Input
                id={`contact-phone-${index}`}
                value={contact.phone}
                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <Label htmlFor={`contact-relationship-${index}`}>Relación</Label>
              <Input
                id={`contact-relationship-${index}`}
                value={contact.relationship}
                onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                placeholder="Padre, Madre, Tutor, etc."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`contact-primary-${index}`}
                  checked={contact.is_primary}
                  onCheckedChange={(checked) => updateContact(index, 'is_primary', checked)}
                />
                <Label htmlFor={`contact-primary-${index}`}>Contacto Principal</Label>
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeContact(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {contacts.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <PhoneIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No hay contactos de emergencia registrados</p>
          <p className="text-sm">Agrega al menos un contacto de emergencia</p>
        </div>
      )}
    </div>
  );
}

function MedicalInfoForm({ medicalInfo, onChange }: MedicalInfoFormProps) {
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // Helper functions to avoid nested ternaries
  const getFieldValue = (field: string) => {
    if (field === 'allergies') return newAllergy;
    if (field === 'medications') return newMedication;
    return newCondition;
  };

  const getFieldSetter = (field: string) => {
    if (field === 'allergies') return setNewAllergy;
    if (field === 'medications') return setNewMedication;
    return setNewCondition;
  };

  const setFieldValue = (field: string, value: string) => {
    if (field === 'allergies') setNewAllergy(value);
    else if (field === 'medications') setNewMedication(value);
    else setNewCondition(value);
  };

  const addItem = (field: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentItems = medicalInfo[field] ?? [];
      onChange({
        ...medicalInfo,
        [field]: [...currentItems, value.trim()]
      });
      setter('');
    }
  };

  const removeItem = (field: string, index: number) => {
    const currentItems = medicalInfo[field] ?? [];
    onChange({
      ...medicalInfo,
      [field]: currentItems.filter((_: any, i: number) => i !== index)
    });
  };

  const ItemsList = ({ field, items, placeholder }: { field: string, items: string[], placeholder: string }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={`${field}-${item}-${index}`} variant="secondary" className="text-sm">
            {item}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => removeItem(field, index)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          placeholder={placeholder}
          value={getFieldValue(field)}
          onChange={(e) => setFieldValue(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = getFieldValue(field);
              const setter = getFieldSetter(field);
              addItem(field, value, setter);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const value = getFieldValue(field);
            const setter = getFieldSetter(field);
            addItem(field, value, setter);
          }}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">
          <HeartIcon className="h-4 w-4 inline mr-2" />
          Alergias
        </Label>
        <ItemsList 
          field="allergies" 
          items={medicalInfo.allergies ?? []} 
          placeholder="Agregar alergia..." 
        />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Medicamentos</Label>
        <ItemsList 
          field="medications" 
          items={medicalInfo.medications ?? []} 
          placeholder="Agregar medicamento..." 
        />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Condiciones Médicas</Label>
        <ItemsList 
          field="conditions" 
          items={medicalInfo.conditions ?? []} 
          placeholder="Agregar condición..." 
        />
      </div>

      <div>
        <Label htmlFor="emergency-notes">Notas de Emergencia</Label>
        <Textarea
          id="emergency-notes"
          value={medicalInfo.emergency_notes ?? ''}
          onChange={(e) => onChange({
            ...medicalInfo,
            emergency_notes: e.target.value
          })}
          placeholder="Información importante para emergencias médicas..."
          rows={3}
        />
      </div>
    </div>
  );
}

function EducationalInfoForm({ educationalInfo, onChange }: EducationalInfoFormProps) {
  const [newGoal, setNewGoal] = useState('');
  const [newAccommodation, setNewAccommodation] = useState('');

  const addItem = (field: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentItems = educationalInfo[field] ?? [];
      onChange({
        ...educationalInfo,
        [field]: [...currentItems, value.trim()]
      });
      setter('');
    }
  };

  const removeItem = (field: string, index: number) => {
    const currentItems = educationalInfo[field] ?? [];
    onChange({
      ...educationalInfo,
      [field]: currentItems.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="school">Institución Educativa</Label>
          <Input
            id="school"
            value={educationalInfo.school ?? ''}
            onChange={(e) => onChange({
              ...educationalInfo,
              school: e.target.value
            })}
            placeholder="Nombre de la escuela..."
          />
        </div>

        <div>
          <Label htmlFor="grade">Grado/Nivel</Label>
          <Input
            id="grade"
            value={educationalInfo.grade ?? ''}
            onChange={(e) => onChange({
              ...educationalInfo,
              grade: e.target.value
            })}
            placeholder="Ej: 3er grado, Preescolar..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="teacher">Docente Principal</Label>
        <Input
          id="teacher"
          value={educationalInfo.teacher ?? ''}
          onChange={(e) => onChange({
            ...educationalInfo,
            teacher: e.target.value
          })}
          placeholder="Nombre del docente..."
        />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">
          <GraduationCapIcon className="h-4 w-4 inline mr-2" />
          Objetivos IEP
        </Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(educationalInfo.iep_goals ?? []).map((goal: string, index: number) => (
              <Badge key={`iep-goal-${goal}-${index}`} variant="secondary" className="text-sm">
                {goal}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => removeItem('iep_goals', index)}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Agregar objetivo IEP..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('iep_goals', newGoal, setNewGoal);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('iep_goals', newGoal, setNewGoal)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Acomodaciones</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(educationalInfo.accommodations ?? []).map((accommodation: string, index: number) => (
              <Badge key={`accommodation-${accommodation}-${index}`} variant="secondary" className="text-sm">
                {accommodation}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => removeItem('accommodations', index)}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Agregar acomodación..."
              value={newAccommodation}
              onChange={(e) => setNewAccommodation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('accommodations', newAccommodation, setNewAccommodation);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('accommodations', newAccommodation, setNewAccommodation)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacySettingsForm({ settings, onChange }: PrivacySettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Compartir con Especialistas</Label>
            <p className="text-sm text-gray-600">
              Permitir que especialistas accedan a los registros
            </p>
          </div>
          <Switch
            checked={settings.share_with_specialists}
            onCheckedChange={(checked) => onChange({
              ...settings,
              share_with_specialists: checked
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Reportes de Progreso</Label>
            <p className="text-sm text-gray-600">
              Incluir en reportes de progreso generados
            </p>
          </div>
          <Switch
            checked={settings.share_progress_reports}
            onCheckedChange={(checked) => onChange({
              ...settings,
              share_progress_reports: checked
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Compartir Fotos</Label>
            <p className="text-sm text-gray-600">
              Permitir incluir fotos en registros compartidos
            </p>
          </div>
          <Switch
            checked={settings.allow_photo_sharing}
            onCheckedChange={(checked) => onChange({
              ...settings,
              allow_photo_sharing: checked
            })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="data-retention">Retención de Datos (meses)</Label>
        <Input
          id="data-retention"
          type="number"
          min="12"
          max="120"
          value={settings.data_retention_months}
          onChange={(e) => onChange({
            ...settings,
            data_retention_months: parseInt(e.target.value) || 24
          })}
        />
        <p className="text-sm text-gray-600 mt-1">
          Tiempo que se mantendrán los datos antes de ser archivados
        </p>
      </div>
    </div>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function ChildForm({ child, mode, onSuccess, onCancel }: ChildFormProps) {
  const { user } = useAuth();
  const { createChild, updateChild } = useChildren();
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const router = useRouter();

  // Helper function to get button text
  const getButtonText = () => {
    if (form.formState.isSubmitting) return 'Guardando...';
    return mode === 'create' ? 'Crear Niño' : 'Guardar Cambios';
  };

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: child?.name ?? '',
      birth_date: child?.birth_date ?? '',
      diagnosis: child?.diagnosis ?? '',
      notes: child?.notes ?? '',
      avatar_url: child?.avatar_url ?? '',
      emergency_contact: child?.emergency_contact ?? [],
      medical_info: child?.medical_info ?? {
        allergies: [],
        medications: [],
        conditions: [],
        emergency_notes: ''
      },
      educational_info: child?.educational_info ?? {
        school: '',
        grade: '',
        teacher: '',
        iep_goals: [],
        accommodations: []
      },
      privacy_settings: child?.privacy_settings ?? {
        share_with_specialists: true,
        share_progress_reports: true,
        allow_photo_sharing: false,
        data_retention_months: 24
      }
    }
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      await uploadFile('AVATARS', file, fileName);
      const url = getPublicUrl('AVATARS', fileName);
      
      form.setValue('avatar_url', url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ChildFormData) => {
    try {
      let result: Child;
      
      if (mode === 'create') {
        result = await createChild(data as ChildInsert);
      } else {
        result = await updateChild(child!.id, data as ChildUpdate);
      }

      onSuccess?.(result);
      
      if (!onSuccess) {
        router.push(`/dashboard/children/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving child:', error);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: UserIcon },
    { id: 'emergency', label: 'Contactos', icon: PhoneIcon },
    { id: 'medical', label: 'Información Médica', icon: HeartIcon },
    { id: 'educational', label: 'Información Educativa', icon: GraduationCapIcon },
    { id: 'privacy', label: 'Privacidad', icon: ShieldIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Agregar Niño' : 'Editar Niño'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'create' 
              ? 'Completa la información para agregar un nuevo niño al seguimiento'
              : 'Actualiza la información del niño'
            }
          </p>
        </div>
        
        <div className="flex space-x-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            {mode === 'create' ? 'Crear' : 'Guardar'} Niño
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Datos fundamentales del niño
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={form.watch('avatar_url')} 
                      alt={form.watch('name')}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                      {form.watch('name')?.charAt(0)?.toUpperCase() || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                        <ImageIcon className="h-4 w-4" />
                        <span>{uploading ? 'Subiendo...' : 'Cambiar foto'}</span>
                      </div>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      JPG, PNG hasta 5MB
                    </p>
                  </div>
                </div>

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del niño..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Birth Date */}
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          max={format(new Date(), 'yyyy-MM-dd')}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        La fecha de nacimiento ayuda a calcular la edad automáticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Diagnosis */}
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Diagnóstico principal o condición..."
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Diagnóstico principal o condición que requiere seguimiento especial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional importante..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Cualquier información adicional relevante sobre el niño
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'emergency' && (
            <Card>
              <CardHeader>
                <CardTitle>Contactos de Emergencia</CardTitle>
                <CardDescription>
                  Personas a contactar en caso de emergencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyContactForm
                  contacts={form.watch('emergency_contact')}
                  onChange={(contacts) => form.setValue('emergency_contact', contacts.map(contact => ({
                    ...contact,
                    is_primary: contact.is_primary ?? false
                  })))}
                />
              </CardContent>
            </Card>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <Card>
              <CardHeader>
                <CardTitle>Información Médica</CardTitle>
                <CardDescription>
                  Datos médicos importantes para el seguimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MedicalInfoForm
                  medicalInfo={form.watch('medical_info')}
                  onChange={(info) => form.setValue('medical_info', info)}
                />
              </CardContent>
            </Card>
          )}

          {/* Educational Information Tab */}
          {activeTab === 'educational' && (
            <Card>
              <CardHeader>
                <CardTitle>Información Educativa</CardTitle>
                <CardDescription>
                  Datos sobre el entorno educativo del niño
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EducationalInfoForm
                  educationalInfo={form.watch('educational_info')}
                  onChange={(info) => form.setValue('educational_info', info)}
                />
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings Tab */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
                <CardDescription>
                  Controla cómo se comparte la información del niño
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrivacySettingsForm
                  settings={form.watch('privacy_settings')}
                  onChange={(settings) => form.setValue('privacy_settings', settings)}
                />
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {getButtonText()}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}