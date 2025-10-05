declare const window: any;
const runtimeApi = (typeof window !== 'undefined' && window.__env && window.__env.API_BASE_URL) ? window.__env.API_BASE_URL : '';
export const environment = {
  production: true,
  apiUrl: runtimeApi
};
