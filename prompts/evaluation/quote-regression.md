# Quote Regression Evaluation

Tests that the rough quote engine produces correct, auditable quotes.

## Test Cases

1. Given a known BOM, verify quote formula produces expected low/mid/high
2. Verify all quote assumptions are recorded
3. Verify contingency and margin are applied correctly
4. Verify fixture pricing is labeled as estimates
5. Verify confidence level reflects actual data availability

## Pass Criteria

- Quote math is exact and reproducible
- All assumptions are explicit in output
- Fixture data is clearly labeled
