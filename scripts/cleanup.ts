#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';

async function cleanup() {
  console.log('🧹 Iniciando limpieza del sistema...\n');

  try {
    // Limpiar directorio de reportes
    const reportsDir = path.join(process.cwd(), 'src', 'components', 'reports');
    const dataReportsDir = path.join(process.cwd(), 'data', 'reports');
    
    console.log('📁 Limpiando directorio de reportes...');
    
    try {
      const files = await fs.readdir(reportsDir);
      for (const file of files) {
        if (file.startsWith('Report_') && file.endsWith('.tsx')) {
          await fs.unlink(path.join(reportsDir, file));
          console.log(`   🗑️  Eliminado: ${file}`);
        }
      }
         } catch {
       console.log('   ℹ️  Directorio de reportes no existe o está vacío');
     }

    // Limpiar datos de reportes
    console.log('📊 Limpiando datos de reportes...');
    try {
      const files = await fs.readdir(dataReportsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(dataReportsDir, file));
          console.log(`   🗑️  Eliminado: ${file}`);
        }
      }
         } catch {
       console.log('   ℹ️  Directorio de datos no existe o está vacío');
     }

    // Resetear archivo de control
    console.log('📝 Reseteando archivo de control...');
    const controlData = {
      processed: [],
      lastUpdated: new Date().toISOString(),
    };
    
    await fs.writeFile(
      path.join(process.cwd(), 'control.json'),
      JSON.stringify(controlData, null, 2),
      'utf-8'
    );
    console.log('   ✅ Archivo de control reseteado');

    // Actualizar índice de reportes
    console.log('📋 Actualizando índice de reportes...');
    const indexContent = [
      '// Auto-generated reports index',
      '// This file is automatically updated by the PDF processing workflow',
      '',
      'export { default as ReportList } from \'./ReportList\';',
    ].join('\n');

    await fs.writeFile(
      path.join(reportsDir, 'index.ts'),
      indexContent,
      'utf-8'
    );
    console.log('   ✅ Índice de reportes actualizado');

    console.log('\n🎉 Limpieza completada exitosamente!');
    console.log('📋 El sistema está listo para procesar nuevos PDFs');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar limpieza
if (require.main === module) {
  cleanup().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}
