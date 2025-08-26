#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { DriveService } from '../src/lib/driveService'
import { ClaudeService } from '../src/lib/claudeService'

// Cargar variables de entorno
dotenv.config()

async function testAllConnections() {
  console.log('🔍 Probando todas las conexiones del sistema...\n')

  // Validar variables de entorno requeridas
  const requiredEnvVars = ['GOOGLE_DRIVE_CREDENTIALS', 'CLAUDE_API_KEY']

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missingVars.forEach((varName) => console.error(`   - ${varName}`))
    process.exit(1)
  }

  const results = {
    googleDrive: false,
    claude: false,
    errors: [] as string[]
  }

  // Test 1: Google Drive
  console.log('📄 TEST 1: Google Drive Connection')
  console.log('='.repeat(40))

  try {
    const driveService = new DriveService()
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    console.log(`📁 Folder ID: ${folderId || 'Root folder (todos los PDFs)'}`)

    const files = await driveService.listPDFs(folderId)

    if (files.length === 0) {
      console.log('⚠️  No se encontraron PDFs en Google Drive')
      console.log('💡 Esto puede ser normal si la carpeta está vacía')
      results.googleDrive = true // Consideramos exitoso si se conecta
    } else {
      console.log(`✅ Conexión exitosa! Encontrados ${files.length} PDFs:`)
      files.slice(0, 3).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.size || 'N/A'} bytes)`)
      })
      if (files.length > 3) {
        console.log(`   ... y ${files.length - 3} archivos más`)
      }
      results.googleDrive = true
    }
  } catch (error) {
    console.error('❌ Error en Google Drive:', error)
    results.errors.push(`Google Drive: ${error}`)
  }

  console.log('')

  // Test 2: Claude API
  console.log('🤖 TEST 2: Claude API Connection')
  console.log('='.repeat(40))

  try {
    const claudeService = new ClaudeService()

    // Crear un PDF de prueba simple
    const testPdfData = {
      name: 'test-connection.pdf',
      content: Buffer.from('Test PDF content for connection testing').toString('base64'),
      modifiedTime: new Date().toISOString(),
      id: 'test-connection-id'
    }

    const response = await claudeService.processPDF(testPdfData)

    if (response.success) {
      console.log('✅ Conexión con Claude API exitosa!')
      console.log(`📄 Archivo procesado: ${response.reportData.name}`)
      console.log(`💰 Costo total: ${response.reportData.currency} ${response.reportData.totalCost}`)
      results.claude = true
    } else {
      console.error('❌ Error en Claude API:', response.error)
      results.errors.push(`Claude API: ${response.error}`)
    }
  } catch (error) {
    console.error('❌ Error en Claude API:', error)
    results.errors.push(`Claude API: ${error}`)
  }

  // Resumen final
  console.log('\n📊 RESUMEN FINAL')
  console.log('='.repeat(50))

  console.log(`📄 Google Drive: ${results.googleDrive ? '✅ Conectado' : '❌ Error'}`)
  console.log(`🤖 Claude API: ${results.claude ? '✅ Conectado' : '❌ Error'}`)

  if (results.errors.length > 0) {
    console.log('\n❌ Errores encontrados:')
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`)
    })
  }

  if (results.googleDrive && results.claude) {
    console.log('\n🎉 ¡Todas las conexiones funcionando correctamente!')
    console.log('🚀 El sistema está listo para procesar PDFs')
  } else {
    console.log('\n⚠️  Algunas conexiones fallaron')
    console.log('🔧 Revisa los errores arriba y configura las credenciales correctamente')
    process.exit(1)
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n⏹️  Test interrumpido por el usuario')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⏹️  Test terminado')
  process.exit(0)
})

// Ejecutar test
if (require.main === module) {
  testAllConnections().catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}
