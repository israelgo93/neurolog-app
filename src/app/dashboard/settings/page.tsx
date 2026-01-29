// src/app/dashboard/settings/page.tsx
// Página de configuración CORREGIDA - Usa el contexto de usuario correcto

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/use-toast'
import { 
  User, 
  Bell, 
  Shield, 
  Download,
  Trash2,
  Save,
  Eye,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  // ✅ CORREGIDO: Usar 'user' en lugar de 'profile'
  const { user, updateProfile, refreshUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // ✅ Estado del perfil inicializado correctamente desde el usuario
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: 'parent' as const
  })

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: false,
    weeklyReports: true,
    dataSharing: false
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // ✅ EFECTO PARA SINCRONIZAR DATOS DEL USUARIO
  useEffect(() => {
    if (user) {
      console.log('👤 Setting profile data from user:', user.full_name);
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'parent'
      })
    }
  }, [user])

  // ✅ FUNCIÓN CORREGIDA PARA GUARDAR PERFIL
  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // ✅ USAR updateProfile del contexto
      await updateProfile({
        full_name: profileData.full_name,
        role: profileData.role,
        updated_at: new Date().toISOString()
      })
      
      toast({
        title: "¡Perfil actualizado!",
        description: "Los cambios se han guardado correctamente.",
      })
      
      setIsEditing(false)
      
      // ✅ Refrescar datos del usuario
      await refreshUser()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudieron guardar los cambios.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    // ✅ Restaurar datos originales del usuario
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'parent'
      })
    }
    setIsEditing(false)
  }

  const handleExportData = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay datos de usuario para exportar.",
        variant: "destructive"
      })
      return
    }

    const userData = {
      perfil: {
        id: user.id,
        nombre_completo: user.full_name,
        email: user.email,
        rol: user.role,
        fecha_registro: user.created_at,
        ultima_actualizacion: user.updated_at
      },
      preferencias: preferences,
      fecha_exportacion: new Date().toISOString()
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `datos_neurolog_${user.full_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Datos exportados",
      description: "Tus datos se han descargado correctamente.",
    })
  }

  // ✅ MOSTRAR LOADING SI NO HAY USUARIO O ESTÁ CARGANDO
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu perfil y preferencias de la aplicación
        </p>
      </div>

      {/* ✅ INFORMACIÓN DEL USUARIO ACTUAL */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user.full_name || 'Usuario'}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">
                {user.role === 'parent' ? 'Padre/Madre' :
                 user.role === 'teacher' ? 'Docente' :
                 user.role === 'specialist' ? 'Especialista' : 
                 user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil de Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Información del Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal y configuración de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled={true} // Email no se puede cambiar
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                El correo electrónico no se puede modificar
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol en la aplicación</Label>
            <Select 
              value={profileData.role} 
              onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value as any }))}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Padre/Madre</SelectItem>
                <SelectItem value="teacher">Docente</SelectItem>
                <SelectItem value="specialist">Especialista</SelectItem>
                {user.role === 'admin' && (
                  <SelectItem value="admin">Administrador</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Preferencias de Notificaciones
          </CardTitle>
          <CardDescription>
            Controla cómo y cuándo recibes notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones en la app</Label>
              <p className="text-sm text-gray-500">
                Recibir notificaciones dentro de la aplicación
              </p>
            </div>
            <Switch
              checked={preferences.notifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, notifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Alertas por email</Label>
              <p className="text-sm text-gray-500">
                Recibir alertas importantes por correo electrónico
              </p>
            </div>
            <Switch
              checked={preferences.emailAlerts}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, emailAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reportes semanales</Label>
              <p className="text-sm text-gray-500">
                Recibir resumen semanal de actividades
              </p>
            </div>
            <Switch
              checked={preferences.weeklyReports}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, weeklyReports: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacidad y Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacidad y Datos
          </CardTitle>
          <CardDescription>
            Gestiona tus datos y configuración de privacidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Compartir datos para investigación</Label>
              <p className="text-sm text-gray-500">
                Permitir uso anónimo de datos para mejorar el servicio
              </p>
            </div>
            <Switch
              checked={preferences.dataSharing}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, dataSharing: checked }))
              }
            />
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar mis datos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Descarga una copia de todos tus datos en formato JSON
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Trash2 className="h-5 w-5 mr-2" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectan tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar cuenta
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Funcionalidad disponible próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}