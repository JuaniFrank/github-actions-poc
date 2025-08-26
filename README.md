# Sistema de Procesamiento Automático de PDFs

Este proyecto implementa un sistema automatizado que procesa PDFs de Google Drive, extrae información de costos usando Claude AI, y genera reportes interactivos en React + Tailwind CSS.

## 🚀 Características

- **Cron Job Automático**: GitHub Actions ejecuta el procesamiento cada hora
- **Integración con Google Drive**: Descarga automática de PDFs nuevos
- **Procesamiento con Claude AI**: OCR y análisis inteligente de documentos
- **Generación de Reportes**: Componentes React automáticos con Tailwind CSS
- **Deploy Automático**: Vercel despliega automáticamente los nuevos reportes
- **Control de Estado**: Evita reprocesar PDFs ya analizados

## 📋 Flujo del Sistema

1. **Cron Job** (GitHub Actions) se ejecuta cada hora
2. **Google Drive API** lista PDFs disponibles
3. **Control File** compara con archivos ya procesados
4. **Claude AI** analiza PDFs nuevos y extrae costos
5. **Generador** crea componentes React automáticamente
6. **Commit & Push** actualiza el repositorio
7. **Vercel** despliega la nueva versión

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd gm2dev-templates-a0013370bc51
npm install
```

### 2. Configurar variables de entorno
Copia `env.example` a `.env` y configura:

```bash
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Google Drive Configuration
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}

# Optional: Google Drive Folder ID
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 3. Configurar Google Drive API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita Google Drive API
4. Crea una cuenta de servicio
5. Descarga las credenciales JSON
6. Comparte la carpeta de Google Drive con la cuenta de servicio

### 4. Configurar Claude API
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una API key
3. Agrega la key a las variables de entorno

## 🔧 Configuración de GitHub Secrets

En tu repositorio de GitHub, ve a Settings > Secrets and variables > Actions y agrega:

- `CLAUDE_API_KEY`: Tu API key de Claude
- `GOOGLE_DRIVE_CREDENTIALS`: JSON de credenciales de Google Drive
- `GOOGLE_DRIVE_FOLDER_ID`: ID de la carpeta de Google Drive (opcional)
- `VERCEL_TOKEN`: Token de Vercel para deploy automático
- `VERCEL_ORG_ID`: ID de la organización de Vercel
- `VERCEL_PROJECT_ID`: ID del proyecto de Vercel

## 📁 Estructura del Proyecto

```
├── src/
│   ├── lib/
│   │   ├── types.ts              # Tipos TypeScript
│   │   ├── driveService.ts       # Servicio de Google Drive
│   │   ├── claudeService.ts      # Servicio de Claude AI
│   │   └── reportGenerator.ts    # Generador de reportes
│   ├── components/
│   │   └── reports/
│   │       ├── ReportList.tsx    # Lista de reportes
│   │       └── index.ts          # Índice auto-generado
│   └── app/
│       └── reports/
│           └── page.tsx          # Página de reportes
├── scripts/
│   └── process-pdfs.ts           # Script principal
├── .github/
│   └── workflows/
│       └── process-pdfs.yml      # GitHub Actions workflow
├── data/
│   └── reports/                  # Datos de reportes (auto-generado)
├── control.json                  # Control de archivos procesados
└── tests/
    └── pdf-processing.test.ts    # Tests del sistema
```

## 🚀 Uso

### Ejecución Manual
```bash
# Procesar PDFs manualmente
npm run process-pdfs

# Ejecutar en modo desarrollo
npm run process-pdfs:dev
```

### Ejecución Automática
El sistema se ejecuta automáticamente cada hora via GitHub Actions.

### Ver Reportes
Los reportes están disponibles en: `http://localhost:3000/reports`

## 📊 Ejemplo de Reporte

El sistema genera componentes React como este:

```tsx
const Report_Apartment_A: React.FC<ReportProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{data.name}</h2>
        <div className="text-2xl font-bold text-white">
          {data.currency} {data.totalCost.toLocaleString()}
        </div>
      </div>
      {/* Detalles del reporte */}
    </div>
  );
};
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests específicos del sistema de PDFs
npm test -- tests/pdf-processing.test.ts
```

## 📝 Archivo de Control

El sistema mantiene un archivo `control.json` que rastrea PDFs procesados:

```json
{
  "processed": [
    {
      "name": "apartment_A.pdf",
      "modifiedTime": "2024-01-22T18:59:00Z",
      "id": "1ABC123..."
    }
  ],
  "lastUpdated": "2024-01-22T19:00:00Z"
}
```

## 🔍 Monitoreo

### Logs del Sistema
- Los logs se muestran en la consola durante la ejecución
- GitHub Actions mantiene logs detallados en la pestaña Actions
- Errores se registran en el archivo de control

### Métricas
- Archivos procesados por ejecución
- Tiempo de procesamiento
- Tasa de éxito/error
- Nuevos reportes generados

## 🛡️ Seguridad

- Credenciales almacenadas en GitHub Secrets
- Variables de entorno para configuración local
- Validación de tipos con TypeScript
- Manejo de errores robusto
- No se almacenan PDFs localmente

## 🔧 Personalización

### Modificar el Prompt de Claude
Edita `src/lib/claudeService.ts` para cambiar cómo Claude analiza los PDFs.

### Cambiar Estilos
Los componentes usan Tailwind CSS. Modifica las clases en los componentes generados.

### Agregar Nuevos Campos
Actualiza `src/lib/types.ts` para agregar nuevos campos a los reportes.

## 🚨 Troubleshooting

### Error: "CLAUDE_API_KEY no está configurada"
- Verifica que la variable de entorno esté configurada
- En GitHub Actions, verifica los secrets

### Error: "Google Drive API error"
- Verifica las credenciales de Google Drive
- Asegúrate de que la API esté habilitada
- Verifica permisos de la cuenta de servicio

### Error: "No se encontró JSON válido en la respuesta"
- Claude puede estar devolviendo una respuesta malformada
- Verifica el prompt en `claudeService.ts`

## 📈 Roadmap

- [ ] Soporte para múltiples idiomas
- [ ] Análisis de tendencias temporales
- [ ] Exportación a Excel/PDF
- [ ] Dashboard con métricas
- [ ] Notificaciones por email/Slack
- [ ] Soporte para otros tipos de documentos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte, abre un issue en GitHub o contacta al equipo de desarrollo.
