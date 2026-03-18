// This file is run before each test file
// Add any global setup here

// Set up DOM environment for React tests
require('@testing-library/jest-dom');

// Load environment variables from .env.test
require('dotenv').config({ path: '.env.test', quiet: true });

jest.mock('next-intl', () => {
  return {
    useLocale: () => 'en',
    useTranslations: () => (key) => key,
  };
});

// Silence known benign warnings in test runs
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  const message = typeof warning === 'string' ? warning : warning?.message;
  if (message && message.includes('--localstorage-file')) {
    return;
  }

  return originalEmitWarning.call(process, warning, ...args);
};

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});
