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

const API_BASE_URL: string = 
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, '');

const MESSAGES = {
  busy: "The AI service is currently busy. Please wait a moment and try again.",
  unavailable: "The system is currently unavailable. Please contact support.",
  blurry: "The image is too blurry or dark. Please upload a clearer photo.",
  invalidFile: "Please upload a valid JPG, PNG, or PDF file.",
  tooLarge: "The file is too large. The maximum size is 10 MB.",
  network: "We couldn't reach the server. Please check your internet connection and try again.",
  unknown: "An unexpected error occurred. Please try again.",
} as const;

function toFriendlyMessage(httpStatus: number, err?: any): string {
  const code = err?.code ?? "";
  const rawMessage = err?.message ?? "";
  const status = err?.status ?? httpStatus;

  // Convert technical errors to friendly messages
  if (status === 403 || /\b403\b/.test(rawMessage)) return MESSAGES.unavailable;
  if (status === 413) return MESSAGES.tooLarge;
  if (status === 422 || code === "UNUSABLE_IMAGE") return MESSAGES.blurry;
  if (status === 400 || status === 415 || code === "INVALID_FILE") return MESSAGES.invalidFile;

  // If Google is busy (503), out of quota (429), or backend times out (502)
  if (
    [503, 502, 429].includes(status) ||
    [503, 502, 429].includes(httpStatus) ||
    /\b(503|429|502)\b/.test(rawMessage)
  ) {
    return MESSAGES.busy;
  }

  return MESSAGES.unknown;
}

export async function analyzeCrDocument(file: File): Promise<AnalyzeResponse> {
  console.log('API base:', API_BASE_URL);
  
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/ocr/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (networkError) {
    console.error("Network error:", networkError);
    throw new ApiError(MESSAGES.network, 0, "NETWORK_ERROR");
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Response wasn't JSON
  }

  if (!response.ok || body?.success === false) {
    // Log the technical error for YOU to see in the console
    console.error("OCR request failed:", response.status, body?.error);
    
    // Throw the friendly error for the USER to see on screen
    const friendlyMsg = toFriendlyMessage(response.status, body?.error);
    throw new ApiError(friendlyMsg, response.status, body?.error?.code || `HTTP_${response.status}`, body?.error?.details, body);
  }

  return body as AnalyzeResponse;
}