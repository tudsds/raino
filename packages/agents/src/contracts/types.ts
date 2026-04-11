export interface IntakeRequest {
  projectId: string;
  message: string;
  files?: Array<{ name: string; content: string; mimeType: string }>;
}

export interface IntakeResponse {
  projectId: string;
  clarifyingQuestions?: string[];
  isReadyForSpec: boolean;
}

export interface ClarificationAnswer {
  projectId: string;
  questionId: string;
  answer: string;
}

export interface SpecCompileRequest {
  projectId: string;
  intakeMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ArchitecturePlanRequest {
  projectId: string;
  spec: unknown;
}

export interface BOMGenerateRequest {
  projectId: string;
  spec: unknown;
  architecture: unknown;
  candidateParts: Array<{ mpn: string; manufacturer: string; family: string }>;
}

export interface DesignGenerateRequest {
  projectId: string;
  bom: unknown;
  architecture: unknown;
}

export interface QuoteRequest {
  projectId: string;
  bomId: string;
  options?: {
    includeAssembly?: boolean;
    region?: string;
    quantity?: number;
  };
}

export interface ProjectHandoffRequest {
  projectId: string;
  bomId: string;
  designId: string;
  quoteId: string;
  targetManufacturer?: string;
}
