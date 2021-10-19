export const host: string = process.env.VUE_APP_MULTINET_HOST || 'http://localhost:8000';
export const gaTag: string = process.env.VUE_APP_GA_TAG || '';
export const gitSha: string = process.env.VUE_APP_GIT_SHA || '';
export const oauthApiRoot: string = process.env.VUE_APP_OAUTH_API_ROOT || `${host}/oauth/`;
export const oauthClientId: string = process.env.VUE_APP_OAUTH_CLIENT_ID || '';
