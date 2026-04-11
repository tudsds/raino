# PRTR5V0U2X — ESD Protection Diode

# Absolute Maximum Ratings

Reverse standoff voltage (VRWM): 5.0 V
Reverse breakdown voltage (VBR): 6.0 V min
Peak pulse power (8/20 µs): 100 W
ESD protection: IEC 61000-4-2 Level 4 (±15 kV contact, ±15 kV air)
Junction temperature: -40 to 150 °C

# Recommended Operating Conditions

Operating voltage: 0 to 5.5 V
Leakage current at VRWM: < 1 µA
Clamping voltage at IPP=2A: < 12 V
Junction capacitance (per channel): < 1 pF at 0 V, 1 MHz

# Pin Description

Package: SOT-143 (4-pin)
Pin 1: I/O1 (protected line 1)
Pin 2: GND (ground)
Pin 3: I/O2 (protected line 2)
Pin 4: VCC (power supply connection)

Configuration: Two independent ESD protection channels
Each channel provides bidirectional protection

# Application Note: USB ESD Protection

Designed for USB 2.0 data line protection:

- Connect I/O1 to USB D+ (DP)
- Connect I/O2 to USB D- (DM)
- Connect GND to ground plane
- Connect VCC to VBUS (5V)

Placement: Within 5 mm of USB connector
Routing: Keep traces short between connector and ESD device
Ground: Direct via to ground plane from GND pin

Benefits:

- Ultra-low capacitance (< 1 pF) — does not affect USB signal integrity
- Bidirectional protection on each channel
- Compatible with USB 2.0 high-speed (480 Mbps)

# Package Outline

Package: SOT-143 (4 lead)
Body dimensions: 2.9 x 1.5 x 1.1 mm
Lead pitch: 1.92 mm (pins 1-2, 3-4)
Footprint:

- Pad size: 0.6 x 1.0 mm (per lead)
- Pin 1 indicator: Beveled corner
