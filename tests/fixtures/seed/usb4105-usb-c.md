# USB4105-GF-A — USB-C Connector

# Absolute Maximum Ratings

Dielectric withstanding voltage: 100 Vrms
Operating temperature: -40 to 85 °C
Insertion cycles: 10,000 minimum

# Recommended Operating Conditions

Current rating per contact: 3.0 A (power delivery up to 100W at 20V)
Voltage rating: 20 V (VBUS)
Contact resistance: 30 mΩ max
Insulation resistance: 1000 MΩ min

# Pin Description

Type: USB Type-C receptacle, 24-pin
Orientation: PCB mount, right-angle or mid-mount

Pin assignments (both orientations supported):
A1: GND
A2: SSTXp1 (SuperSpeed TX+)
A3: SSTXn1 (SuperSpeed TX-)
A4: VBUS
A5: CC1 (Configuration Channel 1)
A6: Dp1 (USB 2.0 data+)
A7: Dn1 (USB 2.0 data-)
A8: SBU1 (Sideband Use 1)
A9: VBUS
A10: SSRXn2 (SuperSpeed RX-)
A11: SSRXp2 (SuperSpeed RX+)
A12: GND

B1-B12: Mirror of A1-A12 (enables reversible plug)

# Power Delivery

Supports USB PD up to 100W (20V, 5A) with appropriate PD controller
VBUS pins must handle 3A each (A4, A9, B4, B9)
CC pins used for PD communication (BMC encoding over CC line)

# Application Note: PCB Layout

Place connector at board edge per USB-C mechanical requirements
Route high-speed pairs (TX, RX) as 90Ω differential pairs
Route USB 2.0 pair (Dp/Dn) as 90Ω differential pair
Route CC lines with 0.8-1.2 mm trace width
Ground: Provide solid ground reference under connector
Shield: Connect shield tabs to chassis ground through 1 MΩ || 4.7 nF
ESD: Place ESD protection (PRTR5V0U2X or similar) within 5 mm of connector

# Package Outline

Type: USB Type-C receptacle
Mounting: Through-hole, mid-mount or right-angle
Body height: 3.21 mm (mid-mount), 6.71 mm (right-angle)
Body width: 8.94 mm
Solder tail pitch: 0.5 mm (signal), 0.7 mm (power)

Footprint: Use manufacturer-recommended land pattern from drawing
