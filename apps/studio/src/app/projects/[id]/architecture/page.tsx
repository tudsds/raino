import { mockProjects } from '@/lib/mock-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';

interface ArchitecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchitecturePage({ params }: ArchitecturePageProps) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    {
      id: 'architecture',
      label: 'Architecture',
      href: `/projects/${id}/architecture`,
      active: true,
    },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  const architecture = {
    template: 'sensor-hub-v1',
    mcu: {
      name: 'ESP32-S3-WROOM-1',
      manufacturer: 'Espressif',
      description: 'Dual-core Xtensa LX7, Wi-Fi 4 + BLE 5.0',
      specs: ['240 MHz', '512KB SRAM', '8MB Flash', '45 GPIO'],
    },
    power: {
      topology: 'Battery + USB-C Charging',
      inputVoltage: '3.0V - 4.2V (Li-ion) / 5V (USB)',
      regulation: 'Buck-Boost + LDO',
      standbyCurrent: '< 50µA',
    },
    interfaces: [
      { name: 'I2C', count: 2, description: 'Sensors, OLED' },
      { name: 'SPI', count: 1, description: 'Flash, SD Card' },
      { name: 'UART', count: 2, description: 'Debug, GPS' },
      { name: 'ADC', count: 2, description: 'Battery monitoring' },
      { name: 'GPIO', count: 12, description: 'Digital I/O' },
    ],
    features: [
      'Wi-Fi 802.11 b/g/n',
      'Bluetooth 5.0 (LE + Classic)',
      'Ultra-low power modes',
      'Battery management',
      'Over-the-air updates',
      'Secure boot',
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
              className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#e4e4e7]">Architecture</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 rounded-full bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] text-xs text-[#00f0ff] font-medium">
              {architecture.template}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </header>

      <div className="border-b border-[#27273a] bg-[#13131f]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#00f0ff] border-[#00f0ff]'
                    : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7] hover:border-[#3a3a5a]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Architecture Diagram</h2>
              <div className="bg-[#0a0a0f] border border-[#27273a] rounded-xl p-8">
                <svg viewBox="0 0 800 400" className="w-full h-auto">
                  <rect
                    x="50"
                    y="150"
                    width="140"
                    height="100"
                    rx="8"
                    fill="#1a1a2e"
                    stroke="#00f0ff"
                    strokeWidth="2"
                  />
                  <text
                    x="120"
                    y="195"
                    textAnchor="middle"
                    fill="#00f0ff"
                    fontSize="14"
                    fontWeight="600"
                  >
                    MCU
                  </text>
                  <text x="120" y="215" textAnchor="middle" fill="#64748b" fontSize="10">
                    ESP32-S3
                  </text>
                  <text x="120" y="230" textAnchor="middle" fill="#64748b" fontSize="10">
                    WROOM-1
                  </text>

                  <rect
                    x="250"
                    y="50"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#1a1a2e"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  <text
                    x="310"
                    y="85"
                    textAnchor="middle"
                    fill="#8b5cf6"
                    fontSize="12"
                    fontWeight="600"
                  >
                    Wi-Fi/BLE
                  </text>
                  <text x="310" y="105" textAnchor="middle" fill="#64748b" fontSize="10">
                    Wireless
                  </text>

                  <rect
                    x="250"
                    y="160"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#1a1a2e"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  <text
                    x="310"
                    y="195"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="12"
                    fontWeight="600"
                  >
                    Sensors
                  </text>
                  <text x="310" y="215" textAnchor="middle" fill="#64748b" fontSize="10">
                    I2C Bus
                  </text>

                  <rect
                    x="250"
                    y="270"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#1a1a2e"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text
                    x="310"
                    y="305"
                    textAnchor="middle"
                    fill="#f59e0b"
                    fontSize="12"
                    fontWeight="600"
                  >
                    Power
                  </text>
                  <text x="310" y="325" textAnchor="middle" fill="#64748b" fontSize="10">
                    Battery + USB
                  </text>

                  <rect
                    x="430"
                    y="50"
                    width="120"
                    height="60"
                    rx="6"
                    fill="#13131f"
                    stroke="#3a3a5a"
                    strokeWidth="1"
                  />
                  <text x="490" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="11">
                    SCD40 CO2
                  </text>

                  <rect
                    x="430"
                    y="130"
                    width="120"
                    height="60"
                    rx="6"
                    fill="#13131f"
                    stroke="#3a3a5a"
                    strokeWidth="1"
                  />
                  <text x="490" y="165" textAnchor="middle" fill="#a1a1aa" fontSize="11">
                    SGP40 VOC
                  </text>

                  <rect
                    x="430"
                    y="210"
                    width="120"
                    height="60"
                    rx="6"
                    fill="#13131f"
                    stroke="#3a3a5a"
                    strokeWidth="1"
                  />
                  <text x="490" y="245" textAnchor="middle" fill="#a1a1aa" fontSize="11">
                    BME280 Env
                  </text>

                  <rect
                    x="430"
                    y="290"
                    width="120"
                    height="60"
                    rx="6"
                    fill="#13131f"
                    stroke="#3a3a5a"
                    strokeWidth="1"
                  />
                  <text x="490" y="325" textAnchor="middle" fill="#a1a1aa" fontSize="11">
                    18650 + PMIC
                  </text>

                  <rect
                    x="620"
                    y="160"
                    width="130"
                    height="80"
                    rx="8"
                    fill="#1a1a2e"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <text
                    x="685"
                    y="195"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="12"
                    fontWeight="600"
                  >
                    External
                  </text>
                  <text x="685" y="215" textAnchor="middle" fill="#64748b" fontSize="10">
                    UART, GPIO
                  </text>

                  <line
                    x1="190"
                    y1="200"
                    x2="250"
                    y2="90"
                    stroke="#3a3a5a"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                  <line x1="190" y1="200" x2="250" y2="200" stroke="#3a3a5a" strokeWidth="2" />
                  <line
                    x1="190"
                    y1="200"
                    x2="250"
                    y2="310"
                    stroke="#3a3a5a"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />

                  <line x1="370" y1="90" x2="430" y2="80" stroke="#3a3a5a" strokeWidth="1" />
                  <line x1="370" y1="200" x2="430" y2="160" stroke="#3a3a5a" strokeWidth="1" />
                  <line x1="370" y1="200" x2="430" y2="240" stroke="#3a3a5a" strokeWidth="1" />
                  <line x1="370" y1="310" x2="430" y2="320" stroke="#3a3a5a" strokeWidth="1" />

                  <line x1="190" y1="200" x2="620" y2="200" stroke="#3a3a5a" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">MCU Selection</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#8b5cf6]/20 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-[#00f0ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#e4e4e7]">
                      {architecture.mcu.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border border-[rgba(0,240,255,0.3)]">
                      {architecture.mcu.manufacturer}
                    </span>
                  </div>
                  <p className="text-[#a1a1aa] text-sm mb-3">{architecture.mcu.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {architecture.mcu.specs.map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-[#1a1a2e] border border-[#27273a] text-xs text-[#64748b]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Power Topology</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Topology</p>
                  <p className="text-[#e4e4e7] font-medium">{architecture.power.topology}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">
                    Input Voltage
                  </p>
                  <p className="text-[#e4e4e7] font-medium">{architecture.power.inputVoltage}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Regulation</p>
                  <p className="text-[#e4e4e7] font-medium">{architecture.power.regulation}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">
                    Standby Current
                  </p>
                  <p className="text-[#22c55e] font-medium">{architecture.power.standbyCurrent}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Interfaces
              </h3>
              <div className="space-y-3">
                {architecture.interfaces.map((iface, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e] border border-[#27273a]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#00f0ff] font-mono text-sm font-medium">
                        {iface.name}
                      </span>
                      <span className="text-[#64748b] text-xs">×{iface.count}</span>
                    </div>
                    <span className="text-[#a1a1aa] text-xs">{iface.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Supported Features
              </h3>
              <ul className="space-y-2">
                {architecture.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-[#22c55e]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-[#a1a1aa] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Template
              </h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#00f0ff]/10 to-[#8b5cf6]/10 border border-[#00f0ff]/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-[#00f0ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="text-[#e4e4e7] font-medium">{architecture.template}</span>
                </div>
                <p className="text-xs text-[#64748b]">
                  Pre-validated architecture template for IoT sensor applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
