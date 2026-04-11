import type { FixtureDocument } from '../pipeline/types.js';

// ── STM32F407VGT6 ──────────────────────────────────────────────────────────────

const STM32F407_FIXTURES: FixtureDocument[] = [
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 5',
    content: `STM32F407VGT6 — ARM Cortex-M4 Microcontroller
Datasheet — Production Data — Rev 5

Description
The STM32F407VGT6 is a high-performance ARM Cortex-M4 32-bit RISC core operating at up to 168 MHz.
It features floating point unit (FPU), DSP instructions, and an adaptive real-time accelerator (ART Accelerator).

Absolute Maximum Ratings
Supply voltage (VDD): -0.3 to 4.0 V
Input voltage on any pin (5V tolerant): -0.3 to VDD+4.0 V
Operating temperature range: -40 to 85 °C (industrial), -40 to 105 °C (extended)
Storage temperature range: -65 to 150 °C
Maximum junction temperature: 150 °C
ESD protection: 2000 V HBM, 500 V CDM

Recommended Operating Conditions
Parameter: VDD (main supply) — Min 1.8 V, Typ 3.3 V, Max 3.6 V
Parameter: VDDA (analog supply) — Min 1.8 V, Typ 3.3 V, Max 3.6 V
Parameter: VBAT (backup supply) — Min 1.65 V, Typ 3.0 V, Max 3.6 V
Parameter: VDDUSB — Min 3.0 V, Typ 3.3 V, Max 3.6 V
Parameter: I/O voltage — Min 1.62 V, Max VDD+0.3 V
Ambient operating temperature: -40 to 85 °C (industrial grade)

Power Requirements
Supply current (Run mode, 168 MHz, all peripherals enabled): Typ 93 mA
Supply current (Run mode, 168 MHz, peripheral clocks off): Typ 38 mA
Supply current (Sleep mode): Typ 12 mA
Supply current (Stop mode, regulator in main mode): Typ 140 µA
Supply current (Stop mode, regulator in low-power mode): Typ 20 µA
Supply current (Standby mode, RTC off): Typ 2.0 µA
Supply current (Standby mode, RTC on): Typ 3.0 µA

Pin Description
The STM32F407VGT6 is available in LQFP100 package (100 pins).
Pin 1: PE2 (ETH_TXD3 / TRACECLK / FSMC_A23)
Pin 2: PE3 (ETH_TX_CLK / TRACED0 / FSMC_A19)
Pin 6: PA0 (WKUP/USART2_CTS/ADC123_IN0/TIM5_CH1/TIM2_CH1)
Pin 7: PA1 (USART2_RTS/ADC123_IN1/TIM5_CH2/TIM2_CH2)
Pin 12: PA6 (SPI1_MISO/TIM3_CH1/ADC12_IN6/TIM1_BKIN/TIM8_BKIN2/DCMI_D0)
Pin 14: PA8 (MCO1/USART1_CK/TIM1_CH1/I2C3_SCL)
Pin 31: BOOT0 (boot configuration pin)
Pin 32: PB2/BOOT1
Pin 47: NRST (active-low reset)
Pin 49: VDDA (analog supply)
Pin 50: VSSA (analog ground)
Pin 94: PA9 (USART1_TX/TIM1_CH2/DCMI_D0/I2C3_SMBA)

Boot Configuration
BOOT1 (PB2) = 0, BOOT0 = 0: Main Flash memory (0x08000000)
BOOT1 (PB2) = 0, BOOT0 = 1: System memory (bootloader, 0x1FFF0000)
BOOT1 (PB2) = 1, BOOT0 = 0: SRAM (0x20000000)
BOOT1 (PB2) = 1, BOOT0 = 1: Reserved
BOOT0 must be held stable during and after reset for correct boot selection.

Clock Tree
Main clock sources: HSE (4-26 MHz crystal/clock), HSI (16 MHz RC), LSE (32.768 kHz), LSI (32 kHz)
System clock mux: HSI, HSE, or PLL output
PLL: Input divider (M), multiplier (N), system divider (P), USB/SDIO/RNG divider (Q)
  HSE = 8 MHz → M=8 → PLL VCO = 8*336/8 = 336 MHz → SYSCLK = 336/2 = 168 MHz
  USB/RNG clock = 336/7 = 48 MHz
Max SYSCLK: 168 MHz
APB1 prescaler: /4 (max 42 MHz) — drives USART2-5, SPI2/3, I2C1-3, TIM2-7, TIM12-14
APB2 prescaler: /2 (max 84 MHz) — drives USART1, SPI1, TIM1, TIM8-11, ADC1-3, SDIO

Reset Guidelines
Three reset sources: Power-on reset (POR), System reset (NRST pin or software), Backup domain reset.
NRST is active-low with internal pull-up. Minimum pulse width: 20 ns.
Power-on reset threshold: rising ~1.72 V, falling ~1.60 V.
Brown-out reset (BOR) levels configurable via option bytes: OFF, 2.0V, 2.2V, 2.5V, 2.8V.
Watchdog: Independent watchdog (IWDG) clocked by LSI, Window watchdog (WWDG) clocked by APB1.

USB Guidelines
USB 2.0 full-speed device/host/OTG with on-chip PHY.
OTG_FS: 12 Mbit/s max, supports session request protocol (SRP) and host negotiation protocol (HNP).
Dedicated 48 MHz USB clock required — sourced from PLL48CLK.
PA11 = USB_DM (D-), PA12 = USB_DP (D+)
VBUS sensing on PA9 (configurable).
Recommended PCB Layout for USB: Route DP/DM as differential pair, 90Ω matched impedance,
keep traces short, avoid routing under high-frequency noise sources.
Place 1.5kΩ pull-up on DP for full-speed device mode.

ADC Considerations
Three ADCs (ADC1, ADC2, ADC3), 12-bit resolution.
Conversion range: VREF- to VREF+ (typically 0 to 3.3 V).
Maximum sampling rate: 2.4 MSPS in single ADC mode, 7.2 MSPS in triple interleaved mode.
Input impedance: depends on sampling time configuration.
Recommended external circuit: Add RC filter (100Ω + 10nF) on analog inputs for anti-aliasing.
Keep analog traces away from high-frequency digital traces.

Recommended PCB Layout
Use solid ground plane on bottom layer.
Place decoupling capacitors (100nF + 4.7µF) close to each VDD/VSS pair.
VDDA decoupling: 100nF + 1µF, placed close to pin 49/50.
VBAT decoupling: 100nF close to pin.
Keep crystal traces short, guard with ground.
Use multiple vias for thermal pads.

Package Outline
Package: LQFP100, 14x14 mm body, 0.5 mm pitch.
Thickness: 1.4 mm max.
Coplanarity: 0.10 mm max.
Thermal resistance (junction-to-ambient): 40 °C/W (LQFP100 on 4-layer PCB).

Reference Circuit
Minimum external components for operation:
- 8 MHz crystal (HSE) with 20pF load capacitors
- 32.768 kHz crystal (LSE) with 6pF load capacitors
- 100nF decoupling capacitors on all VDD pins (8 total) + 4.7µF bulk
- 10kΩ pull-up on NRST, 100nF capacitor on NRST
- BOOT0 pull-down 10kΩ resistor
- VDDA ferrite bead + 100nF + 1µF filtering
- USB ESD protection (e.g. PRTR5V0U2X) on DP/DM`,
  },
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    sourceType: 'errata',
    trustLevel: 'canonical',
    revision: 'Rev 3',
    content: `STM32F407VGT6 — Errata Sheet — Rev 3

Silicon Revision Z (Device Revision 3)

Errata Item: USART cannot be used in synchronous mode at maximum APB frequency
Workaround: Reduce APB clock frequency below 26 MHz when using synchronous mode.
Severity: Medium. Affects USART in synchronous (clocked) mode only.

Errata Item: I2C may not release SDA line after NACK in master mode
Workaround: Software reset of I2C peripheral after detecting bus stuck condition.
Severity: Low. Only occurs after specific NACK timing.

Errata Item: ADC inaccurate when converting immediately after another ADC
Workaround: Insert delay of at least 3 µs between consecutive ADC conversions on different ADCs.
Severity: Low. Only in triple-interleaved mode at maximum speed.

Errata Item: USB OTG may lose SOF under heavy bus load
Workaround: Enable SOF threshold interrupt and handle within 5 µs.
Severity: Medium. Occurs only in host mode with multiple devices.

Errata Item: RTC initialization may fail if backup domain write protection not fully removed
Workaround: Perform two consecutive writes to DBP bit with 2 APB clock cycle delay.
Severity: Low. Only during first RTC configuration after power-on.

Device Revision History
Rev Z (3): Production silicon. All errata listed above apply.
Rev Y (2): Engineering sample. Do not use for production.
Rev X (1): Initial engineering sample. Not for production.`,
  },
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    sourceType: 'app_note',
    trustLevel: 'canonical',
    content: `AN4206 — Getting Started with STM32F407 Hardware Development

Application Note — Hardware Design Guide

Overview
This application note provides guidance for designing hardware with the STM32F407VGT6.

Power Supply Design
Use a single 3.3V rail when possible. The STM32F407 requires:
- VDD: 1.8V to 3.6V (main digital supply)
- VDDA: 1.8V to 3.6V (analog supply, must equal VDD for full ADC performance)
- VBAT: 1.65V to 3.6V (RTC backup, can connect to VDD if not using battery backup)
- VDDUSB: 3.0V to 3.6V (can connect to VDD when USB not used in device mode)

Clock Selection
For USB operation: Must use HSE crystal (not HSI). Recommended 8 MHz.
For general operation: HSI (16 MHz internal RC) is sufficient if USB not used and accuracy
requirements are met (±1% at 25°C).

Reset Circuit
Connect 10kΩ pull-up to VDD and 100nF capacitor to ground on NRST pin.
For manual reset: Add push-button from NRST to ground.
NRST is also the JTAG/SWD reset — ensure JTAG/SWD connector accesses this pin.

Boot Configuration
Default: BOOT0 = LOW (pulled down with 10kΩ). Boots from main flash.
For bootloader access: Add a jumper or button to pull BOOT0 HIGH at reset.
PB2 (BOOT1) can be permanently pulled LOW for flash/system memory boot options.

USB Hardware
PA11 (DM) and PA12 (DP) are dedicated USB pins — no alternate function mapping needed.
Route as differential pair: 90Ω impedance, matched length within 0.5mm.
Add ESD protection: PRTR5V0U2X or equivalent on DP/DM near connector.
VBUS pin (PA9) for device mode detection — add voltage divider if VBUS may exceed 3.6V.

Debug Connector
Standard ARM 10-pin (0.05" pitch) or 20-pin (0.1" pitch) JTAG/SWD connector.
Minimum pins needed for SWD: VDD, GND, SWDIO (PA13), SWCLK (PA14), NRST.
SWO (PB3) optional for ITM trace output.`,
  },
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    sourceType: 'package_doc',
    trustLevel: 'canonical',
    content: `STM32F407VGT6 — Package Documentation — LQFP100

Package Type: LQFP100 (Low-profile Quad Flat Package)
Body Size: 14.0 x 14.0 mm
Lead Count: 100
Lead Pitch: 0.50 mm
Package Thickness: 1.40 mm max
Lead Width: 0.22 mm
Lead Length: 1.0 mm

Pin 1 Identification: Notch on pin 1 side + dot on pin 1 corner

Land Pattern (Footprint)
Pad size: 0.60 x 1.80 mm (per lead)
Pad pitch: 0.50 mm
Pad center to package edge: 0.75 mm
Thermal pad: None (LQFP uses leads for thermal dissipation)
Solder paste stencil: 0.125 mm thickness recommended

Soldering Profile (Pb-free)
Preheat: 150-200°C, 60-120 seconds
Ramp-up rate: 1-3°C/s
Peak temperature: 260°C max (245-255°C recommended)
Time above 217°C: 60-150 seconds
Cooling rate: 1-4°C/s

Moisture Sensitivity Level: MSL3 (168h floor life at 30°C/85%RH)

Tape and Reel
Tape width: 24 mm
Reel diameter: 330 mm
Devices per reel: 1000`,
  },
];

// ── STM32F401CCU6 ──────────────────────────────────────────────────────────────

const STM32F401_FIXTURES: FixtureDocument[] = [
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F401CCU6',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 4',
    content: `STM32F401CCU6 — ARM Cortex-M4 Microcontroller
Datasheet — Production Data — Rev 4

Description
The STM32F401CCU6 is a cost-effective ARM Cortex-M4 32-bit RISC core operating at up to 84 MHz.
It features FPU, DSP instructions, and ART Accelerator. Available in UFQFPN48 package.

Absolute Maximum Ratings
Supply voltage (VDD): -0.3 to 4.0 V
Input voltage on 5V tolerant pins: -0.3 to VDD+4.0 V
Operating temperature range: -40 to 85 °C
Storage temperature range: -65 to 150 °C
ESD protection: 2000 V HBM

Recommended Operating Conditions
VDD: 1.7 to 3.6 V (typ 3.3V)
VDDA: 1.7 to 3.6 V (must equal VDD for ADC accuracy)
VBAT: 1.7 to 3.6 V

Power Requirements
Run mode at 84 MHz: Typ 36 mA
Sleep mode at 84 MHz: Typ 8 mA
Stop mode: Typ 12 µA
Standby mode: Typ 1.5 µA

Pin Description
UFQFPN48 package (48 pins).
Pin 1: VBAT
Pin 2: PC13 (RTC_AF1)
Pin 5: PA0 (WKUP/USART2_CTS/ADC_IN0/TIM5_CH1/TIM2_CH1)
Pin 7: PA2 (USART2_TX/ADC_IN2/TIM5_CH3/TIM2_CH3/TIM9_CH1)
Pin 10: PA5 (SPI1_SCK/ADC_IN5/TIM2_CH1)
Pin 12: PA7 (SPI1_MOSI/ADC_IN7/TIM3_CH2/TIM1_CH1N)
Pin 17: PA9 (USART1_TX/TIM1_CH2/I2C3_SMBA)
Pin 18: PA10 (USART1_RX/TIM1_CH3/I2C3_SDA)
Pin 20: BOOT0
Pin 22: PB3 (SPI1_SCK/I2C2_SDA/TIM2_CH2/TRACESWO)
Pin 44: PA13 (SWDIO)
Pin 45: VSS
Pin 46: VDD
Pin 47: PA14 (SWCLK)
Pin 48: PA15 (SPI1_NSS/TIM2_CH1_ETR)

Boot Configuration
BOOT0 = 0: Main Flash memory at 0x08000000
BOOT0 = 1: System memory (bootloader) at 0x1FFF0000

Clock Tree
HSI: 16 MHz RC oscillator (±1% at 25°C)
HSE: 4-26 MHz external crystal/clock
System clock via PLL: Max 84 MHz
APB1: Max 42 MHz
APB2: Max 84 MHz

Package Outline
Package: UFQFPN48, 7x7 mm body, 0.5 mm pitch.
Thermal resistance: 45 °C/W on 4-layer PCB.
Exposed pad on bottom for ground connection and thermal dissipation.`,
  },
  {
    family: 'STM32F4',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F401CCU6',
    sourceType: 'errata',
    trustLevel: 'canonical',
    revision: 'Rev 2',
    content: `STM32F401CCU6 — Errata Sheet — Rev 2

Silicon Revision B (Device Revision 2)

Errata Item: I2C analog filter may lock up under specific noise conditions
Workaround: Disable analog filter and use digital filter only (DNF > 0).
Severity: Low. Occurs only in high-noise environments.

Errata Item: RTC calendar may be incorrect after power-on if BYPSHAD not set
Workaround: Set BYPSHAD bit or read shadow registers twice with delay.
Severity: Low.`,
  },
];

// ── ESP32-S3-WROOM-1-N8R8 ─────────────────────────────────────────────────────

const ESP32S3_N8R8_FIXTURES: FixtureDocument[] = [
  {
    family: 'ESP32-S3',
    manufacturer: 'Espressif',
    mpn: 'ESP32-S3-WROOM-1-N8R8',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 1.5',
    content: `ESP32-S3-WROOM-1-N8R8 — Wi-Fi + BLE Module
Datasheet — Rev 1.5

Description
The ESP32-S3-WROOM-1-N8R8 is a powerful, generic Wi-Fi + Bluetooth LE MCU module
based on Espressif ESP32-S3 series. It features a dual-core Xtensa LX7 processor running
at up to 240 MHz, with 8MB flash and 8MB PSRAM.

Absolute Maximum Ratings
Supply voltage (3V3): -0.3 to 3.6 V
Input voltage on IO pins: -0.3 to 3.6 V
Storage temperature: -40 to 85 °C
ESD protection: 2000 V HBM (module level)

Recommended Operating Conditions
Supply voltage (3V3): 3.0 to 3.6 V (typ 3.3 V)
Operating temperature: -40 to 85 °C
IO voltage: 3.3 V (NOT 5V tolerant)

Power Requirements
Active mode (Wi-Fi + BLE, 240 MHz): Typ 200 mA peak
Active mode (CPU only, 240 MHz): Typ 50 mA
Modem sleep (Wi-Fi connected): Typ 5-15 mA
Light sleep: Typ 800 µA
Deep sleep: Typ 7-10 µA (with RTC, ULP coprocessor running)

Pin Description
Module exposes 36 GPIO pins via edge connector (1.27mm pitch).
Key pins:
IO0: Strapping pin (must be HIGH for flash boot, LOW for download mode)
IO2: Strapping pin (must be LOW or floating for flash boot)
IO3: Strapping pin (SPI boot mode selection)
IO45: Strapping pin (must be LOW or floating for SPI boot)
IO46: Strapping pin (must be HIGH for SPI boot)
IO43: U0TXD (default UART TX)
IO44: U0RXD (default UART RX)
IO18: USB_D- (if USB-OTG used)
IO19: USB_D+ (if USB-OTG used)
IO35-IO42: Not available (used for internal flash/PSRAM)

Boot Configuration
Strapping pins (IO0, IO3, IO45, IO46) are sampled at reset.
IO0=HIGH, IO3=HIGH: SPI flash boot (normal operation)
IO0=LOW: USB/UART download mode
IO45=HIGH: Force ROM messages printed to UART0
IO46 must be pulled HIGH or left floating for SPI boot.

Clock Tree
External crystal: 40 MHz (on module)
Internal RC oscillators: 8 MHz (fast), 150 kHz (slow)
RTC watchdog: 32 kHz (internal RC, ±5%)
APLL: Audio PLL for I2S applications
PLL: System PLL generates CPU frequencies 40-240 MHz

USB Guidelines
Built-in USB-OTG peripheral supporting full-speed (12 Mbps) device and host.
IO18/IO19 are dedicated USB pins when USB-OTG is enabled.
Can be used for JTAG debug without external debugger.
USB CDC + JTAG combined on same pins.

Recommended PCB Layout
Place module with at least 2mm clearance from other components.
Antenna area (strip at top of module) must have no copper or components underneath.
Use 4-layer PCB for best RF performance.
Keep antenna area away from metal enclosures.
Ground pads must be well soldered for thermal and RF performance.
Add 10µF + 100nF decoupling on 3V3 input, close to module pin.

Package Outline
Module dimensions: 18.0 x 25.5 x 3.1 mm
Edge connector: 1.27mm pitch, 38 pads per side (76 total, many are GND)
Weight: ~3g`,
  },
  {
    family: 'ESP32-S3',
    manufacturer: 'Espressif',
    mpn: 'ESP32-S3-WROOM-1-N8R8',
    sourceType: 'app_note',
    trustLevel: 'canonical',
    content: `ESP32-S3 Hardware Design Guidelines — Application Note

Power Supply
Use a stable 3.3V supply capable of delivering at least 500mA peak.
Recommended: AMS1117-3.3 (1A LDO) or equivalent for prototyping.
For production: Use a switching regulator (e.g. SY8089) for efficiency.
Add 10µF ceramic + 100µF electrolytic at the module's 3V3 input.
Route supply traces with adequate width (min 0.5mm for 500mA).

Antenna Design
The WROOM module has an onboard PCB antenna.
Keep the antenna area completely clear: no copper, components, or metal within 15mm.
Antenna orientation: module should be mounted so the antenna edge faces away from
ground planes and metal chassis.
For external antenna: Use IPEX connector variant of the module.

Strapping Pin Handling
IO0: Add 10kΩ pull-up to 3V3. Add a button/headers to pull LOW for programming.
IO3: Leave floating or weak pull-up (10kΩ to 3V3).
IO45: Leave floating for normal operation.
IO46: Leave floating or connect 10kΩ pull-up to 3V3.
All strapping pins must be stable during power-on reset.

Flash/PSRAM
The N8R8 variant includes 8MB Quad SPI flash and 8MB Octal SPI PSRAM.
Both are internal to the module — no external connections needed.
Do not attempt to access the SPI bus externally while module is operating.
Memory map: Flash at 0x0, PSRAM mapped to data memory region.

Debugging
Use built-in USB JTAG (IO18/IO19) or external JTAG adapter.
USB CDC provides serial console on same USB connection as JTAG.
For UART-only debugging: Connect IO43 (TX) and IO44 (RX) to USB-UART adapter.`,
  },
];

// ── ESP32-S3-WROOM-1-N8 ───────────────────────────────────────────────────────

const ESP32S3_N8_FIXTURES: FixtureDocument[] = [
  {
    family: 'ESP32-S3',
    manufacturer: 'Espressif',
    mpn: 'ESP32-S3-WROOM-1-N8',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 1.5',
    content: `ESP32-S3-WROOM-1-N8 — Wi-Fi + BLE Module
Datasheet — Rev 1.5

Description
The ESP32-S3-WROOM-1-N8 is a Wi-Fi + Bluetooth LE MCU module based on ESP32-S3
with 8MB flash (no PSRAM). Dual-core Xtensa LX7 at up to 240 MHz.

Absolute Maximum Ratings
Supply voltage (3V3): -0.3 to 3.6 V
Input voltage on IO pins: -0.3 to 3.6 V
Storage temperature: -40 to 85 °C

Recommended Operating Conditions
Supply voltage (3V3): 3.0 to 3.6 V (typ 3.3 V)
Operating temperature: -40 to 85 °C

Power Requirements
Active mode (Wi-Fi + BLE, 240 MHz): Typ 185 mA peak
Active mode (CPU only, 240 MHz): Typ 45 mA
Deep sleep: Typ 7 µA

Pin Description
Same pinout as ESP32-S3-WROOM-1-N8R8 (36 GPIO exposed).
IO35-IO42: Not available (used for internal flash only).

Boot Configuration
Same as ESP32-S3-WROOM-1-N8R8.

Package Outline
Module dimensions: 18.0 x 25.5 x 3.1 mm (same as N8R8 variant)
Weight: ~2.8g`,
  },
];

// ── LM7805CT ───────────────────────────────────────────────────────────────────

const LM7805_FIXTURES: FixtureDocument[] = [
  {
    family: 'LM78xx',
    manufacturer: 'Texas Instruments',
    mpn: 'LM7805CT',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev J',
    content: `LM7805CT — Positive Voltage Regulator
Datasheet — Rev J

Description
The LM7805CT is a positive voltage regulator that provides a fixed 5.0V output
from an unregulated DC input. Available in TO-220 package. Output current up to 1.5A
with adequate heatsinking.

Absolute Maximum Ratings
Input voltage: -0.3 to 35 V
Power dissipation: Internally limited (thermal shutdown at ~150°C)
Operating junction temperature range: -40 to 125 °C
Storage temperature range: -65 to 150 °C
Lead temperature (soldering, 10 sec): 260 °C

Recommended Operating Conditions
Input voltage: 7.0 to 25 V (for 5V output)
Output voltage: 4.8 to 5.2 V (typ 5.0 V)
Output current: 0 to 1.5 A
Junction temperature: -40 to 125 °C
Dropout voltage: 2.0 V typical (7V input minimum for 5V output)

Power Requirements
Quiescent current: Typ 5 mA (max 8 mA)
Ground pin current: Typ 5 mA
Ripple rejection: Typ 73 dB at 120 Hz

Pin Description
TO-220 package (3 pins):
Pin 1: Input (unregulated DC input, 7-25V)
Pin 2: Ground (common, connected to tab)
Pin 3: Output (regulated 5.0V DC)

Thermal Characteristics
Thermal resistance junction-to-case (RθJC): 4 °C/W
Thermal resistance junction-to-ambient (RθJA): 54 °C/W (TO-220, no heatsink)
With heatsink: RθJA = RθJC + RθCS + RθSA

Recommended PCB Layout
Place input capacitor (0.33µF ceramic) close to input pin.
Place output capacitor (0.1µF ceramic) close to output pin.
Use wide traces for input and output to minimize voltage drop.
Ground tab to copper pour for thermal dissipation.
Add thermal vias under tab if using multilayer board.

Reference Circuit
Input: 7-25V DC → Input capacitor 0.33µF (ceramic, close to pin) → LM7805CT → Output capacitor 0.1µF (ceramic) → 5.0V output
For higher stability: Add 1µF tantalum on output.
For noise-sensitive applications: Add LC filter on output.
Input bulk capacitor: 100µF electrolytic recommended if source is far from regulator.`,
  },
];

// ── USB4105-GF-A ───────────────────────────────────────────────────────────────

const USB4105_FIXTURES: FixtureDocument[] = [
  {
    family: 'USB-C',
    manufacturer: 'Amphenol',
    mpn: 'USB4105-GF-A',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 1.2',
    content: `USB4105-GF-A — USB Type-C Receptacle Connector
Datasheet — Rev 1.2

Description
The USB4105-GF-A is a USB Type-C (USB-C) surface-mount receptacle connector by Amphenol.
Supports USB 2.0 (480 Mbps) and USB 3.1 Gen 2 (10 Gbps) data rates.
Supports USB Power Delivery up to 100W (20V/5A) and Alternate Modes.

Absolute Maximum Ratings
Rated voltage: 20 V DC (VBUS)
Rated current: 5 A per contact (VBUS and GND)
Contact resistance: 30 mΩ max
Insulation resistance: 1000 MΩ min
Withstanding voltage: 500 V AC (1 minute)
Operating temperature: -40 to 85 °C
Mating cycles: 10,000 min

Recommended Operating Conditions
VBUS voltage: 5 V (default), up to 20 V (USB PD)
Signal pairs: CC1/CC2 (configuration channel), D+/D- (USB 2.0), TX/RX pairs (USB 3.x)
SBU1/SBU2: Sideband use pins (for Alternate Modes like DisplayPort)

Pin Description (USB-C receptacle, looking into the connector)
A1: GND    A2: SSTXp1  A3: SSTXn1  A4: VBUS  A5: CC1   A6: Dp1   A7: Dn1   A8: SBU1   A9: VBUS   A10: SSRXn2  A11: SSRXp2  A12: GND
B1: GND    B2: SSRXp1  B3: SSRXn1  B4: VBUS  B5: CC2   B6: Dp2   B7: Dn2   B8: SBU2   B9: VBUS   B10: SSTXn2  B11: SSTXp2  B12: GND

Note: Pin assignment is symmetric to support reversible plug orientation.

Recommended PCB Layout
Footprint: SMT, 0.5mm pitch (signal), through-hole shields.
Keep differential pairs (TX, RX, D+/D-) impedance matched at 90Ω.
Route USB 2.0 D+/D- as differential pair, length matched within 0.25mm.
Route USB 3.x TX/RX pairs as differential pairs, length matched within 0.15mm.
Place ESD protection on all signal pins, close to connector.
VBUS traces: Use wide traces or copper pour rated for 5A.
Add 10kΩ pull-down resistors (5.1kΩ for default USB) on CC1 and CC2 to GND.

Package Outline
Connector type: USB Type-C female receptacle, right-angle or vertical.
Mounting: SMT with through-hole mounting tabs for mechanical strength.
Body dimensions: 8.94 x 7.35 mm (typical for 16-pin SMT)
Recommended land pattern per Amphenol drawing.`,
  },
];

// ── PRTR5V0U2X ────────────────────────────────────────────────────────────────

const PRTR5V0U2X_FIXTURES: FixtureDocument[] = [
  {
    family: 'PRTR5V0U2X',
    manufacturer: 'NXP',
    mpn: 'PRTR5V0U2X',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 3',
    content: `PRTR5V0U2X — Ultra Low Capacitance Dual TVS/ESD Protection Diode
Datasheet — Rev 3

Description
The PRTR5V0U2X is a bi-directional ESD protection diode array designed to protect
high-speed data lines (USB 2.0, HDMI, etc.) from Electrostatic Discharge (ESD),
Electrical Fast Transients (EFT), and surge events.

Absolute Maximum Ratings
Reverse working voltage (VRWM): 5.0 V
Breakdown voltage (VBR): Min 6.0 V, Typ 6.7 V
Clamping voltage at IPP=3A (VC): Max 12 V
Peak pulse power (8/20µs): 80 W
ESD protection: IEC 61000-4-2, ±15 kV (air), ±8 kV (contact)
EFT protection: IEC 61000-4-4, 40 A (5/50 ns)

Recommended Operating Conditions
Operating voltage: 0 to 5.5 V (any line to GND)
Operating temperature: -40 to 125 °C
Junction temperature: -40 to 125 °C

Power Requirements
Leakage current at VRWM: Max 1 µA (typ 0.1 µA)

Pin Description
SOT-143 package (4 pins):
Pin 1: I/O1 (protected line 1, connects to USB D+)
Pin 2: GND (ground)
Pin 3: I/O2 (protected line 2, connects to USB D-)
Pin 4: VCC (positive supply rail, connects to protected bus voltage or VBUS)

Electrical Characteristics
Capacitance (line-to-line): Typ 0.8 pF (at 1 MHz, VR = 0 V)
Capacitance (line-to-GND): Typ 2.5 pF
Clamping voltage (IPP=1A): Typ 7.5 V
Dynamic resistance: Typ 0.5 Ω

Recommended PCB Layout
Place as close to the USB connector as possible (within 5mm).
Route protected traces through the ESD diode before reaching the IC.
Keep stub lengths from protected line to diode under 2mm.
Connect GND pin directly to solid ground plane.
Connect VCC pin to VBUS or leave floating (depends on application).

Reference Circuit
For USB 2.0 protection:
USB_DP → Pin 1 (I/O1)
USB_DM → Pin 3 (I/O2)
Pin 2 (GND) → Ground plane
Pin 4 (VCC) → VBUS (5V)
Place within 3mm of USB connector for best protection.

Package Outline
Package: SOT-143 (also known as SOT-343)
Dimensions: 2.9 x 1.5 x 1.1 mm
Pitch: 0.95 mm (gull wing leads)
Land pattern: 4 pads, 0.55 x 0.75 mm each`,
  },
];

// ── ABM8-16.000MHZ-B2-T ───────────────────────────────────────────────────────

const ABM8_FIXTURES: FixtureDocument[] = [
  {
    family: 'ABM8',
    manufacturer: 'Abracon',
    mpn: 'ABM8-16.000MHZ-B2-T',
    sourceType: 'datasheet',
    trustLevel: 'canonical',
    revision: 'Rev 2',
    content: `ABM8-16.000MHZ-B2-T — Quartz Crystal
Datasheet — Rev 2

Description
The ABM8-16.000MHZ-B2-T is a surface-mount quartz crystal unit operating at 16.000 MHz
in a compact ceramic package. Designed for microcontroller clock applications.

Absolute Maximum Ratings
Storage temperature range: -55 to 125 °C
Drive level: 500 µW max

Recommended Operating Conditions
Nominal frequency: 16.000 MHz
Operating temperature range: -40 to 85 °C (standard), -40 to 125 °C (extended)
Frequency tolerance at 25°C: ±30 ppm (B2 variant)
Frequency stability over temperature: ±50 ppm (-40 to 85°C)
Load capacitance (CL): 20 pF
Equivalent series resistance (ESR): Max 60 Ω
Shunt capacitance (C0): Max 7 pF
Motional capacitance (C1): Typ 7 fF
Drive level: 100 µW typ, 500 µW max
Aging (first year): ±3 ppm

Power Requirements
Drive level: 100 µW recommended (no DC power supply needed — passive component)

Pin Description
SMD 4-pad ceramic package:
Pad 1: Crystal terminal 1 (no polarity)
Pad 2: Crystal terminal 2 (no polarity)
Pad 3: Mechanical ground / NC (connect to ground plane)
Pad 4: Mechanical ground / NC (connect to ground plane)

Clock Tree
When used with STM32F4 HSE oscillator circuit:
External load capacitors required: CL_calc = 2 × (CL_spec - C_stray)
  = 2 × (20 - 7) = 26 pF → use 27 pF standard value (or 22pF for 3.3V CMOS)
Feedback resistor: Internal to STM32 oscillator cell.
Series resistor: Not needed for ABM8 at 16 MHz with STM32F4.
Drive level from MCU: Typically 200-500 µW — within ABM8 rating.

Recommended PCB Layout
Place crystal as close to MCU oscillator pins as possible (within 10mm).
Route crystal traces away from high-frequency digital signals.
Ground pads 3 and 4 to ground plane for mechanical stability and noise shielding.
Keep load capacitors close to crystal (within 5mm of crystal pads).
Avoid running other signal traces between crystal pads and MCU oscillator pins.
Use a ground guard ring around crystal circuit on the component layer.

Package Outline
Package type: SMD ceramic, 4-pad
Dimensions: 3.2 × 2.5 × 0.7 mm
Pad layout: 2 active pads (diagonal) + 2 ground pads
  Marking: Frequency and lot code on top surface`,
  },
];

export const FIXTURE_DOCUMENTS: FixtureDocument[] = [
  ...STM32F407_FIXTURES,
  ...STM32F401_FIXTURES,
  ...ESP32S3_N8R8_FIXTURES,
  ...ESP32S3_N8_FIXTURES,
  ...LM7805_FIXTURES,
  ...USB4105_FIXTURES,
  ...PRTR5V0U2X_FIXTURES,
  ...ABM8_FIXTURES,
];
