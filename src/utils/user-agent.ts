/**
 * Get the user agent string for Dynatrace Managed MCP requests
 */
export function getUserAgent(): string {
  const serverName = process.env.MCP_SERVER_NAME || 'dynatrace-managed-mcp';
  const serverVersion = process.env.MCP_SERVER_VERSION || '1.0.0';
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;

  return `${serverName}/${serverVersion} (Node.js ${nodeVersion}; ${platform} ${arch})`;
}
