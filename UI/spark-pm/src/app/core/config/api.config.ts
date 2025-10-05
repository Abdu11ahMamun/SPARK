declare const window: any;
const runtimeApi = (typeof window !== 'undefined' && window.__env && window.__env.API_BASE_URL) ? window.__env.API_BASE_URL : (window?.location?.origin || '');
export const environment = {
  production: false,
  apiBaseUrl: runtimeApi ? `${runtimeApi.replace(/\/$/, '')}/api` : '/api'
};
