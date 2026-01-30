// src/app/dashboard/export/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table, Settings } from 'lucide-react';

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    
    // Aquí iría la lógica real de exportación
    console.log(`Exportando en formato: ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exportar Datos</h1>
          <p className="mt-2 text-gray-600">
            Descarga y comparte informes de seguimiento
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="h-5 w-5 mr-2" />
              Exportar CSV
            </CardTitle>
            <CardDescription>
              Datos tabulares para análisis en Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Exporta todos los registros en formato CSV compatible con Excel y otras herramientas de análisis.
            </p>
            <Button 
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Descargar CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* PDF Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Exportar PDF
            </CardTitle>
            <CardDescription>
              Reporte formateado para presentación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Genera un reporte completo en PDF con gráficos y análisis para compartir con especialistas.
            </p>
            <Button 
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Generando...' : 'Generar PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración de Exportación
          </CardTitle>
          <CardDescription>
            Próximamente - Opciones avanzadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm">
              Opciones de filtrado, rango de fechas y selección de campos en desarrollo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}