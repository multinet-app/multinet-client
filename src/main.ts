import * as Sentry from '@sentry/vue';
import Vue from 'vue';
import App from './App.vue';
import api from './api';
import oauthClient from './oauth';
import { sentryDsn, oauthClientId } from './environment';
import vuetify from './vuetify';
import router from './router';
import store from './store';
import './vuegtag';

Vue.config.productionTip = false;

function writeSharedLoginCookie(token: string) {
  document.cookie = `sharedLogin=${token}; Domain=${window.location.hostname}`;
}

function invalidateSharedLoginCookie() {
  document.cookie = `sharedLogin=; Domain=${window.location.hostname}; Max-Age=0`;
}

oauthClient.maybeRestoreLogin().then(() => {
  Object.assign(api.axios.defaults.headers.common, oauthClient.authHeaders);

  const tokenString = localStorage.getItem(`oauth-token-${oauthClientId}`);
  if (tokenString) {
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
