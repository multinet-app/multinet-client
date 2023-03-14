import * as Sentry from '@sentry/vue';
import Vue from 'vue';
import { writeSharedLoginCookie, invalidateSharedLoginCookie, readSharedLoginCookie } from 'multinet';
import App from './App.vue';
import api from './api';
import oauthClient from './oauth';
import { sentryDsn, oauthClientId, prodBuild } from './environment';
import vuetify from './vuetify';
import router from './router';
import store from './store';
import './vuegtag';

Vue.config.productionTip = false;

const loginTokenKey = `oauth-token-${oauthClientId}`;
const sharedLoginCookie = readSharedLoginCookie();
if (prodBuild && sharedLoginCookie !== null) {
  localStorage.setItem(loginTokenKey, sharedLoginCookie);
}

oauthClient.maybeRestoreLogin().then(() => {
  Object.assign(api.axios.defaults.headers.common, oauthClient.authHeaders);

  // If logged out, remove the local storage item
  if (!Object.keys(oauthClient.authHeaders).includes('Authorization')) {
    localStorage.removeItem(loginTokenKey);
  }

  const tokenString = localStorage.getItem(loginTokenKey);
  if (tokenString !== null) {
    writeSharedLoginCookie(tokenString);
  } else {
    invalidateSharedLoginCookie();
  }

  if (sentryDsn && window.location.hostname !== 'localhost') {
    Sentry.init({
      Vue,
      dsn: sentryDsn,
    });
  }

  new Vue({
    render: (h) => h(App),
    router,
    // Necessary to correctly use direct-vuex
    store: store.original,
    vuetify,
  }).$mount('#app');
});
