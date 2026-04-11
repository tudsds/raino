# STM32F4 Development Board

A shorter example showing how to start an STM32F4-based dev board project in Raino.

## What This Is

This is a worked example for a general-purpose STM32F407 development board. It covers the intake and specification stages and shows what a realistic BOM looks like for this class of board. It does not go as deep as the ESP32 Sensor Hub example, which traces the full workflow through quoting and handoff.

## The Project

An STM32F407VGT6 development board aimed at engineers prototyping embedded firmware. The board exposes the MCU's full peripheral set through standard headers, provides USB and Ethernet connectivity out of the box, and includes an on-board debugger so you do not need an external ST-LINK.

**Target use cases:**

- Embedded Linux bring-up with external RAM
- Real-time control with CAN bus
- USB device and host development
- Ethernet-based IoT gateway prototyping

## Intake

Starting a new project in Raino begins with a natural language description. For this board, the intake might look like this:

> I want to build a development board around the STM32F407VGT6. It needs USB 2.0 FS, 10/100 Ethernet, a micro-SD card slot, and an integrated ST-LINK debugger. Standard 0.1 inch headers for GPIO access. Power from USB or a 5V barrel jack.

Raino would follow up with clarifying questions about:

- Clock source preferences (external crystal vs. internal oscillator)
- Whether you need external SRAM or SDRAM
- LED and button placement
- PCB size constraints
- Production volume

After a few exchanges, the system has enough to compile a spec.

## Extracted Requirements

Based on the intake, Raino extracts these requirements:

1. STM32F407VGT6 MCU (168 MHz Cortex-M4, 1 MB Flash, 192 KB SRAM)
2. USB 2.0 Full-Speed with Micro-B connector
3. 10/100 Ethernet PHY (LAN8720A or equivalent)
4. Micro-SD card slot via SDIO
5. Integrated ST-LINK V2 debugger (STM32F103C8T6)
6. 0.1 inch pitch header rows for GPIO
7. USB or 5V barrel jack power input
8. 3.3V and 5V power rails
9. Reset button, user button, power LED, user LED
10. External 8 MHz crystal for HSE, 32.768 kHz for LSE

## BOM Highlights

Here are the major components Raino would select for this board:

| Ref    | Part               | MPN                    | Manufacturer       | Package       | Qty | Unit Price | Risk |
| ------ | ------------------ | ---------------------- | ------------------ | ------------- | --- | ---------- | ---- |
| U1     | Main MCU           | STM32F407VGT6          | STMicroelectronics | LQFP-100      | 1   | $10.50     | Low  |
| U2     | Debugger MCU       | STM32F103C8T6          | STMicroelectronics | LQFP-48       | 1   | $3.25      | Low  |
| U3     | Ethernet PHY       | LAN8720A               | Microchip          | QFN-24        | 1   | $1.85      | Low  |
| U4     | USB UART           | CH340G                 | WCH                | SOP-16        | 1   | $0.45      | Low  |
| U5     | LDO 3.3V           | AMS1117-3.3            | AMS                | SOT-223       | 1   | $0.15      | Low  |
| U6     | EEPROM             | AT24C256C              | Microchip          | SOIC-8        | 1   | $0.35      | Low  |
| U7     | Level Shifter      | TXB0108PWR             | Texas Instruments  | TSSOP-20      | 1   | $0.85      | Low  |
| J1     | RJ45 Magjack       | HR911105A              | HanRun             | Integrated    | 1   | $1.20      | Low  |
| J2     | Micro-SD Slot      | DM3AT-SF-PEJM5         | JAE                | Push-Push SMD | 1   | $0.65      | Low  |
| J3     | USB Micro-B        | 10118194-0001LF        | Amphenol           | SMD           | 1   | $0.30      | Low  |
| Y1     | 8 MHz Crystal      | ABM8-8.000MHZ-20-B2X-T | Abracon            | HC49/SMD      | 1   | $0.25      | Low  |
| Y2     | 32.768 kHz Crystal | ABS07-32.768KHZ-T      | Abracon            | HC49/SMD      | 1   | $0.30      | Low  |
| R1-R30 | Various            | Mixed                  | Yageo              | 0603/0805     | 30  | $0.01 avg  | Low  |
| C1-C20 | Various            | Mixed                  | Samsung/Murata     | 0603/0805     | 20  | $0.02 avg  | Low  |

**Estimated BOM total: approximately $24.50 per board**

All parts are in active lifecycle status with low supply risk. The STM32F407VGT6 is one of the most widely stocked Cortex-M4 parts on the market, available from DigiKey, Mouser, LCSC, and JLCPCB.

## Architecture

This board would use Raino's **ARM Cortex-M Development Board** architecture template. The template defines these functional blocks:

- **Core Processing**: STM32F407 with clock tree, reset circuit, and boot configuration
- **Debug Subsystem**: ST-LINK V2 with SWD header passthrough
- **Connectivity**: USB FS, Ethernet with RJ45 magjack, micro-SD
- **Power**: 5V input regulation to 3.3V, USB power switching
- **GPIO Expansion**: 0.1 inch headers with standard Arduino-like pinout option
- **User Interface**: LEDs, buttons, and jumpers for boot mode selection

## Quick Start with This Example

```bash
# Start the Raino studio
pnpm dev --filter @raino/studio

# Open http://localhost:3001
```

Create a new project and paste the intake text above into the chat panel. Raino will ask follow-up questions, then generate a structured spec once it has enough information.

### Bootstrap via API

```bash
# Create the project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "STM32F4 Dev Board"}'

# Submit the initial intake message
curl -X POST http://localhost:3001/api/projects/<id>/intake \
  -H "Content-Type: application/json" \
  -d '{"content": "I want to build a development board around the STM32F407VGT6. It needs USB 2.0 FS, 10/100 Ethernet, a micro-SD card slot, and an integrated ST-LINK debugger. Standard 0.1 inch headers for GPIO access. Power from USB or a 5V barrel jack."}'

# Run the intake clarification loop
curl -X POST http://localhost:3001/api/projects/<id>/clarify

# Once intake is ready, compile the spec
curl -X POST http://localhost:3001/api/projects/<id>/spec/compile

# Select the architecture template
curl -X POST http://localhost:3001/api/projects/<id>/architecture/plan
```

## Notes

- The STM32F407VGT6 is an LQFP-100 package, which means the board needs at least 4 layers for clean routing.
- The ST-LINK debugger shares the SWD pins with the target MCU through a jumper, so the user can disconnect the debugger after firmware is flashed.
- The LAN8720A needs a 25 MHz crystal on its XI/XO pins, separate from the MCU crystals. This is a common gotcha in Ethernet designs.
- This board is well-suited for JLCPCB assembly since all parts are available in their standard SMT catalog.

## See Also

- [ESP32 Sensor Hub](../esp32-sensor-hub/README.md) for a full end-to-end walkthrough including quoting and handoff
- [Raino API reference](../../docs/api/README.md) for complete API documentation
