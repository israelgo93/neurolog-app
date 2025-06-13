// ================================================================
// src/app/dashboard/logs/[id]/page.tsx
// Página de detalles de log específico
// ================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLogs } from '@/hooks/use-logs';
import type { LogWithDetails, IntensityLevel } from '@/types';
import { 
  EditIcon,
  MoreVerticalIcon,
  CalendarIcon,
  HeartIcon,
  MapPinIcon,
  CloudIcon,
  FileIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
  ArrowLeftIcon,
  UserIcon,
  TagIcon,
  ThermometerIcon,
  ReplyIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const logId = params.id as string;
  const { user } = useAuth();
  const { loading, getLogById, addParentFeedback, markAsReviewed } = useLogs();  
  const [log, setLog] = useState<LogWithDetails | null>(null);
  const [feedback, setFeedback] = useState('');
  const [specialistNotes, setSpecialistNotes] = useState('');
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (logId && !loading) {
      const foundLog = getLogById(logId);
      setLog(foundLog || null);
    }
  }, [logId, loading, getLogById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Registro no encontrado</h2>
        <p className="text-gray-600 mt-2">El registro que buscas no existe o no tienes permisos para verlo.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/logs">Volver a registros</Link>
        </Button>
      </div>
    );
  }

  const getIntensityColor = (level: IntensityLevel) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 1) return '😢';
    if (score <= 2) return '😔';
    if (score <= 3) return '😐';
    if (score <= 4) return '😊';
    return '😄';
  };

  const getMoodDescription = (score: number) => {
    if (score <= 2) return 'Necesita atención';
    if (score <= 3) return 'Normal';
    return 'Muy positivo';
  };

  const handleAddFeedback = async () => {
    if (!feedback.trim()) return;
    
    try {
      await addParentFeedback(log.id, feedback);
      setFeedback('');
      setIsAddingFeedback(false);
      // Refresh log data
      const updatedLog = getLogById(logId);
      setLog(updatedLog || null);
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  const handleMarkAsReviewed = async () => {
    try {
      await markAsReviewed(log.id, specialistNotes);
      setSpecialistNotes('');
      setIsReviewing(false);
      // Refresh log data
      const updatedLog = getLogById(logId);
      setLog(updatedLog || null);
    } catch (error) {
      console.error('Error marking as reviewed:', error);
    }
  };

  const canReview = user?.role === 'specialist' && !log.reviewed_by;
  const canAddFeedback = user?.role === 'parent' || user?.role === 'family';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Registro de {log.child_name}
            </h1>
            <p className="text-gray-600">
              {format(new Date(log.created_at), 'dd MMMM yyyy \'a las\' HH:mm', { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {log.can_edit && (
            <Button variant="outline" size="sm">
              <EditIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Agregar comentario
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileIcon className="h-4 w-4 mr-2" />
                Adjuntar archivo
              </DropdownMenuItem>
              {!log.reviewed_by && user?.role === 'specialist' && (
                <DropdownMenuItem onClick={() => setIsReviewing(true)}>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Marcar como revisado
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                Reportar problema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Log Details */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: log.category_color }}
                  />
                  <div>
                    <CardTitle className="text-lg">{log.category_name || 'Sin categoría'}</CardTitle>
                    <CardDescription>
                      Registrado por {log.logged_by_name}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {log.is_private && (
                    <Badge variant="secondary">
                      <EyeOffIcon className="h-3 w-3 mr-1" />
                      Privado
                    </Badge>
                  )}
                  {log.intensity_level && (
                    <Badge className={getIntensityColor(log.intensity_level)}>
                      {log.intensity_level === 'low' && 'Baja'}
                      {log.intensity_level === 'medium' && 'Media'}
                      {log.intensity_level === 'high' && 'Alta'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Content */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700 leading-relaxed">{log.content}</p>
              </div>

              {/* Mood Score */}
              {log.mood_score && (
                <div>
                  <p className="text-sm text-gray-600">
                    {getMoodDescription(log.mood_score)}
                  </p>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{log.mood_score}/5</p>
                    <p className="text-sm text-gray-600">
                      {log.mood_score <= 2 ? 'Necesita atención' : 
                       log.mood_score <= 3 ? 'Normal' : 'Muy positivo'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {log.tags && log.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    {log.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Ubicación</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {log.location}
                    </div>
                  </div>
                )}

                {log.weather && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Clima</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <CloudIcon className="h-4 w-4 mr-1" />
                      {log.weather}
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up */}
              {log.follow_up_required && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="text-sm font-medium text-orange-900">Seguimiento requerido</h4>
                  </div>
                  {log.follow_up_date && (
                    <p className="text-sm text-orange-700 mt-1">
                      Programado para {format(new Date(log.follow_up_date), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  )}
                </div>
              )}

              {/* Review Status */}
              {log.reviewed_by ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="text-sm font-medium text-green-900">Revisado por especialista</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Revisado por {log.reviewer_name} el {format(new Date(log.reviewed_at!), 'dd MMM yyyy', { locale: es })}
                  </p>
                  {log.specialist_notes && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-green-900">Notas del especialista:</h5>
                      <p className="text-sm text-green-700 mt-1">{log.specialist_notes}</p>
                    </div>
                  )}
                </div>
              ) : canReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-900">Pendiente de revisión</h4>
                    </div>
                    <Button size="sm" onClick={() => setIsReviewing(true)}>
                      Revisar ahora
                    </Button>
                  </div>
                </div>
              )}

              {/* Specialist Review Form */}
              {isReviewing && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Revisión de especialista</h4>
                    <Textarea
                      placeholder="Agregar notas de revisión (opcional)..."
                      value={specialistNotes}
                      onChange={(e) => setSpecialistNotes(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleMarkAsReviewed}>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Marcar como revisado
                      </Button>
                      <Button variant="outline" onClick={() => setIsReviewing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Feedback */}
              {log.parent_feedback && (
                <div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Comentarios de padres</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{log.parent_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Feedback Form */}
              {canAddFeedback && !log.parent_feedback && (
                <div>
                  <Separator />
                  {isAddingFeedback ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Agregar comentario</h4>
                      <Textarea
                        placeholder="Comparte tu perspectiva sobre este registro..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleAddFeedback} disabled={!feedback.trim()}>
                          <ReplyIcon className="h-4 w-4 mr-2" />
                          Enviar comentario
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingFeedback(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setIsAddingFeedback(true)}>
                      <MessageSquareIcon className="h-4 w-4 mr-2" />
                      Agregar comentario
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Niño</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={log.child_avatar_url} />
                      <AvatarFallback className="text-xs">
                        {log.child_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-gray-900">{log.child_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registrado por</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={log.logged_by_avatar} />
                      <AvatarFallback className="text-xs">
                        {log.logged_by_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-gray-900">{log.logged_by_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha y hora</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>

                {log.updated_at !== log.created_at && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última modificación</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(log.updated_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/dashboard/children/${log.child_id}`}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Ver perfil del niño
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Programar seguimiento
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileIcon className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}