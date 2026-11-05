// Set REACT_APP_API_URL at build time to point the app at a hosted backend.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';
// Demo mode: no backend, everything is answered in the browser from recorded fixtures (src/demo).
// The GitHub Pages build turns this on until a real backend is hosted.
export const DEMO = process.env.REACT_APP_DEMO === 'true';
// Socket.io server (the backend without the /api suffix).
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');
// Prefix for files in /public, so images work when served from a sub-path (GitHub Pages).
export const asset = (path) => `${process.env.PUBLIC_URL || ''}${path}`;
// How to use :`${API_URL}`
