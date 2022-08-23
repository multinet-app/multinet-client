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
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    href: {
      type: String as PropType<string>,
      default: '',
    },
  },
});
</script>
