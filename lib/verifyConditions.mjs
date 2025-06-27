import SemanticReleaseError from '@semantic-release/error';
import { execa } from 'execa';
import { parseConfig } from './config.mjs';

// Error messages
const ERRORS = {
    MISSING_SKOPEO: '/usr/bin/skopeo is not found in PATH. Are you using a container with skopeo installed?',
    MISSING_SOURCE: 'You must set one source',
    MISSING_DESTINATION: 'You must set at least one destination',
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
    logger.info('Source is set.');

    // Check if destination is set
    if (!config.destination) {
        logger.info('Destination is not set.');
        throw new SemanticReleaseError(ERRORS.MISSING_DESTINATION, 'EMISSINGDESTINATION');
    }
    logger.info('Destination is set.');

    logger.log('semantic-release-skopeo plugin configuration verified.');
}

export { verifyConditions };
