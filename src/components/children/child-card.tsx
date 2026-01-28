// src/components/children/child-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EditChildDialog } from './edit-child-dialog'
import { differenceInYears } from 'date-fns'
import { Calendar, Edit, Eye, FileText } from 'lucide-react'
import Link from 'next/link'

interface ChildWithRelation {
  id: string
  name: string
  birth_date: string | null
  diagnosis: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  relationship_type: string
  can_edit: boolean
  can_view: boolean
}

interface ChildCardProps {
  child: ChildWithRelation
}

export function ChildCard({ child }: Readonly<ChildCardProps>) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const age = child.birth_date 
    ? differenceInYears(new Date(), new Date(child.birth_date))
    : null

  const relationshipColors = {
    parent: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    specialist: 'bg-purple-100 text-purple-800',
    observer: 'bg-gray-100 text-gray-800'
  }

  const relationshipLabels = {
    parent: 'Padre/Madre',
    teacher: 'Docente',
    specialist: 'Especialista',
    observer: 'Observador'
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {child.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{child.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {age !== null && (
                    <>
                      <Calendar className="h-3 w-3" />
                      {age} años
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={relationshipColors[child.relationship_type as keyof typeof relationshipColors]}
            >
              {relationshipLabels[child.relationship_type as keyof typeof relationshipLabels]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {child.diagnosis && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
              <p className="text-sm text-gray-600">{child.diagnosis}</p>
            </div>
          )}

          {child.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
              <p className="text-sm text-gray-600 line-clamp-3">{child.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              {child.can_edit ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Puede editar
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Solo lectura
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/children/${child.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Link>
              </Button>
              
              {child.can_edit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/logs?child=${child.id}`}>
                  <FileText className="h-3 w-3 mr-1" />
                  Logs
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditChildDialog
        child={child}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}
