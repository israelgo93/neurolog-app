// src/components/children/ChildForm.tsx
// Formulario actualizado y refactorizado para cumplir con SonarQube

'use client';

import { useState, useMemo, useCallback } from 'react';
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
import type { Child, ChildInsert, ChildUpdate, EmergencyContact as EmergencyContactBase } from '@/types';
import { 
  CalendarIcon, 
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
import { v4 as uuidv4 } from 'uuid';

// Extiende EmergencyContact para incluir 'id' opcional solo para el formulario
type EmergencyContact = EmergencyContactBase & { id?: string };

// ================================================================
// ESQUEMAS DE VALIDACIÓN
// ================================================================

const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  relationship: z.string().min(2, 'La relación es requerida'),
  is_primary: z.boolean().default(false)
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
// COMPONENTES AUXILIARES (fuera del principal)
// ================================================================

export function EmergencyContactForm({ contacts, onChange }: Readonly<EmergencyContactFormProps>) {
  const addContact = () => {
    onChange([
      ...contacts,
      {
        id: uuidv4(),
        name: '',
        phone: '',
        relationship: '',
        is_primary: contacts.length === 0
      }
    ]);
  };

  const removeContact = (id: string | undefined) => {
    onChange(contacts.filter((c) => c.id !== id));
  };

  const updateContact = (id: string | undefined, field: keyof EmergencyContact, value: any) => {
    onChange(
      contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Contactos de Emergencia</Label>
        <Button type="button" variant="outline" size="sm" onClick={addContact}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Contacto
        </Button>
      </div>
      {contacts.map((contact) => (
        <Card key={contact.id}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={contact.name}
                  onChange={(e) =>
                    updateContact(contact.id, 'name', e.target.value)
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) =>
                    updateContact(contact.id, 'phone', e.target.value)
                  }
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <Label>Relación</Label>
                <Input
                  value={contact.relationship}
                  onChange={(e) =>
                    updateContact(contact.id, 'relationship', e.target.value)
                  }
                  placeholder="Padre, Madre, Tutor, etc."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={contact.is_primary}
                    onCheckedChange={(checked) =>
                      updateContact(contact.id, 'is_primary', checked)
                    }
                  />
                  <Label>Contacto Principal</Label>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeContact(contact.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
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

// COMPONENTE AUXILIAR GENERAL PARA LISTAS DE ITEMS (evita ternarias anidadas)
export function ItemsList({
  items,
  placeholder,
  value,
  onValueChange,
  onAdd,
  onRemove
}: Readonly<{
  items: string[],
  placeholder: string,
  value: string,
  onValueChange: (v: string) => void,
  onAdd: () => void,
  onRemove: (idx: number) => void
}>) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <Badge key={`${item}-${idx}`} variant="secondary" className="text-sm">
            {item}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => onRemove(idx)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function MedicalInfoForm({ medicalInfo, onChange }: Readonly<MedicalInfoFormProps>) {
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const addItem = useCallback((field: string, value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      const currentItems = medicalInfo[field] ?? [];
      onChange({
        ...medicalInfo,
        [field]: [...currentItems, value.trim()]
      });
      setter('');
    }
  }, [medicalInfo, onChange]);

  const removeItem = useCallback((field: string, index: number) => {
    const currentItems = medicalInfo[field] ?? [];
    onChange({
      ...medicalInfo,
      [field]: currentItems.filter((_: any, i: number) => i !== index)
    });
  }, [medicalInfo, onChange]);

  // Handlers individuales para cada campo
  const handleAddAllergy = () => addItem('allergies', newAllergy, setNewAllergy);
  const handleAddMedication = () => addItem('medications', newMedication, setNewMedication);
  const handleAddCondition = () => addItem('conditions', newCondition, setNewCondition);

  const handleRemoveAllergy = (idx: number) => removeItem('allergies', idx);
  const handleRemoveMedication = (idx: number) => removeItem('medications', idx);
  const handleRemoveCondition = (idx: number) => removeItem('conditions', idx);

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
          value={newAllergy}
          onValueChange={setNewAllergy}
          onAdd={handleAddAllergy}
          onRemove={handleRemoveAllergy}
        />
      </div>
      <div>
        <Label className="text-base font-medium mb-3 block">Medicamentos</Label>
        <ItemsList
          field="medications"
          items={medicalInfo.medications ?? []}
          placeholder="Agregar medicamento..."
          value={newMedication}
          onValueChange={setNewMedication}
          onAdd={handleAddMedication}
          onRemove={handleRemoveMedication}
        />
      </div>
      <div>
        <Label className="text-base font-medium mb-3 block">Condiciones Médicas</Label>
        <ItemsList
          field="conditions"
          items={medicalInfo.conditions ?? []}
          placeholder="Agregar condición..."
          value={newCondition}
          onValueChange={setNewCondition}
          onAdd={handleAddCondition}
          onRemove={handleRemoveCondition}
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

export function EducationalInfoForm({ educationalInfo, onChange }: Readonly<EducationalInfoFormProps>) {
  const [newGoal, setNewGoal] = useState('');
  const [newAccommodation, setNewAccommodation] = useState('');

  const addItem = useCallback((field: string, value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      const currentItems = educationalInfo[field] ?? [];
      onChange({
        ...educationalInfo,
        [field]: [...currentItems, value.trim()]
      });
      setter('');
    }
  }, [educationalInfo, onChange]);

  const removeItem = useCallback((field: string, index: number) => {
    const currentItems = educationalInfo[field] ?? [];
    onChange({
      ...educationalInfo,
      [field]: currentItems.filter((_: any, i: number) => i !== index)
    });
  }, [educationalInfo, onChange]);

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
            value={educationalInfo.grade || ''}
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
          value={educationalInfo.teacher || ''}
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
            {(educationalInfo.iep_goals || []).map((goal: string, idx: number) => (
              <Badge key={`${goal}-${idx}`} variant="secondary" className="text-sm">
                {goal}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => removeItem('iep_goals', idx)}
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
              onKeyPress={(e) => {
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
            {(educationalInfo.accommodations || []).map((accommodation: string, idx: number) => (
              <Badge key={`${accommodation}-${idx}`} variant="secondary" className="text-sm">
                {accommodation}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => removeItem('accommodations', idx)}
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
              onKeyPress={(e) => {
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

export function PrivacySettingsForm({ settings, onChange }: PrivacySettingsFormProps) {
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

  // --- Adaptar contactos para incluir id único
  const defaultContacts = useMemo(() => (
    (child?.emergency_contact || []).map(c => ({
      ...c,
      id: (c as any)?.id || uuidv4()
    }))
  ), [child?.emergency_contact]);

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: child?.name || '',
      birth_date: child?.birth_date || '',
      diagnosis: child?.diagnosis || '',
      notes: child?.notes || '',
      avatar_url: child?.avatar_url || '',
      emergency_contact: defaultContacts,
      medical_info: child?.medical_info || {
        allergies: [],
        medications: [],
        conditions: [],
        emergency_notes: ''
      },
      educational_info: child?.educational_info || {
        school: '',
        grade: '',
        teacher: '',
        iep_goals: [],
        accommodations: []
      },
      privacy_settings: child?.privacy_settings || {
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

      await uploadFile('avatars', fileName, file);
      const url = getPublicUrl('avatars', fileName);

      form.setValue('avatar_url', url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ChildFormData) => {
    try {
      // Quitar ids temporales antes de guardar
      const contactsClean = (data.emergency_contact || []).map(({ id, ...rest }) => rest);
      const finalData = { ...data, emergency_contact: contactsClean };
      let result: Child;

      if (mode === 'create') {
        result = await createChild(finalData as ChildInsert);
      } else {
        result = await updateChild(child!.id, finalData as ChildUpdate);
      }
      if (onSuccess) {
        onSuccess(result);
      } else {
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
              : 'Actualiza la información del niño'}
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
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabClass = isActive
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${tabClass} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                type="button"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      {(form.watch('name')?.charAt(0)?.toUpperCase() || 'N')}
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
                  onChange={(contacts) => form.setValue('emergency_contact', contacts)}
                />
              </CardContent>
            </Card>
          )}
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
              {form.formState.isSubmitting
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Crear Niño'
                  : 'Guardar Cambios'
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
