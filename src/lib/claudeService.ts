import { ClaudeResponse, PDFData, ReportData } from './types'

export class ClaudeService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || ''
    this.baseUrl = 'https://api.anthropic.com/v1/messages'

    if (!this.apiKey) {
      throw new Error('CLAUDE_API_KEY no está configurada')
    }
  }

  async processPDF(pdfData: PDFData): Promise<ClaudeResponse> {
    try {
      console.log(`🤖 Procesando PDF con Claude: ${pdfData.name}`)

      const prompt = this.buildPrompt(pdfData)

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'file',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: pdfData.content
                  }
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const content = result.content[0].text

      console.log(`✅ Claude procesó el PDF: ${pdfData.name}`)

      return this.parseClaudeResponse(content, pdfData)
    } catch (error) {
      console.error('❌ Error al procesar PDF con Claude:', error)
      return {
        reportData: this.createDefaultReportData(pdfData),
        componentCode: this.createDefaultComponent(),
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  private buildPrompt(pdfData: PDFData): string {
    return `
Eres un experto en análisis de documentos financieros y costos. Tu tarea es:

1. Analizar el PDF proporcionado y extraer todos los costos mencionados
2. Realizar cálculos matemáticos (sumatorias, promedios, etc.)
3. Generar un reporte estructurado
4. Crear un componente React con Tailwind CSS

INSTRUCCIONES ESPECÍFICAS:

1. ANÁLISIS DEL PDF:
   - Identifica todos los costos, gastos, precios o montos monetarios
   - Extrae descripciones detalladas de cada item
   - Determina la moneda utilizada
   - Calcula el costo total

2. FORMATO DE RESPUESTA:
   Responde EXACTAMENTE en este formato JSON:

   {
     "reportData": {
       "id": "unique-id",
       "name": "Nombre del Reporte",
       "generatedAt": "2024-01-01T00:00:00Z",
       "totalCost": 1234.56,
       "currency": "USD",
       "items": [
         {
           "description": "Descripción del item",
           "cost": 123.45,
           "category": "Categoría opcional"
         }
       ],
       "sourcePdf": "${pdfData.name}",
       "summary": "Resumen ejecutivo del reporte"
     },
     "componentCode": "// Código del componente React aquí"
   }

3. COMPONENTE REACT:
   - Usa React.FC y TypeScript
   - Implementa Tailwind CSS para estilos
   - Crea un diseño moderno y responsive
   - Incluye el nombre del archivo: ${pdfData.name}
   - Muestra el costo total destacado
   - Lista todos los items con sus costos
   - Usa colores apropiados (verde para costos, gris para texto)

4. CÁLCULOS:
   - Suma todos los costos encontrados
   - Verifica que la suma coincida con el total
   - Maneja diferentes monedas apropiadamente

IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional.
    `
  }

  private parseClaudeResponse(content: string, pdfData: PDFData): ClaudeResponse {
    try {
      // Buscar el JSON en la respuesta
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        reportData: parsed.reportData,
        componentCode: parsed.componentCode,
        success: true
      }
    } catch (error) {
      console.error('Error al parsear respuesta de Claude:', error)
      return {
        reportData: this.createDefaultReportData(pdfData),
        componentCode: this.createDefaultComponent(),
        success: false,
        error: 'Error al parsear respuesta de Claude'
      }
    }
  }

  private createDefaultReportData(pdfData: PDFData): ReportData {
    return {
      id: `default-${Date.now()}`,
      name: `Reporte de ${pdfData.name}`,
      generatedAt: new Date().toISOString(),
      totalCost: 0,
      currency: 'USD',
      items: [],
      sourcePdf: pdfData.name,
      summary: 'Error al procesar el PDF'
    }
  }

  private createDefaultComponent(): string {
    return `
import React from 'react';

interface ReportProps {
  data: {
    name: string;
    totalCost: number;
    currency: string;
    items: Array<{ description: string; cost: number }>;
  };
}

const Report: React.FC<ReportProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {data.name}
      </h2>
      <div className="text-2xl font-bold text-green-600 mb-4">
        {data.currency} {data.totalCost.toLocaleString()}
      </div>
      <div className="space-y-2">
        {data.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.description}</span>
            <span className="text-gray-900 font-medium">
              {data.currency} {item.cost.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;
    `
  }
}
