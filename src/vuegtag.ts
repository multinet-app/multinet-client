import Vue from 'vue';
import VueGtag from 'vue-gtag';

import router from '@/router';

// Inject a value for gaTag (google analytics) if present
const GA_TAG = process.env.VUE_APP_GA_TAG || '';

if (GA_TAG) {
  Vue.use(VueGtag, {
    config: {
      id: GA_TAG,
    },
  }, router);
}
