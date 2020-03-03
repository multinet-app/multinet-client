<template>

  <v-dialog
    v-model="dialog"
    width="400"
    v-if="nonZeroSelection"
  >
    <template v-slot:activator="{ on: dialog }">
      <v-tooltip left>
        <template v-slot:activator="{ on: tooltip }">
          <v-scroll-x-transition>
            <v-btn
              icon
              small
              text
              @click="dialog.click"
              v-on="tooltip"
            >
              <v-icon color="primary" size="22px">save_alt</v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Download selected</span>
      </v-tooltip>
    </template>

    <v-card class="pa-0">
      <v-card-title
        class="pa-4"
        primary-title
      >
        Download the following {{ selection.length > 1 ? selection.length : '' }} {{downloadType}}{{plural}}?
      </v-card-title>

      <v-card-text class="pa-0">
        <v-list
          class="pa-0"
          color="grey lighten-4"
        >
          <template v-for="item in selection">
            <v-divider />
            <v-list-item :key="item">
              <v-list-item-icon>
                <v-icon
                  color="green accent-4"
                  size="18"
                >
                  check
                </v-icon>
              </v-list-item-icon>
              {{ item }}
            </v-list-item>
          </template>

        </v-list>
      </v-card-text>

      <v-divider />
      <v-progress-linear indeterminate :active="loading" />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          depressed
          color="primary"
          @click="execute"
          :disabled="disabled"
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

    downloadType: {
      type: String as PropType<string>,
      required: true,
    },
  },

  data() {
    return {
      dialog: false,
      disabled: false,
      timeout: undefined as number | undefined,
      loading: false,
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

    downloadEnpoint() {
      switch (this.downloadType) {
        case 'table':
          return api.downloadTable.bind(api);
          break;
        case 'network':
        default:
          return api.downloadGraph.bind(api);
          break;
      }
    },
  },
  methods: {
    async execute() {
      const {
        selection,
        workspace,
      } = this;


      this.loading = true;
      for (const name of selection) {
        const { data, headers: {'content-type': contentType } } = await this.downloadEnpoint(workspace, name);
        const blobData = data instanceof Object ? JSON.stringify(data, null, 2) : data;
        const blob = new Blob([blobData], {type: contentType});

        const extension = contentType.split('/')[1];
        const filename = `${name}.${extension}`;
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      this.$emit('downloaded');
      this.loading = false;
      this.dialog = false;
    },
  },
});
</script>
