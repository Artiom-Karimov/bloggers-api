/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  setupFiles: ["dotenv/config"],
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['./dist']
};
