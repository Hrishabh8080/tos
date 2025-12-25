// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://tos-gp73.onrender.com' 
    : 'http://localhost:3001');

// Log for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API_URL:', API_URL);
}

export default API_URL;
