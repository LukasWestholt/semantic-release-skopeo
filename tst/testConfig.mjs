import { parseConfig, toskopeoArgs } from '../lib/config.mjs';

// Function to run a test case
function runTestCase(description, envVars, expectedDest) {
    console.log(`\n--- ${description} ---`);

    // Clear environment variables before each test
    delete process.env.SKOPEO_DESTINATION;

    // Set environment variables for the test
    if (envVars.destination) {
        process.env.SKOPEO_DESTINATION = envVars.destination;
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
    if (JSON.stringify(config.destination) !== JSON.stringify(expectedDest)) {
        console.error('Test failed: destination did not match expected value');
    } else {
        console.log('Destination matched expected value');
    }
}

// Test Cases
runTestCase(
    'Test with JSON array as environment variable',
    {
        destination: '["registry.example.com/my-image:${version}","registry.example.com/my-image:latest"]'
    },
    [
        'registry.example.com/my-image:${version}',
        'registry.example.com/my-image:latest'
    ]
);

runTestCase(
    'Test with comma-separated string as environment variable',
    {
        destination: 'registry.example.com/my-image:${version},registry.example.com/my-image:latest'
    },
    [
        'registry.example.com/my-image:${version}',
        'registry.example.com/my-image:latest'
    ]
);

runTestCase(
    'Test with single string as environment variable',
    {
        destination: 'registry.example.com/my-image:latest'
    },
    ['registry.example.com/my-image:latest']
);

runTestCase(
    'Test with invalid JSON string (fallback to string array)',
    {
        destination: '["registry.example.com/my-image:latest"'
    },
    ['["registry.example.com/my-image:latest"'],
);

runTestCase(
    'Test with no environment variables set',
    {},
    undefined, // Expecting undefined because no destination is set
);
