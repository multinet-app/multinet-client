<template>

  <v-dialog
    v-model="dialog"
    width="700"
    >

    <template v-slot:activator="{ on }">
      <v-tooltip right>
        <template v-slot:activator="tooltip">
          <v-scroll-x-transition>
            <v-btn
              icon
              small
              text
              v-if="nonZeroSelection"
              v-on="on"
              >
              <v-icon color="red accent-3" size="22px">delete_sweep</v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Delete selected</span>
      </v-tooltip>
    </template>

    <v-card>
      <v-card-title
        class="headline pb-0 pt-3 px-5"
        primary-title
        >
        Delete Tables
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }} table{{plural}}. <strong>Are you sure?</strong>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          depressed
          color="error"
          @click="execute"
          :disabled="disabled"
        >yes</v-btn>

        <v-btn
          depressed
          @click="dialog = false"
          >cancel</v-btn>
      </v-card-actions>

    </v-card>

  </v-dialog>

</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import api from '@/api';

export default Vue.extend({
  props: {
    selection: {
      type: Array as PropType<string[]>,
      required: true,
    },

    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },

  data() {
    return {
      dialog: false,
      disabled: true,
      timeout: undefined as number | undefined,
    };
  },

  computed: {
    // This workaround is necessary because of https://github.com/vuejs/vue/issues/10455
    plural(this: any) {
      return this.selection.length > 1 ? 's' : '';
    },

    nonZeroSelection(): boolean {
      return this.selection.length > 0;
    },
  },

  watch: {
    dialog() {
      if (this.dialog) {
        this.timeout = window.setTimeout(() => {
          this.disabled = false;
          this.timeout = undefined;
        }, 2000);
      } else {
        window.clearTimeout(this.timeout);
        this.disabled = true;
        this.timeout = undefined;
      }
    },
  },

  methods: {
    async execute() {
      const {
        selection,
        workspace,
      } = this;

      selection.forEach(async (table) => {
        await api.deleteTable(workspace, table);
      });

      this.$emit('deleted');
      this.dialog = false;
    },
  },
});
</script>
