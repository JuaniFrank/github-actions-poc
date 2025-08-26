#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { ReportGenerator } from '../src/lib/reportGenerator'

// Cargar variables de entorno
dotenv.config()

async function main() {
  console.log('🚀 Iniciando procesamiento automático de PDFs...\n')

  // Validar variables de entorno requeridas
  const requiredEnvVars = ['CLAUDE_API_KEY', 'GOOGLE_DRIVE_CREDENTIALS']

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missingVars.forEach((varName) => console.error(`   - ${varName}`))
    process.exit(1)
  }

  try {
    const generator = new ReportGenerator()

    // Obtener folder ID de Google Drive desde variables de entorno (opcional)
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    console.log('📋 Configuración:')
    console.log(`   📁 Folder ID: ${folderId || 'Root folder'}`)
    console.log(`   🤖 Claude API: Configurada`)
    console.log(`   📄 Google Drive: Configurado\n`)

    // Procesar PDFs
    const result = await generator.processNewPDFs(folderId)

    // Mostrar resultados
    console.log('\n📊 RESUMEN DEL PROCESAMIENTO:')
    console.log('='.repeat(50))

    if (result.success) {
      console.log(`✅ Estado: Exitoso`)
      console.log(`📄 Archivos procesados: ${result.processedFiles.length}`)
      console.log(`📊 Nuevos reportes: ${result.newReports.length}`)

      if (result.processedFiles.length > 0) {
        console.log('\n📋 Archivos procesados:')
        result.processedFiles.forEach((file) => console.log(`   ✅ ${file}`))
      }

      if (result.newReports.length > 0) {
        console.log('\n📊 Reportes generados:')
        result.newReports.forEach((report) => {
          console.log(`   📈 ${report.name} - ${report.currency} ${report.totalCost.toLocaleString()}`)
        })
      }
    } else {
      console.log(`❌ Estado: Fallido`)
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errores encontrados:')
      result.errors.forEach((error) => console.log(`   ⚠️  ${error}`))
    }

    // Exit code basado en el resultado
    process.exit(result.success ? 0 : 1)
  } catch (error) {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n⏹️  Procesamiento interrumpido por el usuario')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⏹️  Procesamiento terminado')
  process.exit(0)
})

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error no manejado:', error)
    process.exit(1)
  })
}
