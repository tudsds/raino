export type {
  SupplierPartInfo,
  SupplierSearchResult,
  SupplierQuoteLineItem,
  SupplierQuote,
} from './common/types.js';

export type { SupplierAdapter, SearchOptions } from './common/adapter.js';

export { FetchHttpClient, HttpError } from './common/http-client.js';
export type { HttpClient, RequestOptions } from './common/http-client.js';

export type { DigiKeyAdapter } from './digikey/adapter.js';
export { MockDigiKeyAdapter } from './digikey/adapter.js';
export { RealDigiKeyAdapter } from './digikey/real-adapter.js';
export type { DigiKeyConfig } from './digikey/real-adapter.js';

export type { MouserAdapter } from './mouser/adapter.js';
export { MockMouserAdapter } from './mouser/adapter.js';
export { RealMouserAdapter } from './mouser/real-adapter.js';
export type { MouserConfig } from './mouser/real-adapter.js';

export type { JLCPCBAdapter } from './jlcpcb/adapter.js';
export { MockJLCPCBAdapter } from './jlcpcb/adapter.js';
export { RealJLCPCBAdapter } from './jlcpcb/real-adapter.js';
export type { JLCPCBConfig } from './jlcpcb/real-adapter.js';

export { createSupplierAdapters, getAdapterStatus } from './factory.js';
export type { AdapterStatusEntry, AdapterStatusMap } from './factory.js';
