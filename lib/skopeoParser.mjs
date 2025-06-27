import path from 'path';

const forbiddenCharsRegex = /[^a-z0-9._\-/:]/;

const validTransports = [
  "containers-storage",
  "dir",
  "docker",
  "docker-archive",
  "docker-daemon",
  "oci",
  "oci-archive",
];

const transportsWithPath = ["dir", "oci", "docker-archive", "oci-archive"];

export function parseSkopeoDestination(destination) {
  const result = {
    transport: null,
    details: null,
    errors: []
  };

  if (!destination.includes(":")) {
    result.errors.push("Invalid format: missing ':' to separate transport and details.");
    return result;
  }

  const [transport, ...rest] = destination.split(":");
  const details = rest.join(":").trim();

  result.transport = transport.trim();
  result.details = details;

  // Validate transport type
  if (!validTransports.includes(result.transport)) {
    result.errors.push(`Invalid transport type: '${result.transport}'`);
  }

  // Check for forbidden characters in details
  if (forbiddenCharsRegex.test(details)) {
    result.errors.push("Details contain forbidden characters.");
  }

  // Check if path is absolute for local transports
  if (transportsWithPath.includes(result.transport)) {
    const filePath = details.split(":")[0];
    if (!path.isAbsolute(filePath)) {
      result.errors.push(`Path is not absolute: '${filePath}'`);
    }
  }

  return result;
}
