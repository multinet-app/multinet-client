<template>
  <v-dialog
    v-if="nonZeroSelection"
    v-model="dialog"
    width="700"
  >
    <template v-slot:activator="{ on: button }">
      <v-tooltip left>
        <template v-slot:activator="{ on: tooltip }">
          <v-scroll-x-transition>
            <v-btn
              class="ml-1"
              icon
              small
              @click="button.click"
              v-on="tooltip"
            >
              <v-icon
                color="red accent-3"
                size="20px"
              >
                delete_sweep
              </v-icon>
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
        Delete Networks
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }} network{{ plural }}. Type
        the following phrase to confirm: <strong>{{ confirmationPhrase }}</strong>
      </v-card-text>

      <v-card-text>
        <v-text-field
          v-model="confirmation"
          autofocus
          dense
          outlined
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          depressed
          color="error"
          :disabled="confirmation !== confirmationPhrase"
          @click="execute"
        >
          yes
        </v-btn>

        <v-btn
          depressed
          @click="dialog = false"
        >
          cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import api from '@/api';
import { randomPhrase } from '@/utils/randomPhrase';

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
      confirmation: '',
      confirmationPhrase: '',
    };
  },

  computed: {
    // This workaround is necessary because of https://github.com/vuejs/vue/issues/10455
    //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        this.confirmationPhrase = randomPhrase();
      } else {
        this.$emit('closed');
      }
    },
  },

  methods: {
    async execute() {
      const {
        selection,
        workspace,
      } = this;

      await Promise.all(selection.map((network) => api.deleteNetwork(workspace, network)));

      this.$emit('closed');
      this.dialog = false;
    },
  },
});
</script>
