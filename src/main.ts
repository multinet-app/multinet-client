import 'material-design-icons-iconfont/dist/material-design-icons.css';
import AsyncComputed from 'vue-async-computed';
import VueCompositionApi from '@vue/composition-api';
import Vue from 'vue';
import App from './App.vue';
import vuetify from './vuetify';
import router from './router';
import store from './store';
import './vuegtag';

Vue.config.productionTip = false;
Vue.use(AsyncComputed);
Vue.use(VueCompositionApi);

new Vue({
  render: (h) => h(App),
  router,
  // Necessary to correctly use direct-vuex
  store: store.original,
  vuetify,
}).$mount('#app');
