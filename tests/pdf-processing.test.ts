import { ReportGenerator } from '../src/lib/reportGenerator';
import { ClaudeService } from '../src/lib/claudeService';
import { DriveService } from '../src/lib/driveService';
import { PDFData, ReportData } from '../src/lib/types';

// Mock de las dependencias
jest.mock('../src/lib/claudeService');
jest.mock('../src/lib/driveService');

describe('PDF Processing System', () => {
  let reportGenerator: ReportGenerator;
  let mockClaudeService: jest.Mocked<ClaudeService>;
  let mockDriveService: jest.Mocked<DriveService>;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancias mock
    mockClaudeService = new ClaudeService() as jest.Mocked<ClaudeService>;
    mockDriveService = new DriveService() as jest.Mocked<DriveService>;
    
    // Crear instancia del generador
    reportGenerator = new ReportGenerator();
  });

  describe('ReportGenerator', () => {
         it('should process new PDFs successfully', async () => {
       // Mock data


      const mockReportData: ReportData = {
        id: 'report-123',
        name: 'Reporte de Apartamento Test',
        generatedAt: '2024-01-01T00:00:00Z',
        totalCost: 1500.00,
        currency: 'USD',
        items: [
          { description: 'Renta mensual', cost: 1200.00 },
          { description: 'Servicios', cost: 300.00 },
        ],
        sourcePdf: 'test-apartment.pdf',
        summary: 'Reporte de costos del apartamento',
      };

      // Mock responses
      mockDriveService.listPDFs = jest.fn().mockResolvedValue([
        {
          id: 'test-id-123',
          name: 'test-apartment.pdf',
          modifiedTime: '2024-01-01T00:00:00Z',
          mimeType: 'application/pdf',
        },
      ]);

      mockDriveService.downloadPDF = jest.fn().mockResolvedValue(
        Buffer.from('fake-pdf-content')
      );

      mockClaudeService.processPDF = jest.fn().mockResolvedValue({
        reportData: mockReportData,
        componentCode: 'import React from "react"; const TestComponent = () => <div>Test</div>;',
        success: true,
      });

      // Ejecutar test
      const result = await reportGenerator.processNewPDFs();

      // Verificaciones
      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(1);
      expect(result.processedFiles[0]).toBe('test-apartment.pdf');
      expect(result.newReports).toHaveLength(1);
      expect(result.newReports[0].name).toBe('Reporte de Apartamento Test');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      mockDriveService.listPDFs = jest.fn().mockRejectedValue(
        new Error('Google Drive API error')
      );

      // Ejecutar test
      const result = await reportGenerator.processNewPDFs();

      // Verificaciones
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Error general');
    });

    it('should not process already processed PDFs', async () => {
      // Mock data con archivo ya procesado
      mockDriveService.listPDFs = jest.fn().mockResolvedValue([
        {
          id: 'test-id-123',
          name: 'already-processed.pdf',
          modifiedTime: '2024-01-01T00:00:00Z',
          mimeType: 'application/pdf',
        },
      ]);

             // Mock control file con archivo ya procesado

      // Ejecutar test
      const result = await reportGenerator.processNewPDFs();

      // Verificaciones
      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(0);
      expect(result.newReports).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('ClaudeService', () => {
    it('should generate valid React component code', async () => {
      const claudeService = new ClaudeService();
      const mockPdfData: PDFData = {
        name: 'test.pdf',
        content: 'base64-content',
        modifiedTime: '2024-01-01T00:00:00Z',
        id: 'test-id',
      };

             // Mock fetch
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: jest.fn().mockResolvedValue({
           content: [
             {
               text: JSON.stringify({
                 reportData: {
                   id: 'test',
                   name: 'Test Report',
                   generatedAt: '2024-01-01T00:00:00Z',
                   totalCost: 100,
                   currency: 'USD',
                   items: [],
                   sourcePdf: 'test.pdf',
                 },
                 componentCode: 'import React from "react"; const TestComponent = () => <div>Test</div>;',
               }),
             },
           ],
         }),
       } as unknown as Response);

      const result = await claudeService.processPDF(mockPdfData);

      expect(result.success).toBe(true);
      expect(result.componentCode).toContain('import React');
      expect(result.componentCode).toContain('const TestComponent');
    });
  });

  describe('DriveService', () => {
    it('should list PDFs from Google Drive', async () => {
      const driveService = new DriveService();

      // Mock Google Drive API
      const mockDriveFiles = [
        {
          id: 'file1',
          name: 'document1.pdf',
          modifiedTime: '2024-01-01T00:00:00Z',
          mimeType: 'application/pdf',
        },
        {
          id: 'file2',
          name: 'document2.pdf',
          modifiedTime: '2024-01-02T00:00:00Z',
          mimeType: 'application/pdf',
        },
      ];

      // Mock the Google Drive API response
      const mockGoogleDrive = {
        files: {
          list: jest.fn().mockResolvedValue({
            data: { files: mockDriveFiles },
          }),
        },
      };

      // Mock the googleapis module
      jest.doMock('googleapis', () => ({
        google: {
          drive: jest.fn().mockReturnValue(mockGoogleDrive),
          auth: {
            GoogleAuth: jest.fn().mockImplementation(() => ({
              getClient: jest.fn(),
            })),
          },
        },
      }));

      const result = await driveService.listPDFs();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('document1.pdf');
      expect(result[1].name).toBe('document2.pdf');
    });
  });
});
