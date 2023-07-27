<template>
  <v-list
    class="item-panel"
    data-title="Tables"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">
        Tables
      </h2>

      <v-spacer />

      <div class="actions mr-2 pr-3">
        <download-dialog
          ref="downloader"
          :selection="selection"
          :workspace="workspace"
          download-type="table"
          @downloaded="cleanup"
        />

        <delete-table-dialog
          ref="deleter"
          :selection="selection"
          :workspace="workspace"
          @closed="cleanup"
        />
      </div>
    </v-subheader>

    <v-divider />

    <div v-if="loading">
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
    </div>

    <div
      v-else-if="items.length === 0"
      class="ws-detail-empty-list"
    >
      <v-icon color="blue lighten-1">
        mdi-information
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
            :to="`/workspaces/${workspace}/table/${item.name}`"
            three-line
          >
            <v-list-item-action @click.prevent>
              <v-icon
                v-if="!hover && !checkbox[item.name]"
                class="item-icon"
              >
                mdi-table
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
                :disabled="!hover"
                color="primary"
                :href="`${upsetUrl}/?workspace=${workspace}&table=${item.name}`"
                target="_blank"
                rel="noopener noreferrer"
                depressed
                small
                class="mt-3"
                @click.stop
              >
                Visualize in Upset
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
      </v-list-item-group>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import {
  computed, ref, watch,
} from 'vue';
import DeleteTableDialog from '@/components/DeleteTableDialog.vue';
import DownloadDialog from '@/components/DownloadDialog.vue';

import store from '@/store';
import type { App, CheckboxTable } from '@/types';
import type { Table } from 'multinet';

const props = defineProps<{
  workspace: string
  items: Table[]
  loading: boolean
  apps: { network_visualizations: App[]; table_visualizations: App[] }
}>();

const checkbox = ref<CheckboxTable>({});
const singleSelected = ref<string | null>(null);

const checked = computed(() => Object.keys(checkbox.value).filter((d) => !!checkbox.value[d]));
const selection = computed(() => (singleSelected.value !== null ? [singleSelected.value] : [...checked.value]));
const upsetUrl = computed(() => {
  const foundApp = props.apps.table_visualizations.find((vis: App) => vis.name === 'Upset');

  return foundApp !== undefined ? foundApp.url : '';
});

function clearCheckboxes() {
  Object.keys(checkbox.value).forEach((key) => {
    checkbox.value[key] = false;
  });
}

async function cleanup() {
  singleSelected.value = null;
  await store.dispatch.fetchWorkspace(props.workspace);
  clearCheckboxes();
}

watch(() => props.workspace, () => clearCheckboxes());

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
