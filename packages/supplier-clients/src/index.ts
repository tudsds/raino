export type {
  SupplierPartInfo,
  SupplierSearchResult,
  SupplierQuoteLineItem,
  SupplierQuote,
} from './common/types';

export type { SupplierAdapter, SearchOptions } from './common/adapter';

export { FetchHttpClient, HttpError } from './common/http-client';
export type { HttpClient, RequestOptions } from './common/http-client';

export type { DigiKeyAdapter } from './digikey/adapter';
export { MockDigiKeyAdapter } from './digikey/adapter';
export { RealDigiKeyAdapter } from './digikey/real-adapter';
export type { DigiKeyConfig } from './digikey/real-adapter';

export type { MouserAdapter } from './mouser/adapter';
export { MockMouserAdapter } from './mouser/adapter';
export { RealMouserAdapter } from './mouser/real-adapter';
export type { MouserConfig } from './mouser/real-adapter';

export type { JLCPCBAdapter } from './jlcpcb/adapter';
export { MockJLCPCBAdapter } from './jlcpcb/adapter';
export { RealJLCPCBAdapter } from './jlcpcb/real-adapter';
export type { JLCPCBConfig } from './jlcpcb/real-adapter';

export { createSupplierAdapters, getAdapterStatus } from './factory';
export type { AdapterStatusEntry, AdapterStatusMap } from './factory';
