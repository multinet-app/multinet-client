<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    href: {
      type: String as PropType<string>,
      default: '',
    },
  },
});
</script>
