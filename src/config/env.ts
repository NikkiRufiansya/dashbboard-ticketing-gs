// Environment variables configuration
type Env = {
  api: {
    url: string;
  };
};

// Default API URL - can be overridden by REACT_APP_API_URL in .env file
const DEFAULT_API_URL = 'https://hmc1.rml.co.id/api-ticketing-gs/api';

const env: Env = {
  api: {
    url: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
  },
};

export default env;
