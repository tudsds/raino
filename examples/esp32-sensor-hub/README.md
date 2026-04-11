# ESP32 Sensor Hub

A complete walkthrough of designing a battery-powered environmental monitoring board using Raino.

## What This Is

This example traces a real Raino workflow from start to finish: a fuzzy idea ("I need a sensor hub") becomes a structured spec, an approved architecture, a sourced BOM, a KiCad project, and a rough manufacturing quote. Every step below mirrors what the Raino studio app does internally.

## The Project

An ESP32-S3 based environmental monitoring board for industrial IoT deployments. It measures temperature, humidity, barometric pressure, CO2, and VOCs, then transmits readings over WiFi. It runs on a single 18650 Li-ion cell with a target battery life of three months or more.

**Key design choices:**

- ESP32-S3 for low-power WiFi/BLE (not the older ESP32, which burns more current in deep sleep)
- Sensirion SCD40 for CO2 (photoacoustic sensing, no warm-up drift)
- Sensirion SGP40 for VOCs (outputs a self-calibrating air quality index, no humidity compensation needed)
- Bosch BME280 for temperature/humidity/pressure (well-documented, widely available)
- TP4056 + MOSFET load switch for battery charging and disconnect

## Step 1: Intake

Everything starts with a natural language conversation. You describe what you want. Raino asks clarifying questions until it has enough to generate a spec.

Here is the actual intake exchange for this project:

**User:**

> I need a sensor hub board that can read temperature, humidity, pressure, and air quality. It should connect via WiFi and run on battery power.

**Raino:**

> I understand you need a battery-powered IoT sensor hub. A few clarifications:
>
> 1. What battery voltage/chemistry are you planning to use?
> 2. What is your target battery life?
> 3. Do you need any specific air quality sensors (CO2, VOCs, particulates)?
> 4. What is your expected production volume?

**User:**

> 18650 Li-ion, 3 months minimum battery life, CO2 and VOCs, initial run of 500 units.

**Raino:**

> Based on your requirements, I recommend:
>
> - ESP32-S3 for low-power WiFi/BLE
> - SCD40 for CO2 sensing
> - SGP40 for VOC detection
> - BME280 for temperature/humidity/pressure
> - Power management IC for 18650 charging
>
> I have sufficient information to generate specifications. Shall I proceed?

At this point the intake session passes the sufficiency check and the system moves forward.

## Step 2: Structured Specification

From the conversation, Raino extracts a structured product spec. The spec captures everything the design engine needs to work with: form factor, interfaces, power budget, and hard constraints.

The full spec is in [example-spec.json](./example-spec.json). Here are the extracted requirements:

1. ESP32-S3 wireless MCU
2. 18650 Li-ion battery powered
3. 3+ month battery life target
4. SCD40 CO2 sensor
5. SGP40 VOC sensor
6. BME280 environmental sensor
7. 500 unit initial production

Key constraints that shape the design:

- Board area limited to 2500 mm squared (55 x 40 mm)
- All sensors share an I2C bus with independent addresses
- Operating range from -20 to 85 degrees Celsius
- Battery charging with over-charge and over-discharge protection

## Step 3: Architecture Selection

Raino matches the spec against its library of approved architecture templates. For this project it selects the **Battery-Powered IoT Sensor Hub** template (`iot-sensor-hub-v1`).

The template defines five functional blocks:

| Block                | Role                                                                | Selected Part       |
| -------------------- | ------------------------------------------------------------------- | ------------------- |
| Wireless MCU         | Central processor, wireless comms, sensor polling, sleep scheduling | ESP32-S3-WROOM-1-N8 |
| CO2 Sensor           | Ambient CO2 measurement                                             | SCD40-D-R2          |
| VOC Sensor           | Volatile organic compound detection                                 | SGP40-D-R4          |
| Environmental Sensor | Temperature, humidity, pressure                                     | BME280              |
| Power Management     | Battery charging, protection, load switching                        | TP4056              |

The architecture template constrains what the design worker can do. It defines valid inter-block connections, acceptable package types, and power rail assignments. The design engine works within these boundaries.

## Step 4: Document Ingestion

Before Raino generates a BOM, it runs the ingestion pipeline to collect official engineering documents for every candidate part:

- Datasheets (mandatory)
- Errata (if the vendor publishes them)
- Application notes (for complex parts)
- Package outlines and land patterns

Each part goes through an eight-stage ingestion pipeline. The sufficiency gate checks that all required documents exist and contain the right fields. If the gate fails for any part, Raino reports the gap and does not proceed.

For this project, all parts passed ingestion. The SCD40 was flagged as medium risk due to limited second-source availability, but the datasheet and application notes were sufficient to continue.

## Step 5: BOM Generation

With the architecture locked and documents ingested, Raino resolves supplier metadata for every part and builds a complete BOM.

### Final BOM

| Ref    | Part                   | MPN                 | Manufacturer     | Package | Qty | Unit Price | Risk   |
| ------ | ---------------------- | ------------------- | ---------------- | ------- | --- | ---------- | ------ |
| U1     | Wi-Fi + BT 5.0 MCU     | ESP32-S3-WROOM-1-N8 | Espressif        | SMD-38  | 1   | $2.45      | Low    |
| U2     | CO2 Sensor             | SCD40-D-R2          | Sensirion        | LGA-10  | 1   | $15.20     | Medium |
| U3     | VOC Sensor             | SGP40-D-R4          | Sensirion        | DFN-6   | 1   | $3.80      | Low    |
| U4     | Temp/Humidity/Pressure | BME280              | Bosch            | LGA-8   | 1   | $2.15      | Low    |
| U5     | Li-ion Charger         | TP4056              | NanJing TopPower | SOP-8   | 1   | $0.35      | Low    |
| Q1,Q2  | P-Channel MOSFET       | SI2301CDS-T1-GE3    | Vishay           | SOT-23  | 2   | $0.12      | Low    |
| R1-R10 | 10k Resistor           | RC0603FR-0710KL     | Yageo            | 0603    | 10  | $0.01      | Low    |
| C1-C8  | 10uF Ceramic Cap       | CL10A106KP8NNNC     | Samsung          | 0603    | 8   | $0.03      | Low    |
| L1     | Power Inductor         | LQM18FN4R7M00D      | Murata           | 0603    | 1   | $0.18      | Medium |
| D1     | Schottky Diode         | MBR120VLSFT1G       | onsemi           | SOD-123 | 1   | $0.28      | Low    |

**Total BOM cost: $28.73 per board** (estimate)

The BOM is KiCad-ready. Every line has a footprint mapping, a supplier source, and a lifecycle status. Alternates are available for the SCD40 and the power inductor, the two medium-risk items.

## Step 6: KiCad Project Generation

The design worker takes the BOM and the architecture template and produces a KiCad project:

- `.kicad_pro` project file
- `.kicad_sch` schematic with all symbols wired per the architecture
- `.kicad_pcb` layout with footprints placed and routed

The design then runs through ERC (electrical rule check) and DRC (design rule check). Any violations are reported and must be resolved before proceeding.

From the KiCad project, Raino generates preview assets:

- Schematic PDF and SVG
- PCB 2D top/bottom copper views
- Interactive 3D board model (GLB)

And manufacturing artifacts:

- Gerber files (RS-274X)
- BOM CSV
- Pick-and-place file
- Drill file
- Manufacturing bundle (ZIP containing everything)

## Step 7: Quote

The quote engine produces three pricing bands based on order volume.

### Pricing Bands

| Tier | Unit Price | MOQ   | NRE    | Tooling | Lead Time | Confidence |
| ---- | ---------- | ----- | ------ | ------- | --------- | ---------- |
| Low  | $18.50     | 1,000 | $2,500 | $800    | 4 weeks   | 75%        |
| Mid  | $22.30     | 500   | $2,500 | $800    | 4 weeks   | 85%        |
| High | $28.75     | 100   | $2,500 | $800    | 6 weeks   | 90%        |

For the target run of 500 units at the mid-tier rate, the total comes to:

- Components and assembly: 500 x $22.30 = $11,150
- NRE: $2,500
- Tooling: $800
- **Total: $14,450**

### Quote Breakdown (per-unit at 100-unit tier)

| Component             | Cost       |
| --------------------- | ---------- |
| Design automation fee | $5.00      |
| Engineering review    | $3.00      |
| PCB fabrication       | $4.50      |
| Components            | $6.80      |
| Assembly              | $2.20      |
| QA and handling       | $1.50      |
| **Subtotal**          | **$23.00** |
| Contingency (10%)     | $2.30      |
| Margin (15%)          | $3.85      |
| **Total**             | **$28.75** |

### Assumptions

- 1.6mm FR-4 PCB, 4 layers
- ENIG surface finish
- Standard PCB tolerances
- All components sourced from authorized distributors
- Production in China (standard lead times)
- Functional test included

### What is not included

- Firmware development
- Custom test fixtures
- Certification (FCC, CE)
- Shipping and duties

## How to Run This Example

### Prerequisites

```bash
# Clone the repo and install dependencies
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install

# Start the studio app
pnpm dev --filter @raino/studio
```

Open `http://localhost:3001` in your browser.

### Walk Through the Workflow

1. **Create a project.** Click "New Project" and give it a name. The system creates a project with draft status.

2. **Run intake.** In the intake panel, type or paste the conversation from Step 1 above. When Raino has enough information, it will mark the intake as ready for specification.

3. **Compile the spec.** Raino generates a structured product specification from the intake. Review the extracted requirements and constraints. If anything looks wrong, go back to intake and add more context.

4. **Select architecture.** The system matches your spec to the `iot-sensor-hub-v1` template. Review the functional blocks and selected parts.

5. **Generate the BOM.** Raino resolves supplier metadata for each part and produces a full BOM. The SCD40 will show a medium risk flag. Review alternates if that concerns you.

6. **Generate the design.** The design worker produces a KiCad project. Without KiCad installed locally, this runs in mock mode and produces placeholder artifacts. With KiCad on your PATH, it generates real schematic and layout files.

7. **Get a quote.** The quote engine calculates rough pricing across three volume tiers. Review the assumptions and decide whether to request a PCBA handoff or download the manufacturing bundle and work with your own fabricator.

### API Approach

If you prefer to work through the API directly, here is the sequence of calls:

```bash
# Create a project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "ESP32 Sensor Hub"}'

# Submit intake messages (repeat for each message in the conversation)
curl -X POST http://localhost:3001/api/projects/example-001/intake \
  -H "Content-Type: application/json" \
  -d '{"content": "I need a sensor hub board that can read temperature, humidity, pressure, and air quality. It should connect via WiFi and run on battery power."}'

# Compile the spec
curl -X POST http://localhost:3001/api/projects/example-001/spec/compile

# Plan the architecture
curl -X POST http://localhost:3001/api/projects/example-001/architecture/plan

# Run the ingestion pipeline
curl -X POST http://localhost:3001/api/projects/example-001/ingest/run

# Generate the BOM
curl -X POST http://localhost:3001/api/projects/example-001/bom/generate

# Generate the design (requires KiCad or runs in mock mode)
curl -X POST http://localhost:3001/api/projects/example-001/design/generate

# Get a rough quote
curl -X POST http://localhost:3001/api/projects/example-001/quote/rough

# Download manufacturing artifacts
curl http://localhost:3001/api/projects/example-001/downloads

# View the audit trail
curl http://localhost:3001/api/projects/example-001/audit
```

### Load the Pre-Built Spec

To skip straight to the BOM and quote stage with this project's data, load [example-spec.json](./example-spec.json) into the studio. This lets you inspect the BOM panel, preview assets, and quote breakdown without walking through intake.

## Files in This Example

```
esp32-sensor-hub/
  README.md            # This file
  example-spec.json    # Complete structured spec, BOM, and quote
```
