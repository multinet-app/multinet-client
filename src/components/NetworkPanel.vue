<template>
  <v-list
    class="item-panel"
    data-title="Networks"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">
        Networks
      </h2>

      <v-spacer />

      <div class="actions mr-2 pr-3">
        <download-dialog
          ref="downloader"
          :selection="selection"
          :workspace="workspace"
          download-type="network"
          @downloaded="cleanup"
        />

        <delete-network-dialog
          ref="deleter"
          :selection="selection"
          :workspace="workspace"
          @closed="cleanup"
        />
      </div>

      <network-dialog
        :workspace="workspace"
        :node-tables="nodeTables"
        :edge-tables="edgeTables"
        @success="cleanup"
      />
    </v-subheader>

    <v-divider />

    <div v-if="loading">
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
    </div>

    <div
      v-else-if="items.length === 0"
      class="ws-detail-empty-list"
    >
      <v-icon color="blue lighten-1">
        info
      </v-icon> There's nothing here yet...
    </div>

    <template v-else>
      <v-list-item-group color="primary">
        <v-hover
          v-for="item in items"
          :key="item.id"
        >
          <v-list-item
            slot-scope="{ hover }"
            active-class="grey lighten-4"
            ripple
            :to="`/workspaces/${workspace}/network/${item.name}`"
            three-line
          >
            <v-list-item-action @click.prevent>
              <v-icon
                v-if="!hover && !checkbox[item]"
                class="item-icon"
              >
                timeline
              </v-icon>

              <v-checkbox
                v-else
                v-model="checkbox[item.name]"
                class="ws-detail-checkbox"
              />
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>Created: {{ new Date(item.created).toISOString().split('T')[0] }}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn
                v-for="app in apps.network_visualizations"
                :key="app.name"
                :disabled="!hover"
                color="primary"
                :href="`${app.url}/?workspace=${workspace}&network=${item.name}`"
                target="_blank"
                depressed
                small
                style="height: 22px; margin-top: 2px; margin-bottom: 2px;"
                @click.stop
              >
                Visualize in {{ app.name }}
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
      </v-list-item-group>
    </template>
  </v-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Network } from 'multinet';
import DeleteNetworkDialog from '@/components/DeleteNetworkDialog.vue';
import NetworkDialog from '@/components/NetworkDialog.vue';
import DownloadDialog from '@/components/DownloadDialog.vue';

import store from '@/store';
import { App } from '@/types';

export default Vue.extend({
  name: 'NetworkPanel',

  components: {
    DeleteNetworkDialog,
    NetworkDialog,
    DownloadDialog,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },

    items: {
      type: Array as PropType<Network[]>,
      required: true,
    },

    nodeTables: {
      type: Array as PropType<string[]>,
      required: true,
    },

    edgeTables: {
      type: Array as PropType<string[]>,
      required: true,
    },

    loading: {
      type: Boolean as PropType<boolean>,
      required: true,
    },

    apps: {
      type: Object as PropType<{ network_visualizations: App[]; table_visualizations: App[] }>,
      required: true,
    },
  },

  data() {
    interface CheckboxTable {
      [index: string]: boolean;
    }

    return {
      checkbox: {} as CheckboxTable,
      singleSelected: null as string | null,
      selectedVisApps: new Array(this.items.length),
    };
  },

  computed: {
    checked(): string[] {
      return Object.keys(this.checkbox)
        .filter((d) => !!this.checkbox[d]);
    },

    selection(): string[] {
      const {
        singleSelected,
        checked,
      } = this;

      let result: string[] = [];

      if (singleSelected !== null) {
        result = result.concat([singleSelected]);
      } else {
        result = result.concat(checked);
      }

      return result;
    },
  },

  watch: {
    workspace() {
      this.clearCheckboxes();
    },
  },

  methods: {
    clearCheckboxes() {
      Object.keys(this.checkbox).forEach((key) => {
        this.checkbox[key] = false;
      });
    },

    async cleanup() {
      this.singleSelected = null;
      await store.dispatch.fetchWorkspace(this.workspace);
      this.clearCheckboxes();
    },
  },
});
</script>

<style scoped>
.v-list.item-panel {
  background: none;
}

.ws-detail-empty-list {
  padding: 40px 40px 55px;
  text-align: center;
}

.item-icon {
  opacity: .4;
}

.actions {
  border-right: 1px solid #ccc;
}
</style>
