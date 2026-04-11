# ABM8-16.000MHZ-B2-T — Crystal Oscillator

# Absolute Maximum Ratings

Storage temperature: -55 to 125 °C
Drive level: 500 µW max

# Recommended Operating Conditions

Nominal frequency: 16.000 MHz
Frequency tolerance (at 25°C): ±20 ppm
Frequency stability over temperature: ±50 ppm (-20 to 70°C)
Total frequency stability: ±70 ppm
Operating temperature: -20 to 70 °C (extended: -40 to 85 °C)
Load capacitance (CL): 18 pF
Shunt capacitance (C0): 7 pF max
Motional capacitance (C1): 0.02 pF typical
Equivalent series resistance (ESR): 60 Ω max
Drive level: 100 µW recommended (500 µW max)
Aging (first year): ±3 ppm

# Application Note: Oscillator Circuit Design

Load capacitance calculation:
CL = (C1 × C2) / (C1 + C2) + Cstray
For CL=18pF with Cstray≈5pF:
C1 = C2 = 2 × (18 - 5) = 26 pF → use 27 pF standard value

Circuit requirements:

- Inverting amplifier in MCU ( Pierce oscillator topology)
- Feedback resistor: typically integrated in MCU
- Series resistor: typically not needed at 16 MHz
- Load capacitors: 27 pF each (for CL=18pF)

PCB Layout:

- Place crystal within 10 mm of MCU oscillator pins
- Route crystal traces away from high-speed signals
- Keep traces short and symmetric
- Guard with ground vias around crystal area
- Do not route other signals under crystal
- Ground plane on adjacent layer under crystal

# Package Outline

Package: HC49/SMD (3.2 x 2.5 mm)
Metal can, solder seal
Terminals: 2, solder pads
Footprint:

- Pad size: 2.0 x 1.2 mm (per terminal)
- Pad spacing: 2.2 mm center-to-center
