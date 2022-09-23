import * as Sentry from '@sentry/vue';
import Vue from 'vue';
import App from './App.vue';
import api from './api';
import { sentryDsn } from './environment';
import oauthClient from './oauth';
import vuetify from './vuetify';
import router from './router';
import store from './store';
import './vuegtag';

Vue.config.productionTip = false;

oauthClient.maybeRestoreLogin().then(() => {
  Object.assign(api.axios.defaults.headers.common, oauthClient.authHeaders);

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
