# Usage

## Overview

This guide provides usage examples and configurations for the [`.releaserc` file](https://semantic-release.gitbook.io/semantic-release/usage/configuration#configuration-file), demonstrating its use with different formats and Continuous Integration (CI) environments.
The `.releaserc` file is used for configuring release settings, including plugins, branches, and other options for the [`semantic-release`](https://semantic-release.gitbook.io/semantic-release) tool,
which automates the release process.

## .releaserc

`.releaserc` supports several file formats including JSON, YAML, and JavaScript.

### JSON Example

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

### YAML Example

```yaml
branches:
    - main
plugins:
    - '@semantic-release/commit-analyzer'
    - - '@lukaswestholt/semantic-release-skopeo'
        - source: docker://registry.example.com/my-project/my-image:latest
        - destination:
            - docker://registry.example.com/my-project/my-image:${version}
```

### JavaScript Example

```javascript
module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        [
            '@lukaswestholt/semantic-release-skopeo',
            {
                source: "docker://registry.example.com/my-project/my-image:latest", 
                destination: [
                    "docker://registry.example.com/my-project/my-image:${version}"
                ],
            },
        ],
    ],
};
```

## Environment Variables for Plugin Configuration

In cases where sensitive data or variable configuration is necessary, we support providing config values as env vars. This approach is especially beneficial in CI/CD environments where the configuration should not be hardcoded in the `.releaserc` file.

The environment variable names are derived from the configuration options by converting the option name to uppercase and prefixing with `SKOPEO`. For example, the `destination` option would be set with the `SKOPEO_DESTINATION` environment variable.

Anything more complex than a simple key/value pair should be represented as JSON. Some examples:

-   `SKOPEO_SOURCE="docker://registry.example.com/my-project/my-image:latest"`
-   `SKOPEO_DESTINATION='["docker://registry.example.com/my-project/my-image:\${version}","docker://registry.example.com/my-project/my-image:latest"]'`

Full list of configuration options and examples can be found in the [Configuration](./configuration.md) documentation.

### Environment Variables Example

1. Include the `@lukaswestholt/semantic-release-skopeo` plugin in your `.releaserc` file:

    ```json
    {
        "branches": ["main"],
        "plugins": ["@semantic-release/commit-analyzer", "@lukaswestholt/semantic-release-skopeo"]
    }
    ```

2. Define the environment variables in your CI configuration. For instance, in a GitHub Actions workflow:

    ```yaml
    name: Release

    on:
        push:
            branches:
                - main

    jobs:
        release:
            runs-on: ubuntu-latest
            container:
                image: ghcr.io/lukaswestholt/semantic-release-skopeo:latest
            steps:
                - name: Checkout code
                  uses: actions/checkout@v3

                - name: Install dependencies
                  run: npm i

                - name: Release
                  run: npx semantic-release
                  env:
                      SKOPEO_SOURCE: "docker://registry.example.com/my-project/my-image:latest"
                      SKOPEO_DESTINATION: '["docker://registry.example.com/my-project/my-image:\${version}","docker://registry.example.com/my-project/my-image:latest"]'
    ```

## Example Workflows

Here are some examples showing how to integrate `semantic-release` and the `@lukaswestholt/semantic-release-skopeo` plugin into various CI/CD pipelines.

### GitHub Actions Workflow Example

```yaml
name: Release

on:
    push:
        branches:
            - main

jobs:
    release:
        runs-on: ubuntu-latest
        container:
            image: ghcr.io/lukaswestholt/semantic-release-skopeo:latest
        steps:
            - name: Checkout code
              uses: actions/checkout@v3

            - name: Release
              run: npx semantic-release
```

### GitLab CI Example

```yaml
stages:
    - release

release:
    stage: release
    image: ghcr.io/lukaswestholt/semantic-release-skopeo:latest
    script:
        - npm ci
        - npx semantic-release
    rules:
        - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### CircleCI Example

```yaml
version: 2.1

executors:
    skopeo:
        docker:
            - image: ghcr.io/lukaswestholt/semantic-release-skopeo:latest

jobs:
    release:
        executor: skopeo
        steps:
            - checkout
            - run:
                  name: Install dependencies
                  command: npm ci
            - run:
                  name: Run semantic-release
                  command: npx semantic-release

workflows:
    version: 2
    release:
        jobs:
            - release:
                  filters:
                      branches:
                          only: main
```

## Private Registry Authorization

You can execute `skopeo login` before `npx semantic-release`. See [here](https://github.com/containers/skopeo/blob/main/docs/skopeo-login.1.md).

### GitHub Actions Example

```yaml
name: Release

on:
    push:
        branches:
            - main

jobs:
    release:
        runs-on: ubuntu-latest
        container:
            image: ghcr.io/lukaswestholt/semantic-release-skopeo:latest
        steps:
            - name: Checkout code
              uses: actions/checkout@v3
            
            - name: Skopeo login
              run: |
                skopeo login -u ${{ secrets.REGISTRY_USER }} -p ${{ secrets.REGISTRY_PASSWORD }} localhost:5000

            - name: Release
              run: npx semantic-release
```

## Advanced Configuration

For more detailed information on all available configuration flags, refer to the [Configuration](configuration.md) doc.
