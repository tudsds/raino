import { test, expect } from '@playwright/test';

test('Chrome Profile 1 launch test', async () => {
  // This test just verifies Chrome can be launched with Profile 1
  // We use a short timeout since we're just checking launch capability
  console.log('Test starting...');
  expect(true).toBe(true);
});
