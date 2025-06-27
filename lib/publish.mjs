import { execa } from 'execa';
import { parseConfig, toSkopeoCopyArgs } from './config.mjs';
import { checkDestinationIsWriteable } from './verifyConditions.mjs';

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
        await checkDestinationIsWriteable(destination, config);

        try {
            const skopeoArgs = toSkopeoCopyArgs(config, destination);
            await execa('/usr/bin/skopeo', skopeoArgs);
            logger.log(`Successfully pushed images: ${destination}`);
        } catch (error) {
            if (
                config.pushIgnoreImmutableTagErrors &&
                isImmutableTagError(error, logger, destination)
            ) {
                continue;
            }
            logger.error(`Failed push images: ${destination}`);
            throw error;
        }
    }

    logger.log('Docker image publishing complete.');
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
 * @param logger
 * @param {string} digest - Optional context (e.g., image digest or tag).
 * @returns {boolean} - Whether to ignore the error.
 */
function isImmutableTagError(err, logger, digest = '') {
    const errStr = err.message || String(err);
    for (const candidate of errTagImmutable) {
        if (errStr.includes(candidate)) {
            logger.info(`Immutable tag error ignored for ${digest}`);
            return true;
        }
    }
    return false;
}

export { publish };
