// src/components/ui/skeleton.tsx
// Componente Skeleton para NeuroLog - Compatible con shadcn/ui

import { cn } from "@/lib/utils"

// Contador global para generar IDs únicos
let globalCounter = 0;

// Función helper para generar IDs únicos de forma segura
function generateSecureId(): string {
  // Usar crypto.getRandomValues() si está disponible (navegador)
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return `skeleton-${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`;
  }
  
  // Fallback más seguro usando timestamp y contador
  const timestamp = Date.now();
  globalCounter = (globalCounter + 1) % 999999; // Resetear el contador después de 999999
  const randomSuffix = (timestamp * globalCounter).toString(36);
  return `skeleton-${timestamp}-${randomSuffix}`;
}

function Skeleton({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
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
  // Generar IDs únicos para cada línea de skeleton usando crypto seguro
  const skeletonLines = Array.from({ length: lines }, (_, i) => ({
    id: generateSecureId(),
    isLastLine: i === lines - 1
  }));

  return (
    <div className="space-y-2">
      {skeletonLines.map((line) => (
        <Skeleton 
          key={line.id}
          className={cn(
            "h-4",
            line.isLastLine ? "w-[80%]" : "w-full"
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