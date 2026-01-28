// src/components/ui/skeleton.tsx
// Componente Skeleton para NeuroLog - Compatible con shadcn/ui

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

// Componentes de Skeleton específicos para NeuroLog
function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 border border-border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-[90%]" />
      <Skeleton className="h-8 w-[95%]" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  )
}

function SkeletonAvatar() {
  return <Skeleton className="h-8 w-8 rounded-full" />
}

function SkeletonText({ lines = 3 }: Readonly<{ lines?: number }>) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={crypto.randomUUID()} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-[80%]" : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonChart, 
  SkeletonAvatar, 
  SkeletonText 
}