module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // 'jsdom' is better for React components
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
