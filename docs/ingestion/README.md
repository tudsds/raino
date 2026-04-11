# Ingestion Pipeline

## Overview

The ingestion pipeline converts raw engineering documents into searchable, provenance-tracked knowledge that Raino uses for engineering reasoning.

## Pipeline Stages

### 1. Candidate Discovery

Input: Structured product specification + approved architecture template
Output: Candidate part families with MPN sets and required document types

### 2. Official Document Fetch

Input: Candidate families
Output: Raw engineering documents (PDFs, HTML, text)

- Prefer official manufacturer sources
- Preserve source URL, fetch timestamp, document type, revision
- Preserve manufacturer and part family metadata

### 3. Raw Document Store

Input: Fetched documents
Output: Canonical raw files with provenance metadata and checksums

### 4. Normalization

Input: Raw documents
Output: Normalized text + metadata with preserved section boundaries

### 5. Engineering-Aware Chunking

Input: Normalized documents
Output: Semantic chunks with type classification

Chunk types:

- Absolute maximum ratings
- Recommended operating conditions
- Power requirements
- Pin descriptions
- Boot configuration
- Clock tree
- Reset guidelines
- USB/ADC/interface guidelines
- Recommended PCB layout
- Package outline
- Errata items
- Reference circuits

### 6. Metadata Enrichment

Input: Chunks
Output: Enriched chunks with:

- Manufacturer, part family, MPN
- Package type
- Document type and revision
- Source URL and fetch timestamp
- Trust level (canonical/secondary)
- Applicable interface types
- Voltage domain metadata

### 7. Vector/Document Store

Input: Enriched chunks + embeddings
Output: Indexed documents ready for retrieval

### 8. Sufficiency Gate

Input: All collected data for a candidate set
Output: Pass/fail report with specific gaps

Checks:

- Official datasheet exists
- Errata exists (if vendor publishes errata)
- Application notes for complex parts
- Package/land-pattern documentation
- Structured procurement fields
- Footprint mapping exists
- Alternates exist for non-custom parts
- No unresolved contradictions
- No critical placeholders

## Operational Modes

### Live Mode

- Fetches from official manufacturer sources
- Requires network access and appropriate API keys
- Full pipeline with real data

### Fixture Mode

- Uses committed local fixture documents
- No network access required
- For testing and offline validation
- All data labeled as fixture

### Degraded Mode

- Processes what is available
- Reports specific gaps
- Does not silently skip missing data

## Seed Configuration

Bootstrap seed configuration defines:

- Approved starter part families
- Preferred official document source patterns
- Required document types per family class
- Whether errata is expected
- Whether package docs are required
- Whether alternates are required
- Retrieval labels for each family

## Outputs

Each ingestion run produces:

- Ingestion manifest (JSON)
- Sufficiency report (JSON + Markdown)
- Raw document storage entries
- Normalized document records
- Chunk records with metadata
- Embedding records
- Summary report with:
  - Targeted families
  - Sources used
  - Documents fetched/failed
  - Chunk and embedding counts
  - Sufficiency gate results
  - Unresolved gaps
