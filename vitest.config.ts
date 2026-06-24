import { defineConfig } from 'vitest/config';

// The matching engine is pure logic, so the default Node environment is enough.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
