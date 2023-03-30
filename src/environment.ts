export const host: string = import.meta.env.VITE_MULTINET_HOST || 'http://localhost:8000';
export const gaTag: string = import.meta.env.VITE_GA_TAG || '';
export const gitSha: string = import.meta.env.VITE_GIT_SHA || '';
export const oauthApiRoot: string = import.meta.env.VITE_OAUTH_API_ROOT || `${host}/oauth/`;
export const oauthClientId: string = import.meta.env.VITE_OAUTH_CLIENT_ID || '';
export const sentryDsn: string = import.meta.env.VITE_SENTRY_DSN || '';
export const prodBuild: boolean = import.meta.env.PROD;
