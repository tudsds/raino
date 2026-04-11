import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mock-data';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const project = mockProjects[0];
    const spec = {
      requirements: project?.intake?.extractedRequirements ?? [],
      summary: project?.description ?? '',
      targetVolume: 500,
      powerSource: '18650 Li-ion battery',
      connectivity: ['WiFi', 'BLE'],
      sensors: ['SCD40 (CO2)', 'SGP40 (VOC)', 'BME280 (Temp/Humidity/Pressure)'],
      batteryLife: '3+ months',
      formFactor: 'Custom PCB, hand-held',
    };

    return NextResponse.json({
      projectId: id,
      spec,
      status: 'compiled',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compile specification' }, { status: 400 });
  }
}
