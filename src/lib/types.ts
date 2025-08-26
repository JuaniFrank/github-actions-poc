export interface ProcessedFile {
  name: string;
  modifiedTime: string;
  id: string;
}

export interface ControlFile {
  processed: ProcessedFile[];
  lastUpdated: string;
}

export interface PDFData {
  name: string;
  content: string;
  modifiedTime: string;
  id: string;
}

export interface CostItem {
  description: string;
  cost: number;
  category?: string;
}

export interface ReportData {
  id: string;
  name: string;
  generatedAt: string;
  totalCost: number;
  currency: string;
  items: CostItem[];
  sourcePdf: string;
  summary?: string;
}

export interface ClaudeResponse {
  reportData: ReportData;
  componentCode: string;
  success: boolean;
  error?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  mimeType: string;
  size?: string;
}

export interface ProcessingResult {
  success: boolean;
  processedFiles: string[];
  errors: string[];
  newReports: ReportData[];
}
