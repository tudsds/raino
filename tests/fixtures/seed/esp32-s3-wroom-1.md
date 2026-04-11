# ESP32-S3-WROOM-1 — Absolute Maximum Ratings

Supply voltage (VDD): 3.0 to 3.6 V
Input voltage on any pin: -0.3 to 3.6 V
Output current per GPIO: 40 mA max
Total output current: Not specified (use derating)
Storage temperature: -40 to 85 °C
ESD protection: 2000 V HBM

# ESP32-S3-WROOM-1 — Recommended Operating Conditions

Supply voltage: 3.0 to 3.6 V (typical: 3.3 V)
Operating temperature: -40 to 85 °C
Wi-Fi transmit current: ~240 mA peak
Wi-Fi receive current: ~65 mA
Modem sleep current: ~7 mA
Deep sleep current: ~10 µA
Flash memory: 8 MB (N8) or 16 MB
PSRAM: 0 MB or 8 MB (N8R8 variant)
GPIO: up to 45
ADC: 2 × 12-bit SAR ADC, 20 channels
CPU: Xtensa dual-core LX7, up to 240 MHz

# ESP32-S3-WROOM-1 — Pin Description

GPIO0: Strapping pin (must be HIGH for normal boot), RTC_GPIO0
GPIO1: RTC_GPIO1, ADC1_CH0
GPIO2: RTC_GPIO2, ADC1_CH1
GPIO3: RTC_GPIO3, ADC1_CH2, JTAG signal
GPIO4: RTC_GPIO4, ADC1_CH3, JTAG signal
GPIO5: RTC_GPIO5, ADC1_CH4, JTAG signal
GPIO6: RTC_GPIO6, ADC1_CH5
GPIO7: RTC_GPIO7, ADC1_CH6
GPIO8: RTC_GPIO8, ADC1_CH7, SPI HD
GPIO9: RTC_GPIO9, ADC1_CH8, SPI WP
GPIO10: RTC_GPIO10, ADC1_CH9
GPIO11: RTC_GPIO11, ADC2_CH0
GPIO12: RTC_GPIO12, ADC2_CH1, SPI D
GPIO13: RTC_GPIO13, ADC2_CH2, SPI Q
GPIO14: RTC_GPIO14, ADC2_CH3, SPI CLK
GPIO15: RTC_GPIO15, ADC2_CH4, SPI CS0
GPIO16: RTC_GPIO16, U0RXD
GPIO17: RTC_GPIO17, U0TXD
GPIO18: RTC_GPIO18
GPIO19: USB D- (fixed function)
GPIO20: USB D+ (fixed function)
GPIO21: RTC_GPIO21

Strapping pins:

- GPIO0: Pull-up → SPI boot (normal). Pull-down → download boot
- GPIO3: Pull-up → JTAG disabled. Pull-down → JTAG enabled
- GPIO45: Pull-up → VDD_SPI 3.3 V. Pull-down → VDD_SPI 1.8 V
- GPIO46: Pull-up → ROM messages printing disabled. Pull-down → enabled

# ESP32-S3-WROOM-1 — Power Requirements

Recommended power supply: 3.3 V, capable of delivering 500 mA minimum
Peak current during Wi-Fi TX: ~240 mA
Average active current (Wi-Fi connected, light traffic): ~65 mA
Deep sleep: ~10 µA (RTC + ULP coprocessor active)
Power-on ramp: VDD must ramp from 0 to 3.3 V within 50 ms

Decoupling: 10 µF + 100 nF ceramic near module VDD pin
Bulk: 100 µF recommended near power entry to handle transmit bursts

# ESP32-S3-WROOM-1 — Boot Configuration

ROM bootloader (download mode): GPIO0 pulled LOW at reset
SPI flash boot (normal): GPIO0 pulled HIGH at reset (internal pull-up)

USB-OTG bootloader: Available when GPIO0=LOW, supports USB CDC download
UART0 bootloader: 460800 baud default, RX on GPIO44, TX on GPIO43

# ESP32-S3-WROOM-1 — USB Guidelines

USB-OTG Full-speed:

- GPIO19: USB D- (fixed)
- GPIO20: USB D+ (fixed)
- Internal 1.5 kΩ pullup on D+ for full-speed
- Supports CDC, MSC, and custom USB classes
- USB CDC bootloader for firmware download

# ESP32-S3-WROOM-1 — Recommended PCB Layout

Module placement: Keep module away from board edges and metal enclosures
Antenna: Module has PCB antenna. Keep antenna area clear (no copper, no components) within 15 mm
Ground: Solid ground plane under module, except antenna area
Decoupling: 10 µF + 100 nF within 5 mm of module pins
Crystal: Internal to module (40 MHz)
EN pin: Add 10 kΩ pullup to VDD + 100 nF capacitor to GND for clean reset
Strapping pins: Use 10 kΩ resistors for pull-up/pull-down
USB traces: Route GPIO19/GPIO20 as 90Ω differential pair, < 50 mm

# ESP32-S3-WROOM-1 — Application Note: Hardware Design Guidelines

Power supply:

- Use LDO (AMS1117-3.3 or equivalent) rated for at least 500 mA
- Add 100 µF bulk + 10 µF ceramic + 100 nF ceramic near module
- Ensure clean power-on reset: VDD ramp < 50 ms

Flash and PSRAM:

- N8 variant: 8 MB flash (Quad SPI, internal to module)
- N8R8 variant: 8 MB flash + 8 MB PSRAM (Octal SPI, internal)
- No external connections needed — both are inside the module

Auto-reset circuit:

- Use DTR and RTS from USB-UART bridge to control EN and GPIO0
- Standard ESP auto-reset circuit with 2 NPN transistors
