/**
 * Template wiring — convert @raino/agents PromptTemplates to LLMMessage[]
 * and send them through the LLMGateway.
 */

import type { ZodSchema } from 'zod';
import { getTemplateById } from '@raino/agents';
import type { LLMMessage, LLMResponse } from './types';
import type { LLMGateway } from './gateway';

/**
 * Simple Mustache-style variable replacement.
 * Handles {{variable}} and {{#section}}...{{/section}} blocks.
 */
function renderTemplate(template: string, variables: Record<string, string>): string {
  // Handle conditional sections: {{#var}}...{{/var}}
  let rendered = template.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key: string, body: string) => {
      const value = variables[key];
      if (value && value.trim().length > 0) {
        return body;
      }
      return '';
    },
  );

  // Handle simple variable substitution: {{var}}
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return variables[key] ?? '';
  });

  return rendered;
}

/**
 * Convert a PromptTemplate (by id) + variables into LLMMessage[].
 * Throws if the template is not found.
 */
export function templateToMessages(
  templateId: string,
  variables: Record<string, string>,
): LLMMessage[] {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const systemMessage: LLMMessage = {
    role: 'system',
    content: template.systemPrompt,
  };

  const userContent = renderTemplate(template.userPromptTemplate, variables);
  const userMessage: LLMMessage = {
    role: 'user',
    content: userContent,
  };

  return [systemMessage, userMessage];
}

/**
 * Render a template and send it through the gateway.
 * If a responseSchema is provided, uses chatStructured for validated output.
 */
export async function chatWithTemplate<T>(
  gateway: LLMGateway,
  templateId: string,
  variables: Record<string, string>,
  responseSchema?: ZodSchema<T>,
): Promise<T extends ZodSchema<infer U> ? U : LLMResponse> {
  const messages = templateToMessages(templateId, variables);

  if (responseSchema) {
    return gateway.chatStructured(messages, responseSchema) as Promise<
      T extends ZodSchema<infer U> ? U : LLMResponse
    >;
  }

  return gateway.chat(messages) as Promise<T extends ZodSchema<infer U> ? U : LLMResponse>;
}
