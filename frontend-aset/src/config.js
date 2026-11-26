const PRODUCTION_API_URL = 'https://velcer.app';
const DEVELOPMENT_API_URL = import.meta.env.VITE_API_URL;

export const API_URL = import.meta.env.DEV && DEVELOPMENT_API_URL
  ? DEVELOPMENT_API_URL
  : PRODUCTION_API_URL;
