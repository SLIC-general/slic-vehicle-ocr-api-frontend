import { AnalyzeResponse } from '../types';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: any;
  public rawJson: any;

  constructor(message: string, status: number, code: string, details?: any, rawJson?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.rawJson = rawJson;
  }
}

export async function analyzeCrDocument(file: File): Promise<AnalyzeResponse> {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/api/v1/ocr/analyze`, {
    method: 'POST',
    body: formData,
  });

  const responseJson = await response.json().catch(() => null);

  if (!response.ok) {
    const errorInfo = responseJson?.error || {};
    const errorCode = errorInfo.code || `HTTP_${response.status}`;
    const message = errorInfo.message || `Server returned error ${response.status}`;
    throw new ApiError(message, response.status, errorCode, errorInfo.details, responseJson);
  }

  return responseJson as AnalyzeResponse;
}
