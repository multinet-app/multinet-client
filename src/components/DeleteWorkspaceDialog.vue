<template>

  <v-dialog
    v-model="dialog"
    width="700"
    v-if="somethingChecked"
    >

    <template v-slot:activator="{ on: dialog }">
      <v-tooltip left>
        <template v-slot:activator="{ on: tooltip }">
          <v-scroll-x-transition>
            <v-btn
              id="delete-workspaces"
              icon
              small
              text
              @click="dialog.click"
              v-on="tooltip"
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
        Delete Workspaces
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }} workspace{{plural}}. Type
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
          id="delete-workspace-yes"
          depressed
          color="error"
          @click="execute"
          :disabled="confirmation !== confirmationPhrase"
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

function selectRandomPhrase(): string {
  return 'clever palomino';
}

export default Vue.extend({
  props: {
    somethingChecked: {
      type: Boolean as PropType<boolean>,
      required: true,
    },

    selection: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },

  data() {
    return {
      dialog: false,
      confirmationPhrase: '',
      confirmation: '',
    };
  },

  computed: {
    // This workaround is necessary because of https://github.com/vuejs/vue/issues/10455
    plural(this: any) {
      return this.selection.length > 1 ? 's' : '';
    },
  },

  watch: {
    dialog() {
      if (this.dialog) {
        this.confirmationPhrase = selectRandomPhrase();
      }
    },
  },

  methods: {
    async execute() {
      const {
        selection,
      } = this;

      selection.forEach(async (ws) => {
        await api.deleteWorkspace(ws);
      });

      this.$emit('deleted');
      this.dialog = false;
    },
  },
});
</script>
