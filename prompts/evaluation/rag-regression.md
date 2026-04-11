# RAG Regression Evaluation

Tests that the RAG system retrieves correct, provenance-tracked engineering knowledge.

## Test Cases

1. Retrieve datasheet chunk for a selected MCU family
2. Retrieve errata chunk when errata exists
3. Retrieve application-note chunk for a complex part
4. Retrieve package/pinout chunk where relevant
5. Verify provenance is preserved in every retrieval
6. Verify missing documents surface as missing, not hallucinated
7. Verify answer trace points to underlying source records

## Pass Criteria

- All retrievals return correct document type
- All retrievals preserve source provenance
- Missing data is reported, not fabricated
