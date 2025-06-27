// test/config.test.mjs
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { parseConfig, toSkopeoCopyArgs } from '../lib/config.mjs';

describe('Config Parser Environment Variable Handling', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  const testCases = [
    {
      description: 'JSON array as environment variable',
      env: { SKOPEO_DESTINATION: '["registry.example.com/my-image:${version}","registry.example.com/my-image:latest"]' },
      expectedDest: [
        'registry.example.com/my-image:${version}',
        'registry.example.com/my-image:latest',
      ],
    },
    {
      description: 'Comma-separated string as environment variable',
      env: { SKOPEO_DESTINATION: 'registry.example.com/my-image:${version},registry.example.com/my-image:latest' },
      expectedDest: [
        'registry.example.com/my-image:${version}',
        'registry.example.com/my-image:latest',
      ],
    },
    {
      description: 'Single string as environment variable',
      env: { SKOPEO_DESTINATION: 'registry.example.com/my-image:latest' },
      expectedDest: ['registry.example.com/my-image:latest'],
    },
    {
      description: 'Invalid JSON string (fallback to string array)',
      env: { SKOPEO_DESTINATION: '["registry.example.com/my-image:latest"' },
      expectedDest: ['["registry.example.com/my-image:latest"'],
    },
    {
      description: 'No environment variable set',
      env: {},
      expectedDest: undefined,
    },
  ];

  for (const { description, env, expectedDest } of testCases) {
    it(description, () => {
      // Set environment variables
      Object.entries(env).forEach(([key, val]) => {
        process.env[key] = val;
      });

      const pluginConfig = {};
      const config = parseConfig(pluginConfig);
      const skopeoArgs = toSkopeoCopyArgs(config);

      expect(config.destination).toEqual(expectedDest);
    });
  }
});
