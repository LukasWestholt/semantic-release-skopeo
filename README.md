# @lukaswestholt/semantic-release-skopeo

[![Version](https://img.shields.io/npm/v/@lukaswestholt/semantic-release-skopeo.svg)](https://www.npmjs.com/package/@lukaswestholt/semantic-release-skopeo)
[![License](https://img.shields.io/npm/l/@lukaswestholt/semantic-release-skopeo.svg)](https://github.com/lukaswestholt/semantic-release-skopeo/blob/main/LICENSE)
![CI](https://github.com/lukaswestholt/semantic-release-skopeo/actions/workflows/ci.yml/badge.svg)

## Overview

[`@lukaswestholt/semantic-release-skopeo`](https://www.npmjs.com/package/@lukaswestholt/semantic-release-skopeo) is a plugin for `semantic-release` that copies OCI images to a custom registry using daemonless open-source tool [skopeo](https://github.com/containers/skopeo/).

From the [skopeo](https://github.com/containers/skopeo/blob/main/README.md) docs:

> skopeo is a command line utility that performs various operations on container images and image repositories.
> skopeo does not require a daemon to be running to perform its operations.
> Copying an image from and to various storage mechanisms. For example, you can copy images from one registry to another, without requiring privilege.

## Benefits

-   **Daemonless**: Copies images without requiring a Docker daemon or docker-in-docker setup, ideal for CI/CD environments.
-   **Version-Aware Tagging**: Automatically tags your Docker images with semantic version numbers, ensuring consistency between your code and container versions.
-   **Cross-Platform Compatibility**: Works across different CI/CD platforms and environments that support Node.js and skopeo.
-   **Automated Publishing**: Pushes pre-built images to your specified Docker registry as part of the release process, reducing manual steps.

## Quick Start

Installation is done with the `npm install` command:

```bash
npm install --save-dev @lukaswestholt/semantic-release-skopeo
```

Add the plugin to your [semantic-release](https://semantic-release.gitbook.io/semantic-release/usage/configuration#configuration-file) `.releaserc` file:

```json
{
    "branches": ["main"],
    "plugins": [
        "@semantic-release/commit-analyzer",
        [
            "@lukaswestholt/semantic-release-skopeo",
            {
                "source": "docker://registry.example.com/my-project/my-image:latest",
                "destination": [
                    "docker://registry.example.com/my-project/my-image:${version}"
                ]
            }
        ]
    ]
}
```

This package must be run in an environment that has skopeo already installed. We provide an image with all the necessary dependencies pre-installed, which we strongly recommend using. Pull the container image:

```bash
docker pull ghcr.io/lukaswestholt/semantic-release-skopeo:latest
```

Run your semantic-release command in the container:

```
docker run --rm \
    -v $(pwd):/workspace \
    -name semantic-release-skopeo-test \
    ghcr.io/lukaswestholt/semantic-release-skopeo:latest \
    npx semantic-release
```

## Private registries

Just use `skopeo login <...>` in a pre-step. See https://github.com/containers/skopeo/blob/main/docs/skopeo-login.1.md.

## Advanced Usage

For more advanced usage and detailed configuration options as well as guidance on multiple CI environments and documentation for all supported flags, please refer to the [Usage Guide](docs/usage.md) or the [Configuration Guide](docs/configuration.md).

## Contributing

We welcome contributions to semantic-release-skopeo! Simply raise and Issue or a PR, and we can review it ASAP.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

Templated from [@bpgeck/semantic-release-kaniko](https://github.com/brendangeck/semantic-release-kaniko).

Special thanks to the contributors and the open-source community for their invaluable support and contributions.

For more information, visit the [official repository](https://github.com/lukaswestholt/semantic-release-skopeo).
