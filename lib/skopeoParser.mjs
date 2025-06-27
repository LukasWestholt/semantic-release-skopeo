const fs = require('fs');
import path from 'path';

const forbiddenCharsRegex = /[^a-z0-9._\-/:${}]/;

const validTransports = [
    'containers-storage',
    'dir',
    'docker',
    'docker-archive',
    'docker-daemon',
    'oci',
    'oci-archive',
];

const transportsWithPath = ['dir', 'oci', 'docker-archive', 'oci-archive'];

const projectRoot = findProjectRoot();

export function parseSkopeoDestination(destination) {
    const result = {
        transport: null,
        details: null,
        hasVariables: null,
        errors: [],
    };

    if (!destination.includes(':')) {
        result.errors.push("Invalid format: missing ':' to separate transport and details.");
        return result;
    }

    const [transport, ...rest] = destination.split(':');
    const details = rest.join(':').trim();

    result.transport = transport.trim();
    result.details = details;

    // Validate transport type
    if (!validTransports.includes(result.transport)) {
        result.errors.push(`Invalid transport type: '${result.transport}'`);
    }

    // Check for forbidden characters in details
    if (forbiddenCharsRegex.test(details)) {
        result.errors.push('Details contain forbidden characters: ' + details);
    }

    result.hasVariables = details.includes('${');

    // Check if path exists for local transports
    if (transportsWithPath.includes(result.transport)) {
        const inputPath = details.split(':')[0];
        const filePath = path.isAbsolute(inputPath)
            ? inputPath
            : path.resolve(projectRoot, inputPath);

        if (!fs.existsSync(filePath)) {
            result.errors.push(`File does not exist: '${filePath}'`);
        }
    }

    return result;
}

function findProjectRoot(startDir = __dirname) {
    let dir = startDir;

    while (dir !== path.parse(dir).root) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }

    throw new Error('Project root not found');
}
