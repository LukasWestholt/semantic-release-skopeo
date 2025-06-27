// publish.test.mjs
import { describe, it, beforeEach, expect } from 'vitest';
import { publish } from '../lib/publish.mjs';

// Merging prepare and publish into the same test suite to guarantee order
describe('Comprehensive Test with All Arguments', () => {
  let context;
  let pluginConfig;

  beforeEach(() => {
    context = {
      logger: console,
      nextRelease: {
        version: '1.0.0',
      },
    };

    pluginConfig = {
      args: ['--additional-tag=test:latest', '--dest-tls-verify=false'],
      source: 'docker-archive:test/resources/hello_world.tar',
      destination: [
        'docker://mock-registry:5000/my-project/my-image:${version}',
        'docker://mock-registry:5000/my-project/my-image:latest',
      ],
      force: true,
      pushIgnoreImmutableTagErrors: true,
      retry: 5,
    };
  });

  it(
    'should execute publish with all configuration parameters successfully',
    async () => {
      await expect(publish(pluginConfig, context)).resolves.not.toThrow();
    },
    600_000 // 10-minute timeout
  );
});
