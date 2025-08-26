import fs from 'fs/promises'
import path from 'path'
import { DriveService } from './driveService'
import { ClaudeService } from './claudeService'
import { ControlFile, PDFData, ReportData, ProcessingResult, GoogleDriveFile } from './types'

export class ReportGenerator {
  private driveService: DriveService
  private claudeService: ClaudeService
  private controlFilePath: string
  private reportsDir: string

  constructor() {
    this.driveService = new DriveService()
    this.claudeService = new ClaudeService()
    this.controlFilePath = path.join(process.cwd(), 'control.json')
    this.reportsDir = path.join(process.cwd(), 'src', 'components', 'reports')
  }

  async processNewPDFs(folderId?: string): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: true,
      processedFiles: [],
      errors: [],
      newReports: []
    }

    try {
      console.log('🚀 Iniciando procesamiento de PDFs...')

      // 1. Obtener lista de PDFs de Google Drive
      const driveFiles = await this.driveService.listPDFs(folderId)

      // 2. Cargar archivo de control
      const controlFile = await this.loadControlFile()

      // 3. Identificar PDFs nuevos o modificados
      const newFiles = this.identifyNewFiles(driveFiles, controlFile)

      if (newFiles.length === 0) {
        console.log('✅ No hay PDFs nuevos para procesar')
        return result
      }

      console.log(`📋 Encontrados ${newFiles.length} PDFs nuevos para procesar`)

      // 4. Procesar cada PDF
      for (const file of newFiles) {
        try {
          console.log(`\n🔄 Procesando: ${file.name}`)

          // Descargar PDF
          const pdfBuffer = await this.driveService.downloadPDF(file.id)
          const pdfData: PDFData = {
            name: file.name,
            content: pdfBuffer.toString('base64'),
            modifiedTime: file.modifiedTime,
            id: file.id
          }

          // Procesar con Claude
          const claudeResponse = await this.claudeService.processPDF(pdfData)

          if (claudeResponse.success) {
            // Generar componente React
            await this.generateReactComponent(claudeResponse.componentCode, claudeResponse.reportData)

            // Guardar datos del reporte
            await this.saveReportData(claudeResponse.reportData)

            result.processedFiles.push(file.name)
            result.newReports.push(claudeResponse.reportData)

            console.log(`✅ Procesado exitosamente: ${file.name}`)
          } else {
            result.errors.push(`Error al procesar ${file.name}: ${claudeResponse.error}`)
            console.error(`❌ Error al procesar ${file.name}:`, claudeResponse.error)
          }
        } catch (error) {
          const errorMsg = `Error al procesar ${file.name}: ${error}`
          result.errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      // 5. Actualizar archivo de control
      await this.updateControlFile(newFiles, controlFile)

      // 6. Actualizar índice de reportes
      await this.updateReportsIndex()

      console.log(`\n🎉 Procesamiento completado:`)
      console.log(`   ✅ Archivos procesados: ${result.processedFiles.length}`)
      console.log(`   ❌ Errores: ${result.errors.length}`)
      console.log(`   📊 Nuevos reportes: ${result.newReports.length}`)
    } catch (error) {
      result.success = false
      result.errors.push(`Error general: ${error}`)
      console.error('❌ Error general en el procesamiento:', error)
    }

    return result
  }

  private async loadControlFile(): Promise<ControlFile> {
    try {
      const content = await fs.readFile(this.controlFilePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      console.log('📝 Creando nuevo archivo de control...')
      return {
        processed: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }

  private identifyNewFiles(driveFiles: GoogleDriveFile[], controlFile: ControlFile): GoogleDriveFile[] {
    const processedMap = new Map(controlFile.processed.map((file) => [file.name, file.modifiedTime]))

    return driveFiles.filter((file) => {
      const lastProcessed = processedMap.get(file.name)
      return !lastProcessed || lastProcessed < file.modifiedTime
    })
  }

  private async generateReactComponent(componentCode: string, reportData: ReportData): Promise<void> {
    // Crear directorio si no existe
    await fs.mkdir(this.reportsDir, { recursive: true })

    // Generar nombre de archivo seguro
    const safeName = reportData.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()

    const fileName = `Report_${safeName}_${reportData.id}.tsx`
    const filePath = path.join(this.reportsDir, fileName)

    // Escribir componente
    await fs.writeFile(filePath, componentCode, 'utf-8')
    console.log(`📝 Componente generado: ${fileName}`)
  }

  private async saveReportData(reportData: ReportData): Promise<void> {
    const reportsDataDir = path.join(process.cwd(), 'data', 'reports')
    await fs.mkdir(reportsDataDir, { recursive: true })

    const fileName = `${reportData.id}.json`
    const filePath = path.join(reportsDataDir, fileName)

    await fs.writeFile(filePath, JSON.stringify(reportData, null, 2), 'utf-8')
  }

  private async updateControlFile(newFiles: GoogleDriveFile[], controlFile: ControlFile): Promise<void> {
    const newProcessedFiles = newFiles.map((file) => ({
      name: file.name,
      modifiedTime: file.modifiedTime,
      id: file.id
    }))

    controlFile.processed.push(...newProcessedFiles)
    controlFile.lastUpdated = new Date().toISOString()

    await fs.writeFile(this.controlFilePath, JSON.stringify(controlFile, null, 2), 'utf-8')
    console.log('📝 Archivo de control actualizado')
  }

  private async updateReportsIndex(): Promise<void> {
    try {
      const files = await fs.readdir(this.reportsDir)
      const reportFiles = files.filter((file) => file.endsWith('.tsx') && file.startsWith('Report_'))

      const exports = reportFiles.map((file) => {
        const componentName = file.replace('.tsx', '')
        return `export { default as ${componentName} } from './${componentName}';`
      })

      const indexContent = [
        '// Auto-generated reports index',
        '// This file is automatically updated by the PDF processing workflow',
        '',
        ...exports,
        '',
        "export { default as ReportList } from './ReportList';"
      ].join('\n')

      await fs.writeFile(path.join(this.reportsDir, 'index.ts'), indexContent, 'utf-8')
      console.log('📝 Índice de reportes actualizado')
    } catch {
      console.error('Error al actualizar índice de reportes')
    }
  }
}
