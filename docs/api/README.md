# Raino API Reference

## Base URL

- Studio: `http://localhost:3001` (development)
- Production: configured via Vercel deployment

## Authentication

Not implemented in bootstrap. API routes are open for development.
Production deployment should add authentication middleware.

## Project Lifecycle

### Create Project

```
POST /api/projects
Body: { name: string, description: string }
Response: { project: Project }
```

### Intake

```
POST /api/projects/:id/intake
Body: { message: string, files?: File[] }
Response: { clarifyingQuestions?: string[], isReadyForSpec: boolean }
```

### Clarification

```
POST /api/projects/:id/clarify
Body: { questionId: string, answer: string }
Response: { isReadyForSpec: boolean, remainingQuestions?: string[] }
```

### Compile Specification

```
POST /api/projects/:id/spec/compile
Body: { intakeMessages: Message[] }
Response: { spec: ProductSpec, warnings: string[] }
```

### Plan Architecture

```
POST /api/projects/:id/architecture/plan
Body: { spec: ProductSpec }
Response: { architecture: ArchitectureTemplate, rationale: string }
```

## Ingestion

### Discover Candidates

```
POST /api/projects/:id/ingest/candidates
Body: { spec: ProductSpec, architecture: ArchitectureTemplate }
Response: { candidates: CandidateFamily[] }
```

### Run Ingestion

```
POST /api/projects/:id/ingest/run
Body: { families: SeedFamily[], mode: 'live' | 'fixture' | 'degraded' }
Response: { runId: string, status: 'started' }
```

### Get Ingestion Status

```
GET /api/projects/:id/ingest/status
Response: { runId: string, stage: string, progress: number, status: string }
```

### Promote Ingestion Results

```
POST /api/projects/:id/ingest/promote
Body: { runId: string }
Response: { promoted: boolean, sufficiencyReport: SufficiencyReport }
```

## BOM

### Generate BOM

```
POST /api/projects/:id/bom/generate
Body: { spec: ProductSpec, architecture: ArchitectureTemplate, candidates: CandidatePart[] }
Response: { bom: BOMRow[], warnings: string[] }
```

## Design

### Generate Design

```
POST /api/projects/:id/design/generate
Body: { bom: BOMRow[], architecture: ArchitectureTemplate }
Response: { jobId: string, status: 'queued' }
```

### Validate Design

```
POST /api/projects/:id/validate
Body: { checks: ('erc' | 'drc')[] }
Response: { results: ValidationResult[] }
```

## Previews

### Schematic Preview

```
GET /api/projects/:id/previews/schematic
Response: { svgUrl: string, pdfUrl: string }
```

### PCB 2D Preview

```
GET /api/projects/:id/previews/pcb2d
Response: { svgUrl: string }
```

### PCB 3D Preview

```
GET /api/projects/:id/previews/pcb3d
Response: { glbUrl: string }
```

## Downloads

### Get Downloads

```
GET /api/projects/:id/downloads
Response: { files: DownloadFile[] }
```

Each DownloadFile has: filename, url, size, type, checksum.

## Quote

### Generate Rough Quote

```
POST /api/projects/:id/quote/rough
Body: { bomId: string, options?: { quantity?: number, region?: string, includeAssembly?: boolean } }
Response: { quote: RoughQuote }
```

Quote contains: lowQuote, midQuote, highQuote, confidenceLevel, assumptions, isEstimate flag.

## Order Intent

### Submit Order Intent

```
POST /api/projects/:id/order-intent
Body: { quoteId: string, quantity: number }
Response: { intentId: string, status: 'received' }
```

### Request PCBA Quote

```
POST /api/projects/:id/handoff/pcba
Body: { quoteId: string }
Response: { handoffId: string, status: 'submitted', message: string }
```

## Audit

### Get Audit Trail

```
GET /api/projects/:id/audit
Response: { report: AuditReport }
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Common error codes:

- `VALIDATION_ERROR` — Input failed schema validation
- `NOT_FOUND` — Resource not found
- `INVALID_STATE` — Operation not valid for current workflow state
- `INSUFFICIENT_DATA` — Required data missing (sufficiency gate failed)
- `EXTERNAL_ERROR` — External service (KiCad, supplier) error
- `DEGRADED_MODE` — Running in degraded/fixture mode

## Rate Limiting

Not implemented in bootstrap. Production should add rate limiting.
