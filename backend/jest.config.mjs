import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(rootDir, '.env.test') });

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@domain/(.*)\\.js$': '<rootDir>/src/domain/$1.ts',
    '^@application/(.*)\\.js$': '<rootDir>/src/application/$1.ts',
    '^@infrastructure/(.*)\\.js$': '<rootDir>/src/infrastructure/$1.ts',
    '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1.ts',
    '^@composition/(.*)\\.js$': '<rootDir>/src/composition/$1.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/main.ts', '!tests/**'],
  coverageDirectory: 'coverage',
  clearMocks: true,
};

export default config;
