export type PromptCategory =
  | 'intake'
  | 'clarification'
  | 'spec_compilation'
  | 'architecture'
  | 'bom'
  | 'design'
  | 'validation'
  | 'quote';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface PromptExecution {
  id: string;
  templateId: string;
  projectId: string;
  variables: Record<string, string>;
  response: string;
  timestamp: number;
  duration: number;
  tokenUsage?: { input: number; output: number };
}
