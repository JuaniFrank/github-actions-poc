import { google } from 'googleapis';
import { GoogleDriveFile } from './types';

export class DriveService {
  private drive;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async listPDFs(folderId?: string): Promise<GoogleDriveFile[]> {
    try {
      console.log('🔍 Buscando PDFs en Google Drive...');
      
      const query = "mimeType='application/pdf'";
      const folderQuery = folderId ? ` and '${folderId}' in parents` : '';
      
      const response = await this.drive.files.list({
        q: query + folderQuery,
        fields: 'files(id,name,modifiedTime,mimeType,size)',
        orderBy: 'modifiedTime desc',
      });

      const files = response.data.files || [];
      console.log(`📄 Encontrados ${files.length} PDFs`);
      
      return files.map(file => ({
        id: file.id!,
        name: file.name!,
        modifiedTime: file.modifiedTime!,
        mimeType: file.mimeType!,
        size: file.size,
      }));
    } catch (error) {
      console.error('❌ Error al listar PDFs:', error);
      throw new Error(`Error al listar PDFs: ${error}`);
    }
  }

  async downloadPDF(fileId: string): Promise<Buffer> {
    try {
      console.log(`📥 Descargando PDF: ${fileId}`);
      
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
      }, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data as ArrayBuffer);
      console.log(`✅ PDF descargado: ${buffer.length} bytes`);
      
      return buffer;
    } catch (error) {
      console.error('❌ Error al descargar PDF:', error);
      throw new Error(`Error al descargar PDF ${fileId}: ${error}`);
    }
  }

  async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,modifiedTime,mimeType,size',
      });

      const file = response.data;
      return {
        id: file.id!,
        name: file.name!,
        modifiedTime: file.modifiedTime!,
        mimeType: file.mimeType!,
        size: file.size,
      };
    } catch (error) {
      console.error('❌ Error al obtener información del archivo:', error);
      throw new Error(`Error al obtener información del archivo ${fileId}: ${error}`);
    }
  }
}
