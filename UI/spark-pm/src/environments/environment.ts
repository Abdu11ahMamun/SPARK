declare const window: any;
const runtimeApi = (typeof window !== 'undefined' && window.__env && window.__env.API_BASE_URL) ? window.__env.API_BASE_URL : 'http://localhost:8080';
export const environment = {
  production: false,
  apiUrl: runtimeApi
};
