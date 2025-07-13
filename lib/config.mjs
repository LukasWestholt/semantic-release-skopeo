import { parseArrayOrString, toBoolean, parseString } from "./utils.mjs";

const nextReleaseReplacers = {
    version: (destination, nextRelease) =>
        destination.replace("${version}", nextRelease.version),
    majorVersion: (destination, nextRelease) => {
        const major = nextRelease.version.split(".")[0];
        return destination.replace("${majorVersion}", major);
    },
    minorVersion: (destination, nextRelease) => {
        const minor = nextRelease.version.split(".").slice(0, 2).join(".");
        return destination.replace("${minorVersion}", minor);
    },
};

function parseConfig(pluginConfig) {
    const config = {};

    const camelToEnvVar = (str) => {
        return (
            "SKOPEO_" + str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()
        );
    };

    const handleEnvVars = (value, allow_envs) => {
        if (allow_envs) {
            return Array.isArray(value)
                ? value.map(replaceEnvVars)
                : replaceEnvVars(value);
        } else {
            return value;
        }
    };

    const parseIfDefined = (
        key,
        parser,
        _default = undefined,
        allow_envs = false,
    ) => {
        const envVarKey = camelToEnvVar(key);
        const valueFromEnv = process.env[envVarKey];

        if (pluginConfig[key] !== undefined) {
            config[key] = handleEnvVars(pluginConfig[key], allow_envs);
        } else if (valueFromEnv !== undefined) {
            config[key] = handleEnvVars(parser(valueFromEnv), allow_envs);
        } else if (_default !== undefined) {
            config[key] = _default;
        }
    };

    /**
     * Replaces $VAR and ${VAR} in a string with values from process.env
     * @param {string} str - The input string with placeholders
     * @returns {string} - The string with environment variables replaced
     */
    function replaceEnvVars(str) {
        const regex = /\$(\w+)|\$\{(\w+)}/g;
        return str.replace(regex, (match, var1, var2) => {
            const envVar = var1 || var2;
            if (envVar in nextReleaseReplacers) {
                return match;
            }
            if (process.env[envVar] === undefined) {
                throw new Error(
                    `Environment variable ${envVar} is not defined`,
                );
            }
            return process.env[envVar];
        });
    }

    parseIfDefined("copyArgs", parseArrayOrString, []);
    parseIfDefined("inspectArgs", parseArrayOrString, []);
    parseIfDefined("source", parseString, undefined, true);
    parseIfDefined("destination", parseArrayOrString, undefined, true);
    parseIfDefined("force", toBoolean);
    parseIfDefined("pushIgnoreImmutableTagErrors", toBoolean);
    parseIfDefined("retry", parseInt, 0);

    return config;
}

function toSkopeoCopyArgs(config, destination) {
    const args = ["copy"];
    config.copyArgs.forEach((value) => args.push(value));
    args.push("--retry-times=" + config.retry.toString());
    args.push(config.source);
    args.push(destination);
    return args;
}

function toSkopeoInspectArgs(config, destination) {
    const args = ["inspect"];
    config.inspectArgs.forEach((value) => args.push(value));
    args.push("--retry-times=" + config.retry.toString());
    args.push(destination);
    return args;
}

export {
    parseConfig,
    toSkopeoCopyArgs,
    toSkopeoInspectArgs,
    nextReleaseReplacers,
};
