import { parseArrayOrString, toBoolean, parseString } from './utils.mjs';

function parseConfig(pluginConfig) {
    const config = {};

    const camelToEnvVar = (str) => {
        return 'SKOPEO_' + str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    };

    const parseIfDefined = (key, parser, _default = undefined) => {
        const envVarKey = camelToEnvVar(key);
        const valueFromEnv = process.env[envVarKey];
    
        if (pluginConfig[key] !== undefined) {
            config[key] = pluginConfig[key];
        } else if (valueFromEnv !== undefined) {
            config[key] = parser(valueFromEnv);
        } else if (_default !== undefined) {
            config[key] = _default;
        }
    };

    parseIfDefined('args', parseArrayOrString, []);
    parseIfDefined('source', parseString);
    parseIfDefined('destination', parseArrayOrString);
    parseIfDefined('force', toBoolean);
    parseIfDefined('pushIgnoreImmutableTagErrors', toBoolean);
    parseIfDefined('retry', parseInt, 0);

    return config;
}

function toSkopeoArgs(config, destination) {
    const args = ["copy"];
    config.args.forEach((value) => args.push(value));
    args.push("--retry-times=" + config.retry.toString())
    args.push(config.source);
    args.push(destination);
    return args;
}

export { parseConfig, toSkopeoArgs };
