# Security Model

## Data Handling

### Engineering Documents

- Sourced from official manufacturer websites
- Provenance tracked (source URL, fetch timestamp, revision)
- Trust levels: canonical (manufacturer direct) vs secondary
- Checksums for integrity verification

### User Data

- Project descriptions and specifications are user data
- File uploads are user data
- Not shared with third parties without explicit consent

### Supplier API Data

- Supplier API credentials are environment variables
- Never committed to the repository
- Rate-limited to respect supplier terms of service
- Fixture mode available when credentials are missing

## No-Fake-Integration Policy

Raino never:

- Fabricates live pricing data
- Claims a live API connection when using fixtures
- Silently downgrades to degraded mode without reporting
- Proceeds past critical ambiguity without user confirmation

Every degraded-mode path is inspectable via audit trail.

## Audit Trail

Every significant action is logged:

- BOM decisions traceable to sources
- Part selections record provenance
- Artifacts have manifests with checksums
- Quotes record all assumptions
- Policy violations are surfaced

## Input Validation

All API inputs validated with Zod schemas:

- Type-safe parsing
- Clear error messages
- No `any` types anywhere in the stack

## External Boundaries

### KiCad Worker

- External GPL-licensed tool boundary
- Not embedded in Raino
- Communication via defined CLI command contracts
- No KiCad code in Raino repository

### Supplier Adapters

- Interface + Adapter pattern
- No direct database connections
- Mock implementations for testing
- Real implementations require API credentials

## Licensing

- Raino: MIT license
- KiCad: External GPL boundary (not embedded)
- KiCad libraries and generated designs have different license considerations
- No GPL code copied into Raino
