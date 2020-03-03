import Vue from 'vue';
import VueGtag from 'vue-gtag';

import router from '@/router';
import { gaTag } from '@/environment';

if (gaTag) {
  Vue.use(VueGtag, {
    config: {
      id: gaTag,
    },
  }, router);
}
