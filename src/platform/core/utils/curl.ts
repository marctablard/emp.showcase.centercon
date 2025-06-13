/**
 * Create a curl command for debugging
 * @param url URL to make the request to
 * @param options Request options
 * @returns string with the curl command
 */
export function buildCurl(url: string, options: RequestInit): string {
  // Build curl command for debugging
  const headerString = Object.entries(options.headers || {})
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(' ');

  const methodString = options.method ? `-X ${options.method}` : '';
  const bodyString = options.body ? `-d '${options.body}'` : '';

  return `curl -v ${methodString} ${headerString} ${bodyString} '${url}'`;
}
