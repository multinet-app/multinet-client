import Vue from 'vue';
import VueGtag from 'vue-gtag';

import router from '@/router';

declare const GA_TAG: string;

if (GA_TAG) {
  Vue.use(VueGtag, {
    config: {
      id: GA_TAG,
    },
  }, router);
}
