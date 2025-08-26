#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { ClaudeService } from '../src/lib/claudeService'

// Cargar variables de entorno
dotenv.config()

async function testClaudeConnection() {
  console.log('🤖 Probando conexión con Claude API...\n')

  // Validar variables de entorno requeridas
  const requiredEnvVars = ['CLAUDE_API_KEY']

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missingVars.forEach((varName) => console.error(`   - ${varName}`))
    process.exit(1)
  }

  try {
    const claudeService = new ClaudeService()

    console.log('📋 Configuración:')
    console.log(`   🤖 Claude API: Configurada`)
    console.log(`   🔑 API Key: ${process.env.CLAUDE_API_KEY?.substring(0, 10)}...`)

    // Crear un PDF de prueba simple
    const testPdfData = {
      name: 'test-connection.pdf',
      content: Buffer.from('Test PDF content for connection testing').toString('base64'),
      modifiedTime: new Date().toISOString(),
      id: 'test-connection-id'
    }

    console.log('\n🧪 Enviando solicitud de prueba a Claude...')

    const response = await claudeService.processPDF(testPdfData)

    console.log('\n📊 RESULTADOS:')
    console.log('='.repeat(50))

    if (response.success) {
      console.log('✅ Conexión con Claude API exitosa!')
      console.log(`📄 Archivo procesado: ${response.reportData.name}`)
      console.log(`💰 Costo total: ${response.reportData.currency} ${response.reportData.totalCost}`)
      console.log(`📝 Items encontrados: ${response.reportData.items.length}`)
      console.log(`📋 Resumen: ${response.reportData.summary || 'No disponible'}`)

      console.log('\n🎉 ¡Claude API funcionando correctamente!')
    } else {
      console.log('❌ Error en la conexión con Claude API:')
      console.log(`   Error: ${response.error}`)
      console.log('\n🔧 Solución de problemas:')
      console.log('1. Verifica que la API key de Claude sea correcta')
      console.log('2. Asegúrate de que la API key tenga permisos suficientes')
      console.log('3. Verifica que no haya límites de cuota excedidos')
    }
  } catch (error) {
    console.error('\n❌ Error al conectar con Claude API:', error)
    console.log('\n🔧 Solución de problemas:')
    console.log('1. Verifica que la API key de Claude sea correcta')
    console.log('2. Asegúrate de que la API key tenga permisos suficientes')
    console.log('3. Verifica que no haya límites de cuota excedidos')
    console.log('4. Comprueba la conectividad de red')
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
  testClaudeConnection().catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}
