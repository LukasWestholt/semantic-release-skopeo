import { execa } from 'execa';
import { parseConfig, toSkopeoArgs } from './config.mjs';

async function publish(pluginConfig, context) {
    const { logger, nextRelease } = context;

    // Parse configuration
    const config = parseConfig(pluginConfig);

    config.destination = config.destination.map(destination => {
        return destination.replace('${version}', nextRelease.version);
    });

    logger.log(
        `Pushing Docker image with the following destinations: ${config.destination.join(', ')}`
    );

    for (const destination of config.destination) {
        try {
            const skopeoArgs = toSkopeoArgs(config, destination);
            await runSkopeoWithRetry(skopeoArgs, config.retry);
            logger.log(`Successfully pushed images: ${destination}`);
        } catch (error) {
            if (config.pushIgnoreImmutableTagErrors && isImmutableTagError(error, destination)) {
                continue;
            }
            logger.error(`Failed push images: ${destination}`);
            throw error;
        }
    }

    logger.log('Docker image publishing complete.');
}

/**
 * Retry wrapper for running skopeo with arguments.
 * @param {string[]} args - Arguments to pass to skopeo.
 * @param {number} maxRetries - Number of retry attempts.
 * @param {number} delayMs - Delay between retries in milliseconds.
 */
export async function runSkopeoWithRetry(args, maxRetries = 5, delayMs = 10000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}: skopeo ${args.join(' ')}`);
            await execa('/usr/bin/skopeo', args, { stdio: 'inherit' });
            console.log('Skopeo push succeeded');
            return;
        } catch (error) {
            if (attempt < maxRetries) {
                console.warn(
                    `Skopeo failed (attempt ${attempt}). Retrying in ${delayMs / 1000}s...`
                );
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                console.error(`Skopeo failed after ${maxRetries} attempts.`);
                throw error;
            }
        }
    }
}

// Known tag immutability errors
const errTagImmutable = [
    // https://cloud.google.com/artifact-registry/docs/docker/troubleshoot#push
    'The repository has enabled tag immutability',
    // https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-tag-mutability.html
    'cannot be overwritten because the repository is immutable',
];

/**
 * Checks if an error is a known immutable tag error.
 * @param {Error} err - The error object (can be from execa or others).
 * @param {string} digest - Optional context (e.g., image digest or tag).
 * @returns {boolean} - Whether to ignore the error.
 */
function isImmutableTagError(err, digest = '') {
    const errStr = err.message || String(err);
    for (const candidate of errTagImmutable) {
        if (errStr.includes(candidate)) {
            console.info(`Immutable tag error ignored for ${digest}`);
            return true;
        }
    }
    return false;
}

export { publish };
