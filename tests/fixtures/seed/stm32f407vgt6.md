# STM32F407VGT6 — Absolute Maximum Ratings

Supply voltage (VDD): 1.7 to 3.6 V
External analog supply voltage (VDDA): 1.7 to 3.6 V
Backup domain supply voltage (VBAT): 1.7 to 3.6 V
USB OTG FS supply voltage (OTG_FS_VBUS): 0 to 5.5 V
Input voltage on any pin (five-volt tolerant): -0.3 to VDD+0.3 V
Input voltage on any pin (non-five-volt tolerant): -0.3 to VDD+0.3 V
Total output current sunk by sum of all IOs: 120 mA
Total output current sourced by sum of all IOs: 120 mA
Output current sunk by any IO: 25 mA
Output current sourced by any IO: -25 mA
Junction temperature: -40 to 125 °C
Storage temperature: -65 to 150 °C

# STM32F407VGT6 — Recommended Operating Conditions

Supply voltage (VDD): 1.8 to 3.6 V
External analog supply voltage (VDDA): VDD
System clock frequency: up to 168 MHz
Flash memory: 1 MB
RAM: 192 KB (128 KB + 64 KB CCM)
Package: LQFP100 14x14 mm
GPIO: up to 82

# STM32F407VGT6 — Pin Description

PA0: GPIO / ADC123_IN0 / WKUP / TIM2_CH1 / TIM5_CH1 / ETH_MII_CRS / TIM8_ETR
PA1: GPIO / ADC123_IN1 / TIM2_CH2 / TIM5_CH2 / ETH_MII_RX_CLK / ETH_RMII_REF_CLK
PA2: GPIO / ADC123_IN2 / TIM2_CH3 / TIM5_CH3 / TIM9_CH1 / ETH_MDIO / USART2_TX
PA3: GPIO / ADC123_IN3 / TIM2_CH4 / TIM5_CH4 / TIM9_CH2 / ETH_MII_COL / USART2_RX
PA9: GPIO / TIM1_CH2 / I2C3_SCL / USART1_TX
PA10: GPIO / TIM1_CH3 / I2C3_SDA / USART1_RX / OTG_FS_ID
PA11: GPIO / TIM1_CH4 / USART1_CTS / OTG_FS_DM / SPI4_MISO
PA12: GPIO / TIM1_ETR / USART1_RTS / OTG_FS_DP / SPI4_MOSI
PA13: GPIO / JTMS-SWDIO / IRDA_OUT / SPI6_SCK
PA14: GPIO / JTCK-SWCLK
PA15: GPIO / JTDI / SPI3_NSS / SPI1_NSS / TIM2_CH1

PB0: GPIO / ADC12_IN8 / TIM3_CH3 / TIM8_CH2 / OTG_HS_ULPI_D1 / ETH_MII_RXD2
PB1: GPIO / ADC12_IN9 / TIM3_CH4 / TIM8_CH3L / OTG_HS_ULPI_D2 / ETH_MII_RXD3
PB3: GPIO / JTDO / SPI3_SCK / TIM2_CH2
PB6: GPIO / TIM4_CH1 / I2C1_SCL / USART1_TX / CAN2_TX
PB7: GPIO / TIM4_CH2 / I2C1_SDA / USART1_RX / CAN2_RX

PC0: GPIO / ADC123_IN10 / ETH_MII_MDC / OTG_HS_ULPI_STP
PC1: GPIO / ADC123_IN11 / ETH_MII_MDO / ETH_RMII_MDC
PC4: GPIO / ADC12_IN14 / ETH_MII_RX_DV / ETH_RMII_CRS_DV
PC5: GPIO / ADC12_IN15 / ETH_MII_RX_CLK / ETH_RMII_REF_CLK

PD2: GPIO / TIM3_ETR / UART5_RX / SDIO_CMD
PD8: GPIO / USART3_TX / SDIO_DATA24
PD9: GPIO / USART3_RX / SDIO_DATA25

# STM32F407VGT6 — Power Requirements

Power supply scheme: 1.8 to 3.6 V single supply
Power consumption (all peripherals enabled, 168 MHz): up to 94 mA
Power consumption (low-power run mode, 32 kHz): ~7 µA
Standby mode current: ~2.8 µA
VBAT backup domain current: ~1 µA
Power-on reset threshold: 1.7 V
Supply current ramp rate: must not exceed 50 mA/µs

Each VDD pin must be decoupled with a 100 nF ceramic capacitor placed close to the pin.
One 4.7 µF tantalum capacitor must be connected between VDD and VSS.

# STM32F407VGT6 — Boot Configuration

BOOT0 pin: determines boot mode
BOOT1 pin (PB2): secondary boot selection

Boot modes:

- Main Flash memory: BOOT0=0 (default)
- System memory (bootloader): BOOT0=1, BOOT1=0
- Embedded SRAM: BOOT0=1, BOOT1=1

System memory bootloader supports: USART, USB DFU, I2C, SPI, CAN
Bootloader USART default baud: 115200 8N1 on USART1 (PA9/PA10) or USART3 (PB10/PB11)

# STM32F407VGT6 — Clock Tree

HSE oscillator: 4 to 26 MHz (typical: 8 MHz)
HSI RC oscillator: 16 MHz (±1%)
LSE oscillator: 32.768 kHz
LSI RC: 32 kHz

PLL configuration:

- PLL source: HSE or HSI
- PLLM: 2-63 (divide by)
- PLLN: 64-432 (multiply by)
- PLLP: 2, 4, 6, 8 (divide by for system clock)
- PLLQ: 2-15 (divide by for USB OTG FS, SDIO, RNG)

Typical 168 MHz configuration with 8 MHz HSE:
PLLM=8, PLLN=336, PLLP=2 → SYSCLK=168 MHz
PLLQ=7 → 48 MHz for USB

# STM32F407VGT6 — USB Guidelines

USB OTG FS (full-speed) controller:

- 48 MHz clock from PLLQ
- PA11 (DM), PA12 (DP) dedicated pins
- Supports host, device, and OTG modes
- 1 bidirectional endpoint (EP0) + 5 IN endpoints + 5 OUT endpoints
- FIFO size: 1.25 KB

USB device application requires:

- 48 MHz ±0.25% clock source (use PLL)
- 1.5 kΩ pullup on DP for full-speed enumeration
- VBUS sensing on PA9

# STM32F407VGT6 — Recommended PCB Layout

Decoupling: Place 100 nF capacitors within 5 mm of each VDD pin. Add 4.7 µF bulk cap near power entry.
Ground plane: Use continuous ground plane on layer adjacent to MCU.
Crystal: Place HSE crystal within 10 mm of OSC_IN/OSC_OUT pins. Guard with ground vias.
USB routing: Route USB DM/DP as differential pair (90Ω impedance). Keep traces short.
Power: Route VDDA (analog supply) separately from digital VDD. Use ferrite bead if needed.
Boot pins: Add pull-up/pull-down resistors on BOOT0 (100kΩ to GND for flash boot).
SWD header: Route PA13, PA14, VDD, GND to a 4-pin debug header.

# STM32F407VGT6 — Package Outline

Package: LQFP100 (Low-profile Quad Flat Package)
Body size: 14 x 14 mm
Lead pitch: 0.5 mm
Lead width: 0.22 mm
Lead length: 1.0 mm
Package height: 1.6 mm
Thermal pad: None (LQFP)
Pin 1 indicator: Dot in corner

Footprint land pattern:

- Pad size: 0.6 x 1.8 mm (typical)
- Pad pitch: 0.5 mm
- Solder mask opening: 0.7 x 1.9 mm

# STM32F407VGT6 — Errata Summary

ES0206 Rev 7 (Silicon rev Z):

1. RCC: HSE oscillator may not start under specific PCB capacitance conditions
   Workaround: Add series resistor 100-500Ω between crystal and OSC_IN

2. USB: OTG_FS may incorrectly detect SOF in host mode
   Workaround: Software workaround available, see errata ES0206 section 2.5.2

3. ADC: IN16 (temperature sensor) accuracy may be affected by adjacent GPIO switching
   Workaround: Reduce GPIO switching during ADC conversion or use hardware averaging

4. I2C: Bus stuck condition in master mode under noisy conditions
   Workaround: Implement I2C bus recovery sequence (toggle SCL up to 9 times)

5. Flash: Option bytes programming may fail if VDD < 2.0 V
   Workaround: Ensure VDD >= 2.7 V when programming option bytes
