import SemanticReleaseError from '@semantic-release/error';
import { execa } from 'execa';
import { parseConfig, toSkopeoInspectArgs } from './config.mjs';
import { parseSkopeoDestination } from "./skopeoParser.mjs";

// Error messages
const ERRORS = {
    MISSING_SKOPEO: '/usr/bin/skopeo is not found in PATH. Are you using a container with skopeo installed?',
    MISSING_SOURCE: 'You must set one source',
    MISSING_DESTINATION: 'You must set at least one destination',
    WRONG_DESTINATION: error => `Wrong format in destination: ${error}`,
    WRONG_SOURCE: error => `Wrong format in source: ${error}`,
    IMAGE_EXISTS: path => `Image was already found at ${path} and FORCE is deactivated.`,
    IMAGE_CHECK_FAILED: msg => `Image check failed: ${msg}`,
};

/**
 * Verify the conditions for the semantic-release-dockerless plugin using skopeo.
 * @param {Object} pluginConfig - The plugin configuration.
 * @param {Object} context - The semantic-release context.
 */
async function verifyConditions(pluginConfig, context) {
    const { logger } = context;

    // Check if skopeo is installed and accessible
    try {
        await execa('/usr/bin/skopeo', ['-v']);
        logger.info('skopeo is installed and accessible.');
    } catch (_error) {
        logger.info('Failed to verify skopeo installation.');
        throw new SemanticReleaseError(ERRORS.MISSING_SKOPEO, 'EMISSINGSKOPEO');
    }
    logger.info('skopeo installation check passed.');

    // Parse configuration
    const config = parseConfig(pluginConfig);
    logger.info('Configuration parsed.');

    // Check if source is set
    if (!config.source) {
        logger.info('Source is not set.');
        throw new SemanticReleaseError(ERRORS.MISSING_SOURCE, 'EMISSING_SOURCE');
    }
    const output = parseSkopeoDestination(config.source)
    if (output.errors.length > 0) {
        logger.info('Source is not valid.');
        throw new SemanticReleaseError(ERRORS.WRONG_SOURCE(output.errors.join(", ")), 'EWRONG_SOURCE', output);
    }
    const exists = await checkImageExists(config.source, config);
    if (!exists) {
        logger.info('Source is does not exists (skopeo inspect).');
        throw new SemanticReleaseError(ERRORS.WRONG_SOURCE(config.source), 'EWRONG_SOURCE', output);
    }
    logger.info('Source is set.');

    // Check if destination is set
    if (!config.destination) {
        logger.info('Destination is not set.');
        throw new SemanticReleaseError(ERRORS.MISSING_DESTINATION, 'EMISSING_DESTINATION');
    }
    for (const destination of config.destination) {
        const output = parseSkopeoDestination(destination)
        if (output.errors.length > 0) {
            logger.info('Destination is not valid.');
            throw new SemanticReleaseError(ERRORS.WRONG_DESTINATION(output.errors.join(", ")), 'EWRONG_DESTINATION', output);
        }
        if (!output.hasVariables) {
            await checkDestinationIsWriteable(destination, config);
        }
    }
    logger.info('Destination is set.');

    logger.log('semantic-release-skopeo plugin configuration verified.');
}

/**
 * Checks if a container image exists using skopeo.
 *
 * @param {string} imageRef - The full image reference, e.g., docker://docker.io/library/nginx:latest
 * @param {Object} [config] - Optional settings
 * @returns {Promise<boolean>} - Resolves to true if the image exists, false otherwise.
 */
async function checkImageExists(imageRef, config) {
    const args = toSkopeoInspectArgs(config, imageRef);

    try {
        await execa('/usr/bin/skopeo', args);
        return true;
    } catch (error) {
        if (error.exitCode !== 0) {
            const msg = error.stderr || error.message;
            if (msg.includes("manifest unknown")) {
                return false;
            }
            throw new SemanticReleaseError(ERRORS.IMAGE_CHECK_FAILED(msg), 'EIMAGE_CHECK_FAILED');
        }
        return false;
    }
}

async function checkDestinationIsWriteable(destination, config) {
    const exists = await checkImageExists(destination, config);

    if (exists && !config.force) {
        throw new SemanticReleaseError(ERRORS.IMAGE_EXISTS(destination), 'EIMAGEEXISTS');
    }
}

export { verifyConditions, checkImageExists, checkDestinationIsWriteable };
