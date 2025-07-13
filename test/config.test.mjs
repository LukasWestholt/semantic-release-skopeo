// test/config.test.mjs
import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { parseConfig } from "../lib/config.mjs";

describe("Config Parser Environment Variable Handling", () => {
    const ORIGINAL_ENV = { ...process.env };

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    const testCases = [
        {
            description: "JSON array as environment variable",
            env: {
                SKOPEO_DESTINATION:
                    '["registry.example.com/my-image:${version}","registry.example.com/my-image:latest"]',
            },
            expectedDest: [
                "registry.example.com/my-image:${version}",
                "registry.example.com/my-image:latest",
            ],
        },
        {
            description: "Comma-separated string as environment variable",
            env: {
                SKOPEO_DESTINATION:
                    "registry.example.com/my-image:${version},registry.example.com/my-image:latest",
            },
            expectedDest: [
                "registry.example.com/my-image:${version}",
                "registry.example.com/my-image:latest",
            ],
        },
        {
            description: "Single string as environment variable",
            env: { SKOPEO_DESTINATION: "registry.example.com/my-image:latest" },
            expectedDest: ["registry.example.com/my-image:latest"],
        },
        {
            description: "Single string as environment variable",
            env: {
                SKOPEO_DESTINATION: "registry.example.com/my-image:${version}",
            },
            expectedDest: ["registry.example.com/my-image:${version}"],
        },
        {
            description: "Invalid JSON string (fallback to string array)",
            env: {
                SKOPEO_DESTINATION: '["registry.example.com/my-image:latest"',
            },
            expectedDest: ['["registry.example.com/my-image:latest"'],
        },
        {
            description: "No environment variable set",
            env: {},
            expectedDest: undefined,
        },
        {
            description: "Use external environment variables",
            env: {
                REGISTRY_URL: "mock-registry:5000",
                DOCKER_IMAGE_NAME: "my-project/my-image",
                BITBUCKET_COMMIT: "3b2c1a4f5e6d7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
                BITBUCKET_BRANCH: "main",
            },
            config: {
                destination: [
                    "docker://$REGISTRY_URL/$DOCKER_IMAGE_NAME:${BITBUCKET_COMMIT}",
                    "docker://$REGISTRY_URL/$DOCKER_IMAGE_NAME:${BITBUCKET_BRANCH}",
                    "docker://$REGISTRY_URL/$DOCKER_IMAGE_NAME:${version}",
                    "docker://$REGISTRY_URL/$DOCKER_IMAGE_NAME:${majorVersion}",
                    "docker://$REGISTRY_URL/$DOCKER_IMAGE_NAME:${minorVersion}",
                ],
            },
            expectedDest: [
                "docker://mock-registry:5000/my-project/my-image:3b2c1a4f5e6d7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
                "docker://mock-registry:5000/my-project/my-image:main",
                "docker://mock-registry:5000/my-project/my-image:${version}",
                "docker://mock-registry:5000/my-project/my-image:${majorVersion}",
                "docker://mock-registry:5000/my-project/my-image:${minorVersion}",
            ],
        },
    ];

    for (const { description, env, config, expectedDest } of testCases) {
        it(description, () => {
            // Set environment variables
            Object.entries(env).forEach(([key, val]) => {
                process.env[key] = val;
            });

            const pluginConfig = config ?? {};
            const parsedConfig = parseConfig(pluginConfig);
            expect(parsedConfig.destination).toEqual(expectedDest);
        });
    }
});
