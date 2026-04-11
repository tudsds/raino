import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const architecture = {
      template: 'sensor-hub-v1',
      mcu: 'ESP32-S3',
      power: 'Li-ion PMIC',
      interfaces: ['I2C', 'SPI', 'UART', 'WiFi', 'BLE'],
    };

    return NextResponse.json({
      projectId: id,
      architecture,
      status: 'planned',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to plan architecture' }, { status: 400 });
  }
}
