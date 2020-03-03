import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Vue from 'vue';
import App from './App.vue';
import vuetify from './vuetify';
import router from './router';
import './vuegtag';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router,
  vuetify,
}).$mount('#app');
