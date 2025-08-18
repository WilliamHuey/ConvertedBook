/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'

// Use the default timeout amount if no custom value is
// provided in the enviroment variable
const defaultTimeout = 100000;
const initialReadTimeout = typeof process.env.VITEST_TIMEOUT == "string" ?
  process.env.VITEST_TIMEOUT : `${defaultTimeout}`;
const parsedNegotiatedTimeout = parseInt(initialReadTimeout, 10);
const finalTimeout = parsedNegotiatedTimeout > 0 ?
  parsedNegotiatedTimeout : defaultTimeout;

export default defineConfig({
  test: {
    testTimeout: finalTimeout,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts}', '!**/node_modules/**']
    },
    typecheck: {

      // Disable typechecking for tests
      enabled: false
    }
  },
});