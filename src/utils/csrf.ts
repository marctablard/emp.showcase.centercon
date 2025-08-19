/**
 * Client-side utility for fetching and managing CSRF tokens
 */

// Cache the token to avoid unnecessary requests
let csrfToken: string | null = null;

/**
 * Fetches a CSRF token from the server
 * @returns Promise resolving to the CSRF token
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf');

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    csrfToken = data.token;
    if (!csrfToken) {
      throw new Error('Invalid CSRF token response');
    }

    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Adds CSRF token to fetch options for non-GET requests
 * @param options Fetch options to enhance with CSRF token
 * @returns Enhanced fetch options with CSRF token header
 */
export async function withCsrf<T extends RequestInit>(options: T): Promise<T> {
  // Only add CSRF for state-changing methods
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    const token = await getCsrfToken();

    if (!options.headers) {
      options.headers = {};
    }

    // Add CSRF token to headers
    if (options.headers instanceof Headers) {
      options.headers.set('x-csrf-token', token);
    } else {
      (options.headers as Record<string, string>)['x-csrf-token'] = token;
    }
  }

  return options;
}
