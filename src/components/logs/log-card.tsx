// src/components/logs/log-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditLogDialog } from './edit-log-dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Edit, Star, Clock, User } from 'lucide-react'

interface LogWithDetails {
  id: string
  title: string
  content: string
  mood_score: number | null
  intensity_level: 'low' | 'medium' | 'high'
  log_date: string
  created_at: string
  child_name: string
  category_name: string | null
  category_color: string
  logged_by_name: string
  can_edit: boolean
}

interface LogCardProps {
  log: LogWithDetails
}

export function LogCard({ log }: LogCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const intensityConfig = {
    low: { label: 'Baja', color: 'bg-green-100 text-green-800' },
    medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800' }
  }

  const moodStars = log.mood_score ? [...Array(5)].map((_, i) => (
    <Star
      key={`star-${log.id}-${i}`}
      className={`h-3 w-3 ${
        i < log.mood_score! 
          ? 'text-yellow-400 fill-yellow-400' 
          : 'text-gray-300'
      }`}
    />
  )) : null

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div 
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: log.category_color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {log.title}
                  </h3>
                  {log.category_name && (
                    <Badge variant="secondary" className="text-xs">
                      {log.category_name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{log.child_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(log.log_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(log.created_at), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-3">
                  {log.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {log.mood_score && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Estado:</span>
                        <div className="flex">{moodStars}</div>
                      </div>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={intensityConfig[log.intensity_level].color}
                    >
                      {intensityConfig[log.intensity_level].label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Por: {log.logged_by_name}</span>
                    {log.can_edit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        className="h-7 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <EditLogDialog
        log={log}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}