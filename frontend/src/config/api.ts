/**
 * API Configuration
 * Determines the correct base URL based on the environment
 */

const getApiBaseUrl = (): string => {
  // First, check if there's an environment variable set
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // For production, use relative URLs or the current host
  // This way it will work on the Raspberry Pi and any device accessing it
  const { protocol, hostname } = window.location;
  
  // If accessing via localhost, use localhost (for local testing)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//localhost:5000`;
  }
  
  // For production on Raspberry Pi or any other host
  // Since nginx proxies API calls, we can use relative URLs
  return '';  // Empty string means relative to current domain
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  
  // Helper method to build full API URLs
  getUrl: (endpoint: string): string => {
    const base = API_CONFIG.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    if (base === '') {
      // For relative URLs, we need to prefix with /api or handle via nginx proxy
      return `/api${cleanEndpoint}`;
    }
    
    return `${base}${cleanEndpoint}`;
  }
};

// Alternative: Environment-specific configuration
export const API_ENDPOINTS = {
  development: 'http://localhost:5000',
  production: '', // Relative URL for production
  raspberry_pi: 'http://192.168.1.101' // If you need absolute URL
};

export default API_CONFIG;
