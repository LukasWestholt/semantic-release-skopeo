import { execa } from 'execa';
import SemanticReleaseError from '@semantic-release/error';
import { parseConfig, toSkopeoArgs } from './config.mjs';

const ERRORS = {
    IMAGE_EXISTS: path => `Image was already found at ${path} and FORCE is deactivated.`
};

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

        // const options = ["--creds", "username:password"]
        const exists = await checkImageExists(destination);

        if (exists && !config.force) {
          throw new SemanticReleaseError(ERRORS.IMAGE_EXISTS, 'EIMAGEEXISTS');
        }

        try {
            const skopeoArgs = toSkopeoArgs(config, destination);
            await execa('/usr/bin/skopeo', skopeoArgs);
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

/**
 * Checks if a container image exists using skopeo.
 *
 * @param {string} imageRef - The full image reference, e.g., docker://docker.io/library/nginx:latest
 * @param {Object} [options] - Optional settings
 * @returns {Promise<boolean>} - Resolves to true if the image exists, false otherwise.
 */
export async function checkImageExists(imageRef, options = []) {
  const args = ['inspect'];
  options.forEach((value) => args.push(value));
  args.push(imageRef);

  try {
    await execa('/usr/bin/skopeo', args);
    return true;
  } catch (error) {
    if (error.exitCode !== 0) {
      console.error(`Image check failed: ${error.stderr || error.message}`);
    }
    return false;
  }
}

export { publish };
