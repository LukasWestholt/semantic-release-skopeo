// test/verifyConditions.test.mjs
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import SemanticReleaseError from '@semantic-release/error';

describe('Verify missing skopeo', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        vi.doMock('execa', () => {
            return {
                execa: () => {
                    const err = new Error('command not found');
                    err.code = 'ENOENT';
                    throw err;
                },
            };
        });
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should fail when skopeo is not installed', async () => {
        // Dynamically import after mocking
        const { verifyConditions: mockedVerifyConditions } = await import('../lib/verifyConditions.mjs');

        await expect(mockedVerifyConditions({}, { logger: console })).rejects.toMatchObject(
            {
                code: 'EMISSINGSKOPEO',
                constructor: SemanticReleaseError,
            },
        );
    });
}, 20000); // 20 seconds
