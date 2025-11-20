// Environment variables configuration
type Env = {
  api: {
    url: string;
  };
};

// Default API URL - can be overridden by VITE_API_URL in .env file
const DEFAULT_API_URL = 'https://hmc1.rml.co.id/api-ticketing-gs/api';

// Prefer Vite env var if available, then fallback to CRA-style, then default
const RESOLVED_API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  DEFAULT_API_URL;

const env: Env = {
  api: {
    url: RESOLVED_API_URL,
  },
};

export default env;
