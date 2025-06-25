import { parseConfig, toskopeoArgs } from '../lib/config.mjs';

// Function to run a test case
function runTestCase(description, envVars, expectedCache, expectedCacheTTL, expectedDir, expectedTarget) {
    console.log(`\n--- ${description} ---`);

    // Clear environment variables before each test
    delete process.env.SKOPEO_CACHE;
    delete process.env.SKOPEO_CACHE_TTL;
    delete process.env.SKOPEO_SKOPEO_DIR;
    delete process.env.SKOPEO_TARGET;

    // Set environment variables for the test
    if (envVars.cache) {
        process.env.SKOPEO_CACHE = envVars.cache;
    }
    if (envVars.cacheTTL) {
        process.env.SKOPEO_CACHE_TTL = envVars.cacheTTL;
    }
    if (envVars.skopeoDir) {
        process.env.SKOPEO_SKOPEO_DIR = envVars.skopeoDir;
    }
    if (envVars.target) {
        process.env.SKOPEO_TARGET = envVars.target;
    }

    // Mock plugin configuration object
    const pluginConfig = {};

    // Parse configuration
    const config = parseConfig(pluginConfig);

    // Convert parsed config to skopeo args
    const skopeoArgs = toskopeoArgs(config);

    // Output the results
    console.log('Parsed Config:', config);
    console.log('skopeo Args:', skopeoArgs);

    // Assertions (could be replaced with an actual testing framework)
    if (config.cache !== expectedCache) {
        console.error('Test failed: cache did not match expected value');
    } else {
        console.log('Cache matched expected value');
    }
    if (config.cacheTTL !== expectedCacheTTL) {
        console.error('Test failed: cacheTTL did not match expected value');
    } else {
        console.log('cacheTTL matched expected value');
    }
    if (config.skopeoDir !== expectedDir) {
        console.error('Test failed: skopeoDir did not match expected value');
    } else {
        console.log('skopeoDir matched expected value');
    }
    if (config.target !== expectedTarget) {
        console.error('Test failed: target did not match expected value');
    } else {
        console.log('Target matched expected value');
    }
}

// New Test Case
runTestCase(
    'Test with cache, cacheTTL, and dir environment variables',
    {
        cache: 'true',
        cacheTTL: '48h',
        skopeoDir: '/tmp/skopeo',
        target: 'foo'
    },
    true,
    '48h',
    '/tmp/skopeo',
    'foo'
);
