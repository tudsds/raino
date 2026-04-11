export type CheckType = 'erc' | 'drc';

export interface ValidationRequest {
  projectId: string;
  projectPath: string;
  checks: CheckType[];
}

export interface ValidationViolation {
  type: 'error' | 'warning';
  category: string;
  message: string;
  location?: string;
  severity: number;
}

export interface ValidationResult {
  projectId: string;
  checkType: CheckType;
  passed: boolean;
  violations: ValidationViolation[];
  duration: number;
}
