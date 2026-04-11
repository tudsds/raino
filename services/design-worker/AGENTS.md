# services/design-worker — KiCad External Worker Boundary

## Purpose

External worker boundary for KiCad project generation, validation, and export.

## KiCad CLI Operations

Validation:

- `kicad-cli sch erc` — Schematic ERC
- `kicad-cli pcb drc` — PCB DRC

Schematic Export:

- `kicad-cli sch export pdf` — Schematic PDF
- `kicad-cli sch export svg` — Schematic SVG
- `kicad-cli sch export netlist` — Netlist

PCB Export:

- `kicad-cli pcb export svg` — PCB 2D SVG
- `kicad-cli pcb export glb` — PCB 3D GLB
- `kicad-cli pcb export gerbers` — Gerber files
- `kicad-cli pcb export pos` — Pick-and-place
- `kicad-cli pcb export ipc2581` — IPC-2581
- `kicad-cli pcb export odb` — ODB++

## Important

- KiCad is GPL-licensed external tool. Not embedded.
- This service defines the CONTRACT for communicating with a KiCad worker.
- Actual KiCad execution requires installed KiCad runtime.
