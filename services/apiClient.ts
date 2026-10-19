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

function friendlyMessage(status: number): string {
  if (status === 0) return 'Cannot reach the server. Check your connection and try again.';
  if (status === 413) return 'The file is too large. The maximum size is 10 MB.';
  if (status === 400 || status === 415 || status === 422) return 'This file could not be processed. Please upload a clear PNG, JPG or PDF of the certificate.';
  if (status === 429) return 'The service is busy right now. Please try again in a few minutes.';
  return 'The service is temporarily unavailable. Please try again later.';
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
    const raw: string = typeof errorInfo.message === 'string' ? errorInfo.message : '';
    const message = raw && raw.length <= 120 && !raw.includes('{') ? raw : friendlyMessage(response.status);
    console.error('API error:', response.status, errorCode, responseJson);
    throw new ApiError(message, response.status, errorCode, errorInfo.details, responseJson);
  }

  return responseJson as AnalyzeResponse;
}
