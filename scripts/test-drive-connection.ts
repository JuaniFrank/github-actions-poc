#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { DriveService } from '../src/lib/driveService'

// Cargar variables de entorno
dotenv.config()

async function testDriveConnection() {
  console.log('🔍 Probando conexión con Google Drive...\n')

  // Validar variables de entorno requeridas
  const requiredEnvVars = ['GOOGLE_DRIVE_CREDENTIALS']

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missingVars.forEach((varName) => console.error(`   - ${varName}`))
    process.exit(1)
  }

  try {
    const driveService = new DriveService()

    // Obtener folder ID de Google Drive desde variables de entorno (opcional)
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    console.log('📋 Configuración:')
    console.log(`   📁 Folder ID: ${folderId || 'Root folder (todos los PDFs)'}`)
    console.log(`   📄 Google Drive: Configurado\n`)

    // Listar PDFs
    console.log('🔍 Buscando PDFs en Google Drive...')
    const files = await driveService.listPDFs(folderId)

    console.log('\n📊 RESULTADOS:')
    console.log('='.repeat(50))

    if (files.length === 0) {
      console.log('📭 No se encontraron PDFs en Google Drive')
      console.log('💡 Asegúrate de que:')
      console.log('   - Las credenciales sean correctas')
      console.log('   - La carpeta tenga permisos de lectura')
      console.log('   - Existan PDFs en la carpeta especificada')
    } else {
      console.log(`✅ Conexión exitosa! Encontrados ${files.length} PDFs:\n`)

      files.forEach((file, index) => {
        console.log(`${index + 1}. 📄 ${file.name}`)
        console.log(`   🆔 ID: ${file.id}`)
        console.log(`   📅 Modificado: ${new Date(file.modifiedTime).toLocaleString()}`)
        console.log(`   📏 Tamaño: ${file.size ? `${file.size} bytes` : 'No disponible'}`)
        console.log('')
      })

      console.log('🎉 ¡Conexión con Google Drive funcionando correctamente!')
    }

    // Probar descarga de un archivo (opcional)
    if (files.length > 0) {
      console.log('\n🧪 Probando descarga del primer archivo...')
      try {
        const firstFile = files[0]
        const buffer = await driveService.downloadPDF(firstFile.id)
        console.log(`✅ Descarga exitosa: ${firstFile.name} (${buffer.length} bytes)`)
      } catch (error) {
        console.error(`❌ Error en descarga: ${error}`)
      }
    }
  } catch (error) {
    console.error('\n❌ Error al conectar con Google Drive:', error)
    console.log('\n🔧 Solución de problemas:')
    console.log('1. Verifica que las credenciales de Google Drive sean correctas')
    console.log('2. Asegúrate de que la API de Google Drive esté habilitada')
    console.log('3. Verifica que la cuenta de servicio tenga permisos de lectura')
    console.log('4. Comprueba que la carpeta especificada exista y sea accesible')
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
  testDriveConnection().catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}
