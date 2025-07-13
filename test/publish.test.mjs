// test/publish.test.mjs
import { describe, it, beforeEach, expect } from "vitest";
import { publish } from "../lib/publish.mjs";
import { parseConfig } from "../lib/config.mjs";
import SemanticReleaseError from "@semantic-release/error";
import { checkImageExists } from "../lib/verifyConditions.mjs";

// Merging prepare and publish into the same test suite to guarantee order
describe("Comprehensive Test with All Arguments", () => {
    let context;
    let pluginConfig;

    function getNewDestinations() {
        return [
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:${version}",
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:latest",
        ];
    }

    beforeEach(() => {
        context = {
            logger: console,
            nextRelease: {
                version: "1.0.0",
            },
        };

        pluginConfig = {
            copyArgs: [
                "--additional-tag=test:latest",
                "--dest-tls-verify=false",
            ],
            inspectArgs: ["--tls-verify=false"],
            source: "docker-archive:test/resources/hello_world.tar",
            destination: getNewDestinations(),
            force: true,
            pushIgnoreImmutableTagErrors: true,
            retry: 5,
        };
    });

    it("should execute publish with all configuration parameters successfully", async () => {
        await expect(publish(pluginConfig, context)).resolves.not.toThrow();
        await expect(publish(pluginConfig, context)).resolves.not.toThrow();
    }, 600_000); // 10-minute timeout

    it("should execute publish with all configuration parameters successfully even without force", async () => {
        const pluginConfigNew = { ...pluginConfig };
        pluginConfigNew.force = false;
        pluginConfigNew.destination = getNewDestinations();

        const config = parseConfig(pluginConfigNew);

        expect(
            await checkImageExists(pluginConfigNew.destination[1], config),
        ).toBeFalsy();
        await expect(publish(pluginConfigNew, context)).resolves.not.toThrow();
        expect(
            await checkImageExists(pluginConfigNew.destination[1], config),
        ).toBeTruthy();
        await expect(publish(pluginConfigNew, context)).rejects.toMatchObject({
            code: "EIMAGEEXISTS",
            constructor: SemanticReleaseError,
        });
    }, 600_000); // 10-minute timeout

    it("should execute publish with all possible version variables", async () => {
        const pluginConfigNew = { ...pluginConfig };
        pluginConfigNew.destination = [
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:${version}",
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:${majorVersion}",
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:${minorVersion}",
        ];
        await expect(publish(pluginConfigNew, context)).resolves.not.toThrow();
    }, 600_000); // 10-minute timeout

    it("should fail with impossible variables", async () => {
        const pluginConfigNew = { ...pluginConfig };
        pluginConfigNew.destination = [
            "docker://mock-registry:5000/my-project" +
                Date.now().toString() +
                "/my-image:${versionFail}",
        ];
        await expect(publish(pluginConfigNew, context)).rejects.toThrowError(
            expect.objectContaining({ code: "EIMAGE_CHECK_FAILED" }),
        );
    }, 600_000); // 10-minute timeout
});
