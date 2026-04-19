import type { SupplierAdapter } from './common/adapter';
import { MockDigiKeyAdapter } from './digikey/adapter';
import { MockMouserAdapter } from './mouser/adapter';
import { MockJLCPCBAdapter } from './jlcpcb/adapter';
import { RealDigiKeyAdapter } from './digikey/real-adapter';
import { RealMouserAdapter } from './mouser/real-adapter';
import { RealJLCPCBAdapter } from './jlcpcb/real-adapter';

export function createSupplierAdapters(): SupplierAdapter[] {
  return [createDigiKeyAdapter(), createMouserAdapter(), createJLCPCBAdapter()];
}

function createDigiKeyAdapter(): SupplierAdapter {
  const clientId = process.env.DIGIKEY_CLIENT_ID;
  const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return new RealDigiKeyAdapter({
      clientId,
      clientSecret,
      redirectUri: process.env.DIGIKEY_REDIRECT_URI ?? '',
    });
  }
  return new MockDigiKeyAdapter();
}

function createMouserAdapter(): SupplierAdapter {
  const apiKey = process.env.MOUSER_API_KEY;
  if (apiKey) {
    return new RealMouserAdapter({ apiKey });
  }
  return new MockMouserAdapter();
}

function createJLCPCBAdapter(): SupplierAdapter {
  const appId = process.env.JLCPCB_APP_ID;
  const accessKey = process.env.JLCPCB_ACCESS_KEY;
  const secretKey = process.env.JLCPCB_SECRET_KEY;
  if (appId && accessKey && secretKey) {
    return new RealJLCPCBAdapter({ appId, accessKey, secretKey });
  }
  return new MockJLCPCBAdapter();
}

export interface AdapterStatusEntry {
  mode: 'live' | 'mock';
  available: boolean;
}

export interface AdapterStatusMap {
  digikey: AdapterStatusEntry;
  mouser: AdapterStatusEntry;
  jlcpcb: AdapterStatusEntry;
}

export function getAdapterStatus(): AdapterStatusMap {
  return {
    digikey: {
      mode: process.env.DIGIKEY_CLIENT_ID && process.env.DIGIKEY_CLIENT_SECRET ? 'live' : 'mock',
      available: !!(process.env.DIGIKEY_CLIENT_ID && process.env.DIGIKEY_CLIENT_SECRET),
    },
    mouser: {
      mode: process.env.MOUSER_API_KEY ? 'live' : 'mock',
      available: !!process.env.MOUSER_API_KEY,
    },
    jlcpcb: {
      mode:
        process.env.JLCPCB_APP_ID && process.env.JLCPCB_ACCESS_KEY && process.env.JLCPCB_SECRET_KEY
          ? 'live'
          : 'mock',
      available: !!(
        process.env.JLCPCB_APP_ID &&
        process.env.JLCPCB_ACCESS_KEY &&
        process.env.JLCPCB_SECRET_KEY
      ),
    },
  };
}
