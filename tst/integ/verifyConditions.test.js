import { verifyConditions } from '../../lib/verifyConditions.mjs';
import assert from 'assert';
import SemanticReleaseError from '@semantic-release/error';
import fs from 'fs';
import path from 'path';

describe('Verify Conditions', function () {
    this.timeout(20000);

    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const executeVerification = async (pluginConfig, expectedError) => {
        if (expectedError) {
            await assert.rejects(
                verifyConditions(pluginConfig, { logger: console }),
                error => error instanceof SemanticReleaseError && error.code === expectedError
            );
        } else {
            await assert.doesNotReject(verifyConditions(pluginConfig, { logger: console }));
        }
    };

    it('should fail when skopeo is not installed', async () => {
        const skopeoExecutorPath = '/usr/bin/skopeo';
        const invalidskopeoPath = '/usr/bin/skopeo_invalid';

        fs.mkdirSync(path.dirname(invalidskopeoPath), { recursive: true });
        fs.renameSync(skopeoExecutorPath, invalidskopeoPath);

        try {
            await executeVerification({}, 'EMISSINGSKOPEO');
        } finally {
            fs.renameSync(invalidskopeoPath, skopeoExecutorPath);
        }
    });

    it('should fail when destination is not set', async () => {
        const pluginConfig = { source: 'docker://tst/integ/resources/test.Dockerfile' };
        await executeVerification(pluginConfig, 'EMISSINGDESTINATION');
    });

    it('should fail when source is not set', async () => {
        const pluginConfig = {
            destination: ['docker://registry.example.com/my-image:${version}'],
        };
        await executeVerification(pluginConfig, 'EMISSING_SOURCE');
    });

    it('should pass with valid configuration', async () => {
        const pluginConfig = {
            source: 'docker-archive://tst/integ/resources/hello_world.tar',
            destination: ['docker://registry.example.com/my-image:${version}'],
        };
        await executeVerification(pluginConfig);
    });

    it('should verify required environment variables are set', async () => {
        process.env.SKOPEO_SOURCE = 'docker-archive://tst/integ/resources/hello_world.tar';
        process.env.SKOPEO_DESTINATION = 'docker://registry.example.com/my-image:${version}';
        const pluginConfig = {};
        await executeVerification(pluginConfig);
    });
});
