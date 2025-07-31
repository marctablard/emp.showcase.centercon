// This file is run before each test file
// Add any global setup here

// Set up DOM environment for React tests
require('@testing-library/jest-dom');

// Load environment variables from .env.test
require('dotenv').config({ path: '.env.test' });

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});
