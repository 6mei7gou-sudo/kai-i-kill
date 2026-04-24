// Jest設定 — next/jest で SWC トランスフォームを自動適用
const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    moduleNameMapper: {
        // src/ 配下の絶対インポート対応
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

module.exports = createJestConfig(config);
