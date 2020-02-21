<template>
  <a :href="href" target="_blank" rel="noopener noreferrer">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  props: {
    href: {
      type: String as PropType<string>,
      default: '',
    },
  },
});
</script>
