import type { ZodError, ZodSchema } from 'zod';

import { ProjectSchema, type Project } from '../schemas/project';

import { ProductSpecSchema, type ProductSpec } from '../schemas/spec';

import { BOMSchema, type BOM } from '../schemas/bom';

import { RoughQuoteSchema, type RoughQuote } from '../schemas/quote';

type ParseResult<T> = { success: true; data: T } | { success: false; error: ZodError };

function safeParse<T>(schema: ZodSchema<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateProject(input: unknown): ParseResult<Project> {
  return safeParse(ProjectSchema, input);
}

export function validateProductSpec(input: unknown): ParseResult<ProductSpec> {
  return safeParse(ProductSpecSchema, input);
}

export function validateBOM(input: unknown): ParseResult<BOM> {
  return safeParse(BOMSchema, input);
}

export function validateQuote(input: unknown): ParseResult<RoughQuote> {
  return safeParse(RoughQuoteSchema, input);
}
