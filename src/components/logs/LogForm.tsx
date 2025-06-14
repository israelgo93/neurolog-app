// src/components/logs/LogForm.tsx
// Formulario actualizado para crear/editar registros diarios con el nuevo modelo

'use client';

import { useState, useEffect } from 'react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import { supabase, uploadFile, getPublicUrl, STORAGE_BUCKETS } from '@/lib/supabase';
import type { 
  DailyLog, 
  LogInsert, 
  LogUpdate, 
  Category, 
  IntensityLevel,
  LogAttachment,
  ChildWithRelation
} from '@/types';
import { 
  CalendarIcon, 
  ImageIcon, 
  PlusIcon, 
  TrashIcon, 
  SaveIcon,
  HeartIcon,
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  TagIcon,
  MapPinIcon,
  CloudIcon,
  ClockIcon,
  FileIcon,
  UploadIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ================================================================
// ESQUEMAS DE VALIDACIÓN
// ================================================================

const logFormSchema = z.object({
  child_id: z.string().min(1, 'Debes seleccionar un niño'),
  category_id: z.string().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres').max(5000, 'El contenido no puede exceder 5000 caracteres'),
  mood_score: z.number().min(1).max(5).optional(),
  intensity_level: z.enum(['low', 'medium', 'high']).default('medium'),
  log_date: z.string(),
  is_private: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  weather: z.string().optional(),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.enum(['image', 'video', 'audio', 'document']),
    size: z.number()
  })).default([])
}).refine((data) => {
  // Si requiere seguimiento, debe tener fecha
  if (data.follow_up_required && !data.follow_up_date) {
    return false;
  }
  return true;
}, {
  message: "Si requiere seguimiento, debe especificar una fecha",
  path: ["follow_up_date"]
});

type LogFormData = z.infer<typeof logFormSchema>;

// ================================================================
// PROPS E INTERFACES
// ================================================================

interface LogFormProps {
  log?: DailyLog;
  childId?: string;
  mode: 'create' | 'edit';
  onSuccess?: (log: DailyLog) => void;
  onCancel?: () => void;
}

interface MoodSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

interface AttachmentsManagerProps {
  attachments: LogAttachment[];
  onChange: (attachments: LogAttachment[]) => void;
  childId: string;
}

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const moods = [
    { value: 1, emoji: '😢', label: 'Muy triste', color: 'text-red-500' },
    { value: 2, emoji: '😕', label: 'Triste', color: 'text-orange-500' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { value: 4, emoji: '😊', label: 'Feliz', color: 'text-green-500' },
    { value: 5, emoji: '😄', label: 'Muy feliz', color: 'text-blue-500' }
  ];

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Estado de Ánimo</Label>
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(value === mood.value ? undefined : mood.value)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
              value === mood.value 
                ? 'bg-white shadow-md scale-110' 
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className={`text-xs font-medium ${mood.color}`}>
              {mood.value}
            </span>
            <span className="text-xs text-gray-600 mt-1">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
      {value && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="text-gray-500"
          >
            Limpiar selección
          </Button>
        </div>
      )}
    </div>
  );
}

function AttachmentsManager({ attachments, onChange, childId }: AttachmentsManagerProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    try {
      setUploading(true);
      const newAttachments: LogAttachment[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${childId}/${Date.now()}-${file.name}`;
        
        await uploadFile('attachments', fileName, file);
        const url = getPublicUrl('attachments', fileName);
        
        let type: LogAttachment['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        
        newAttachments.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          url,
          type,
          size: file.size
        });
      }

      onChange([...attachments, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: LogAttachment['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return FileIcon;
      case 'audio': return FileIcon;
      default: return FileIcon;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Archivos Adjuntos</Label>
        <Label htmlFor="attachment-upload" className="cursor-pointer">
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
            <UploadIcon className="h-4 w-4" />
            <span className="text-sm">
              {uploading ? 'Subiendo...' : 'Agregar Archivos'}
            </span>
          </div>
        </Label>
        <input
          id="attachment-upload"
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const IconComponent = getFileIcon(attachment.type);
            return (
              <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {attachment.type === 'image' ? (
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {attachment.type}
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <FileIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No hay archivos adjuntos</p>
          <p className="text-sm">Agrega imágenes, videos o documentos</p>
        </div>
      )}
    </div>
  );
}

function TagsInput({ tags, onChange }: TagsInputProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        <TagIcon className="h-4 w-4 inline mr-2" />
        Etiquetas
      </Label>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-sm">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => removeTag(tag)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          placeholder="Agregar etiqueta..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function LogForm({ log, childId, mode, onSuccess, onCancel }: LogFormProps) {
  const { children } = useChildren();
  const { createLog, updateLog } = useLogs();
  const [categories, setCategories] = useState<Category[]>([]);
  const [setLoadingCategories] = useState(true);
  const router = useRouter();

  const form = useForm<LogFormData>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      child_id: log?.child_id || childId || '',
      category_id: log?.category_id || '',
      title: log?.title || '',
      content: log?.content || '',
      mood_score: log?.mood_score || undefined,
      intensity_level: log?.intensity_level || 'medium',
      log_date: log?.log_date || format(new Date(), 'yyyy-MM-dd'),
      is_private: log?.is_private || false,
      tags: log?.tags || [],
      location: log?.location || '',
      weather: log?.weather || '',
      follow_up_required: log?.follow_up_required || false,
      follow_up_date: log?.follow_up_date || '',
      attachments: log?.attachments || []
    }
  });

  // Cargar categorías
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  const onSubmit = async (data: LogFormData) => {
    try {
      let result: DailyLog;
      
      if (mode === 'create') {
        result = await createLog(data as LogInsert);
      } else {
        result = await updateLog(log!.id, data as LogUpdate);
      }

      onSuccess?.(result);
      
      if (!onSuccess) {
        router.push(`/dashboard/logs/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const selectedChild = children.find(child => child.id === form.watch('child_id'));
  const followUpRequired = form.watch('follow_up_required');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Nuevo Registro' : 'Editar Registro'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'create' 
              ? 'Documenta un evento o actividad importante'
              : 'Actualiza la información del registro'
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
            {mode === 'create' ? 'Crear' : 'Guardar'} Registro
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Child Selection & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Selecciona el niño y proporciona los detalles del registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child Selection */}
              <FormField
                control={form.control}
                name="child_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niño *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un niño" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={child.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {child.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{child.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show selected child info */}
              {selectedChild && (
                <div className="p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedChild.avatar_url} />
                    <AvatarFallback className="bg-blue-200 text-blue-700">
                      {selectedChild.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedChild.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        {selectedChild.relationship_type}
                      </Badge>
                      {selectedChild.birth_date && (
                        <span>
                          {Math.floor((Date.now() - new Date(selectedChild.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} años
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Category and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="log_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha del Registro</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          max={format(new Date(), 'yyyy-MM-dd')}
                          min={format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Fecha en que ocurrió el evento (máximo 30 días atrás)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Registro *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Excelente participación en clase de matemáticas"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Describe brevemente el evento o actividad registrada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Detallada *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe detalladamente lo que observaste, incluyendo contexto, comportamientos específicos, y cualquier factor relevante..."
                        rows={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Proporciona una descripción completa y objetiva del evento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mood and Intensity */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Emocional y Nivel</CardTitle>
              <CardDescription>
                Evalúa el estado emocional y la intensidad del evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Score */}
              <FormField
                control={form.control}
                name="mood_score"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MoodSelector 
                        value={field.value} 
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Intensity Level */}
              <FormField
                control={form.control}
                name="intensity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Intensidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>Bajo - Evento leve o rutinario</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span>Medio - Evento notable</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span>Alto - Evento significativo</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
              <CardDescription>
                Agrega contexto adicional, etiquetas y archivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TagsInput 
                        tags={field.value} 
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location and Weather */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <MapPinIcon className="h-4 w-4 inline mr-2" />
                        Ubicación
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Aula de clase, Patio de recreo, Casa"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <CloudIcon className="h-4 w-4 inline mr-2" />
                        Clima/Ambiente
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Soleado, Lluvioso, Tranquilo"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Attachments */}
              {selectedChild && (
                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AttachmentsManager
                          attachments={field.value}
                          onChange={field.onChange}
                          childId={selectedChild.id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Privacy and Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle>Privacidad y Seguimiento</CardTitle>
              <CardDescription>
                Configura la privacidad del registro y programa seguimientos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Privacy Setting */}
              <FormField
                control={form.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        {field.value ? (
                          <EyeOffIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <EyeIcon className="h-4 w-4 mr-2" />
                        )}
                        Registro Privado
                      </FormLabel>
                      <FormDescription>
                        Solo tú podrás ver este registro. Los registros privados no se comparten con otros usuarios.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Follow-up Required */}
              <FormField
                control={form.control}
                name="follow_up_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Requiere Seguimiento
                      </FormLabel>
                      <FormDescription>
                        Marca este registro para seguimiento futuro y establecer recordatorios.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Follow-up Date */}
              {followUpRequired && (
                <FormField
                  control={form.control}
                  name="follow_up_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Seguimiento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={format(new Date(), 'yyyy-MM-dd')}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Fecha en la que se debe hacer seguimiento a este registro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          {/** Extract label for submit button to avoid nested ternary */}
          {(() => {
            let submitLabel = '';
            if (form.formState.isSubmitting) {
              submitLabel = 'Guardando...';
            } else if (mode === 'create') {
              submitLabel = 'Crear Registro';
            } else {
              submitLabel = 'Guardar Cambios';
            }
            return (
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
                  {submitLabel}
                </Button>
              </div>
            );
          })()}
        </form>
      </Form>
    </div>
  );
}