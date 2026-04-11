export interface SupplierPartInfo {
  supplier: string;
  supplierSku: string;
  manufacturer: string;
  mpn: string;
  description: string;
  category: string;
  packageType?: string;
  lifecycle: 'active' | 'obsolete' | 'not_recommended' | 'end_of_life' | 'unknown';
  stock: number;
  stockUpdatedAt?: number;
  unitPrice: number | null;
  currency: string;
  moq: number | null;
  breakpoints?: Array<{ quantity: number; price: number }>;
  datasheetUrl?: string;
  leadTime?: string;
  isEstimate: boolean;
}

export interface SupplierSearchResult {
  supplier: string;
  query: string;
  results: SupplierPartInfo[];
  totalResults: number;
  isEstimate: boolean;
}

export interface SupplierQuoteLineItem {
  supplierSku: string;
  mpn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  leadTime: string;
  inStock: boolean;
  isEstimate: boolean;
}

export interface SupplierQuote {
  supplier: string;
  lineItems: SupplierQuoteLineItem[];
  totalPrice: number;
  currency: string;
  estimatedLeadTime: string;
  validUntil?: number;
  isEstimate: boolean;
}
