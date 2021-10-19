import OauthClient from '@girder/oauth-client';
import { oauthApiRoot, oauthClientId } from './environment';

export default new OauthClient(oauthApiRoot, oauthClientId);
