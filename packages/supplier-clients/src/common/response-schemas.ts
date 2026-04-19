import { z } from 'zod';

function coerceOptionalNumber(defaultValue: number | null = null) {
  return z.preprocess((val) => {
    if (val === null || val === undefined) return defaultValue;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }, z.number().nullable().optional().default(defaultValue));
}

export const DigiKeyTokenResponseSchema = z.object({
  access_token: z.string().default(''),
  expires_in: z.coerce.number().default(3600),
  token_type: z.string().default('Bearer'),
});

export type DigiKeyTokenResponse = z.infer<typeof DigiKeyTokenResponseSchema>;

export const DigiKeyPricingBreakSchema = z.object({
  BreakQuantity: z.coerce.number().default(0),
  UnitPrice: coerceOptionalNumber(0),
});

export const DigiKeyProductSchema = z.object({
  DigiKeyPartNumber: z.string().optional().default(''),
  Manufacturer: z
    .object({ Name: z.string().optional().default('') })
    .optional()
    .default({}),
  ManufacturerPartNumber: z.string().optional().default(''),
  ProductDescription: z.string().optional().default(''),
  Category: z
    .object({ Name: z.string().optional().default('') })
    .optional()
    .default({}),
  PackageType: z
    .object({ Name: z.string().optional().default('') })
    .optional()
    .default({}),
  ProductStatus: z.string().optional().default(''),
  QuantityAvailable: z.coerce.number().default(0),
  UnitPrice: coerceOptionalNumber(null),
  Currency: z.string().optional().default('USD'),
  MinimumOrderQuantity: coerceOptionalNumber(null),
  StandardPricing: z.array(DigiKeyPricingBreakSchema).optional().default([]),
  PrimaryDatasheet: z.string().optional().default(''),
  LeadTime: z.string().optional().default(''),
});

export type DigiKeyProduct = z.infer<typeof DigiKeyProductSchema>;

export const DigiKeySearchResponseSchema = z.object({
  Products: z.array(z.unknown()).optional().default([]),
  ProductsCount: z.coerce.number().optional().default(0),
});

export type DigiKeySearchResponse = z.infer<typeof DigiKeySearchResponseSchema>;

export const DigiKeyCategoriesResponseSchema = z.object({
  Categories: z
    .array(
      z.object({
        CategoryId: z.coerce.number().optional().default(0),
        Name: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
});

export type DigiKeyCategoriesResponse = z.infer<typeof DigiKeyCategoriesResponseSchema>;

export const MouserErrorSchema = z.object({
  Code: z.coerce.number().optional().default(0),
  Message: z.string().optional().default(''),
});

export const MouserPriceBreakSchema = z.object({
  Quantity: z.coerce.number().default(0),
  Price: z.string().optional().default(''),
  Currency: z.string().optional().default('USD'),
});

export const MouserPartSchema = z.object({
  MouserPartNumber: z.string().optional().default(''),
  Manufacturer: z.string().optional().default(''),
  ManufacturerPartNumber: z.string().optional().default(''),
  ProductDescription: z.string().optional().default(''),
  Category: z.string().optional().default(''),
  PackageType: z.string().optional().default(''),
  LifecycleStatus: z.string().optional().default(''),
  Availability: z.string().optional().default(''),
  PriceBreaks: z.array(MouserPriceBreakSchema).optional().default([]),
  DataSheetUrl: z.string().optional().default(''),
  LeadTime: z.string().optional().default(''),
});

export type MouserPart = z.infer<typeof MouserPartSchema>;

export const MouserSearchResponseSchema = z.object({
  Errors: z.array(MouserErrorSchema).optional().default([]),
  SearchResults: z
    .object({
      NumberOfResult: z.coerce.number().optional().default(0),
      Parts: z.array(z.unknown()).optional().default([]),
    })
    .optional()
    .default({}),
});

export type MouserSearchResponse = z.infer<typeof MouserSearchResponseSchema>;

export const JLCPCBPriceBreakSchema = z.object({
  startNumber: z.coerce.number().default(0),
  productPrice: coerceOptionalNumber(0),
});

export const JLCPCBParamSchema = z.object({
  paramName: z.string().optional().default(''),
  paramValue: z.string().optional().default(''),
});

export const JLCPCBComponentSchema = z.object({
  productId: z.coerce.number().default(0),
  productCode: z.string().optional().default(''),
  productName: z.string().optional().default(''),
  productIntro: z.string().optional().default(''),
  manufacturerName: z.string().optional().default(''),
  parentCatalogName: z.string().optional().default(''),
  encapsulation: z.string().optional().default(''),
  stockNumber: z.coerce.number().default(0),
  productPriceList: z.array(JLCPCBPriceBreakSchema).optional().default([]),
  pdfUrl: z.string().optional().default(''),
  leadTime: z.string().optional().default(''),
  isBasic: z.boolean().optional().default(false),
  isExtend: z.boolean().optional().default(false),
  paramVOList: z.array(JLCPCBParamSchema).optional().default([]),
});

export type JLCPCBComponent = z.infer<typeof JLCPCBComponentSchema>;

export const JLCPCBSearchResponseSchema = z.object({
  code: z.coerce.number().default(0),
  data: z
    .object({
      tip: z.string().optional().default(''),
      count: z.coerce.number().optional().default(0),
      list: z.array(z.unknown()).optional().default([]),
    })
    .optional()
    .default({}),
});

export type JLCPCBSearchResponse = z.infer<typeof JLCPCBSearchResponseSchema>;

export const JLCPCBDetailResponseSchema = z.object({
  code: z.coerce.number().default(0),
  data: z.unknown().optional(),
});

export type JLCPCBDetailResponse = z.infer<typeof JLCPCBDetailResponseSchema>;
