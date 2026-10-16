export interface VehicleCRData {
  registrationNumber?: string;
  registrationDate?: string;
  chassisNumber?: string;
  engineNumber?: string;
  ownerName?: string;
  fatherHusbandName?: string;
  currentAddress?: string;
  permanentAddress?: string;
  vehicleClass?: string;
  makersName?: string;
  modelName?: string;
  bodyType?: string;
  mfgMonthYear?: string;
  noOfCylinders?: string;
  cubicCapacity?: string;
  horsePower?: string;
  fuelType?: string;
  seatingCapacity?: string;
  standingCapacity?: string;
  unladenWeight?: string;
  grossWeight?: string;
  color?: string;
  wheelbase?: string;
  taxValidity?: string;
  fitnessValidity?: string;
  insuranceDetails?: string;
  hypothecation?: string;
  issuingAuthority?: string;
  confidenceScore?: number;
}

export interface OverallQuality {
  score?: number;
  grade?: 'GOOD' | 'FAIR' | 'POOR' | 'UNUSABLE' | string;
  needsReview?: boolean;
  flaggedFields?: string[];
  reasons?: string[];
}

export interface AnalyzeResultData {
  fields: VehicleCRData;
  fieldConfidence?: Record<string, number>;
  overallQuality?: OverallQuality;
  extractedAt: string;
}

export interface ApiMeta {
  model: string;
  durationMs: number;
}

export interface AnalyzeResponse {
  version: string;
  success: boolean;
  data: AnalyzeResultData;
  meta: ApiMeta;
}
