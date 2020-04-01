import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Vue from 'vue';
import App from './App.vue';
import vuetify from './vuetify';
import router from './router';
import store from './store';
import './vuegtag';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router,
  // Necessary to correctly use direct-vuex
  store: store.original,
  vuetify,
}).$mount('#app');
