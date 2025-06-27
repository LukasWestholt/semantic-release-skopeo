import { publish } from '../../lib/publish.mjs';
import assert from 'assert';

// Merging prepare and publish into the same test suite to guarantee they run in order
describe('Comprehensive Test with All Arguments', function () {
    this.timeout(600000); // 10 minute timeout

    let context;
    let pluginConfig;

    beforeEach(() => {
        // Mock context
        context = {
            logger: console,
            nextRelease: {
                version: '1.0.0',
            },
        };

        // Comprehensive configuration with all possible flags
        pluginConfig = {
            args: ['--additional-tag=test:latest', '--dest-tls-verify=false'],
            source: 'docker-archive:tst/integ/resources/hello_world.tar',
            destination: [
                'docker://mock-registry:5000/my-project/my-image:${version}',
                'docker://mock-registry:5000/my-project/my-image:latest',
            ],
            force: true,
            pushIgnoreImmutableTagErrors: true,
            retry: 5,
        };
    });

    it('should execute publish with all configuration parameters successfully', async () => {
        try {
            await publish(pluginConfig, context);
            // Assume no error means success
        } catch (error) {
            assert.fail(`Failed to publish with all arguments: ${error.stack}`);
        }
    });
});
