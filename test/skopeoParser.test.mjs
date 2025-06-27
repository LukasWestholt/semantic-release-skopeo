import { describe, it, expect } from 'vitest';
import { parseSkopeoDestination } from '../lib/skopeoParser.mjs';

describe('parseSkopeoDestination', () => {
  it('parses a valid docker destination', () => {
    const input = 'docker://docker.io/library/alpine:latest';
    const result = parseSkopeoDestination(input);
    expect(result.transport).toBe('docker');
    expect(result.details).toBe('//docker.io/library/alpine:latest');
    expect(result.errors.length).toBe(0);
  });

  it('parses a valid local dir destination', () => {
    const input = 'dir:lib';
    const result = parseSkopeoDestination(input);
    expect(result.transport).toBe('dir');
    expect(result.details).toBe('lib');
    expect(result.errors.length).toBe(0);
  });

  it('detects an invalid transport', () => {
    const input = 'invalid:/tmp/image';
    const result = parseSkopeoDestination(input);
    expect(result.transport).toBe('invalid');
    expect(result.errors).toContain("Invalid transport type: 'invalid'");
  });

  it('detects forbidden characters in details', () => {
    const input = 'docker://registry.example.com/repo:bad tag!';
    const result = parseSkopeoDestination(input);
    expect(result.errors).toContain("Details contain forbidden characters: //registry.example.com/repo:bad tag!");
  });

  it('detects uppercase characters in details', () => {
    const input = 'docker://ghcr.io/LukasWestholt/semantic-release-skopeo/semantic-release-skopeo:latest';
    const result = parseSkopeoDestination(input);
    expect(result.errors).toContain("Details contain forbidden characters: //ghcr.io/LukasWestholt/semantic-release-skopeo/semantic-release-skopeo:latest");
  });

  it('detects non-existing path for local targets', () => {
    const input = 'dir:relative/path';
    const result = parseSkopeoDestination(input);
    expect(result.errors).toContain("File does not exist: '/usr/src/app/relative/path'");
  });

  it('detects missing colon in destination', () => {
    const input = 'docker';
    const result = parseSkopeoDestination(input);
    expect(result.errors).toContain("Invalid format: missing ':' to separate transport and details.");
  });
});
