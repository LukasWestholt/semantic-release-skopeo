// test/verifyConditions.test.mjs
import { describe, it, beforeEach, afterEach, expect, assert } from 'vitest';
import { verifyConditions } from '../lib/verifyConditions.mjs';
import SemanticReleaseError from '@semantic-release/error';
import fs from 'fs';
import path from 'path';

describe(
  'Verify Conditions',
  () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    const executeVerification = async (pluginConfig, expectedError) => {
      if (expectedError) {
        await expect(
          verifyConditions(pluginConfig, { logger: console })
        ).rejects.toMatchObject({
          code: expectedError,
          constructor: SemanticReleaseError,
        });
      } else {
        await expect(
          verifyConditions(pluginConfig, { logger: console })
        ).resolves.not.toThrow();
      }
    };

    it('should fail when skopeo is not installed', async () => {
      const skopeoExecutorPath = '/usr/bin/skopeo';
      const invalidSkopeoPath = '/usr/bin/skopeo_invalid';

      fs.mkdirSync(path.dirname(invalidSkopeoPath), { recursive: true });
      fs.renameSync(skopeoExecutorPath, invalidSkopeoPath);

      try {
        await executeVerification({}, 'EMISSINGSKOPEO');
      } finally {
        fs.renameSync(invalidSkopeoPath, skopeoExecutorPath);
      }
    });

    it('should fail when destination is not set', async () => {
      const pluginConfig = {
        source: 'docker-archive:test/integ/resources/hello_world.tar',
      };
      await executeVerification(pluginConfig, 'EMISSING_DESTINATION');
    });

    it('should fail when source is not set', async () => {
      const pluginConfig = {
        destination: ['docker://registry.example.com/my-image:${version}'],
      };
      await executeVerification(pluginConfig, 'EMISSING_SOURCE');
    });

    it('should pass with valid configuration', async () => {
      const pluginConfig = {
        source: 'docker-archive:test/integ/resources/hello_world.tar',
        destination: ['docker://registry.example.com/my-image:${version}'],
      };
      await executeVerification(pluginConfig);
    });

    it('should verify required environment variables are set', async () => {
      process.env.SKOPEO_SOURCE = 'docker-archive:test/integ/resources/hello_world.tar';
      process.env.SKOPEO_DESTINATION = 'docker://registry.example.com/my-image:${version}';
      const pluginConfig = {};
      await executeVerification(pluginConfig);
    });
  },
  20000 // 20 seconds
);
