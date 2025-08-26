import React from 'react';
import ReportList from '@/components/reports/ReportList';
import { ReportData } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

async function getReportsData(): Promise<ReportData[]> {
  try {
    const reportsDir = path.join(process.cwd(), 'data', 'reports');
    const files = await fs.readdir(reportsDir);
    
    const reportFiles = files.filter(file => file.endsWith('.json'));
    const reports: ReportData[] = [];
    
    for (const file of reportFiles) {
      try {
        const content = await fs.readFile(path.join(reportsDir, file), 'utf-8');
        const reportData = JSON.parse(content);
        reports.push(reportData);
      } catch (error) {
        console.error(`Error loading report ${file}:`, error);
      }
    }
    
    // Ordenar por fecha de generación (más recientes primero)
    return reports.sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  } catch (error) {
    console.error('Error loading reports:', error);
    return [];
  }
}

export default async function ReportsPage() {
  const reports = await getReportsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <ReportList reports={reports} />
    </div>
  );
}

export const metadata = {
  title: 'Reportes de Costos - Procesamiento Automático',
  description: 'Reportes generados automáticamente desde PDFs de Google Drive usando Claude AI',
};
