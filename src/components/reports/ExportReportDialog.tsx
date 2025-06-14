// ================================================================
// src/components/reports/ExportReportDialog.tsx
// Diálogo para exportar reportes
// ================================================================

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Mail } from 'lucide-react';

interface ExportReportDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly data: any[];
  readonly metrics: any;
}

export function ExportReportDialog({ open, onOpenChange, data, metrics }: ExportReportDialogProps) {
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Implementar lógica real de exportación
      if (format === 'csv') {
        // Exportar como CSV
        const csvRows = [
          Object.keys(data[0] ?? {}).join(','), // encabezados
          ...data.map(row => Object.values(row).join(','))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        // Exportar como Excel (XLSX simple usando SheetJS si está disponible)
        // Si no tienes SheetJS, puedes dejar esto como un placeholder o instalarlo
        // npm install xlsx
        try {
          // @ts-ignore
          const XLSX = await import('xlsx');
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reporte.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          alert('No se pudo exportar a Excel. Asegúrate de tener SheetJS instalado.');
          console.error('Error exporting to Excel:', e);
        }
      } else if (format === 'pdf') {
        // Exportar como PDF (simple usando window.print o jsPDF si está disponible)
        // npm install jspdf
        try {
          // @ts-ignore
          const jsPDF = (await import('jspdf')).jsPDF;
          const doc = new jsPDF();
          doc.text('Reporte', 10, 10);
          doc.text(JSON.stringify(data, null, 2), 10, 20);
          doc.save('reporte.pdf');
        } catch (e) {
          alert('No se pudo exportar a PDF. Asegúrate de tener jsPDF instalado.');
          console.error('Error exporting to PDF:', e);
        }
      }
      
      console.log('Exportando reporte:', {
        format,
        includeCharts,
        includeRawData,
        sendByEmail,
        recordCount: data.length
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Reporte</DialogTitle>
          <DialogDescription>
            Configura las opciones de exportación para tu reporte personalizado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="format-select" className="text-sm font-medium text-gray-700 mb-2 block">
              Formato
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF - Reporte visual</SelectItem>
                <SelectItem value="excel">Excel - Datos y gráficos</SelectItem>
                <SelectItem value="csv">CSV - Solo datos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <label htmlFor="charts" className="text-sm font-medium text-gray-700 block">
              Incluir en el reporte
            </label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts" 
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <label htmlFor="charts" className="text-sm text-gray-700">
                Gráficos y visualizaciones
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rawdata" 
                checked={includeRawData}
                onCheckedChange={(checked) => setIncludeRawData(checked === true)}
              />
              <label htmlFor="rawdata" className="text-sm text-gray-700">
                Datos detallados por registro
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="email" 
                checked={sendByEmail}
                onCheckedChange={(checked) => setSendByEmail(checked === true)}
              />
              <label htmlFor="email" className="text-sm text-gray-700">
                Enviar por correo electrónico
              </label>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Resumen:</strong> {data.length} registros, {Object.keys(metrics).length} métricas
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              'Generando...'
            ) : (
              <>
                {sendByEmail ? <Mail className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                {sendByEmail ? 'Enviar Reporte' : 'Descargar Reporte'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}