# Configuration

## Supported skopeo Flags

This section lists the flags supported by the `@lukaswestholt/semantic-release-skopeo` plugin.

We allow using either `.releaserc` or environment variables to configure the plugin. If both are set, the configuration in `.releaserc` is preferred. Environment variables should be represented as JSON if they contain anything more than a single key-value pair.

### args

This flag allows you to pass any argument. Use an array for multiple values.

You can use any [argument](https://github.com/containers/skopeo/blob/855cfb2f230d817b5d353de377069ee3840511fd/docs/skopeo-copy.1.md).

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "args": [
                "MY_VAR=value with spaces",
                "MY_VAR_2=ValueWithNoSpaces"
            ]
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_ARGS='["MY_VAR=value with spaces","MY_VAR_2=ValueWithNoSpaces"]'
```

### source

This flag specifies the source of the image that should be copied.

You can use any [transport type](https://github.com/containers/skopeo/blob/main/docs/skopeo.1.md#image-names).

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "source": "docker-archive:archive.tar"
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_SOURCE='docker-archive:archive.tar'
```

### destination

This flag specifies the destination the image should be pushed to.

You can use any [transport type](https://github.com/containers/skopeo/blob/main/docs/skopeo.1.md#image-names).

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "destination": [
                "docker://registry.example.com/my-project/my-image:${version}",
                "docker://registry.example.com/my-project/my-image:latest",
                "docker-archive:archive.tar"
            ]
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_DESTINATION='["docker://registry.example.com/my-project/my-image:\${version}","docker://registry.example.com/my-project/my-image:latest", "docker-archive:archive.tar"]'
```


### force

This flag forces images to overwrite existing ones.

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "force": true
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_FORCE=true
```

### pushIgnoreImmutableTagErrors

This flag, when set to `true`, ignores tag immutability errors during push operations.

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "pushIgnoreImmutableTagErrors": true
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_PUSH_IGNORE_IMMUTABLE_TAG_ERRORS=true
```

### retry

This flag specifies the number of retries for each copy operation. Default is 0.

**.releaserc:**

```json
{
    "plugins": [
        "@lukaswestholt/semantic-release-skopeo",
        {
            "retry": 3
        }
    ]
}
```

**Environment variable:**

```shell
SKOPEO_RETRY=3
```
