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
          @deleted="cleanup"
          @closed="cleanup"
        />
      </div>

      <table-dialog
        :workspace="workspace"
        @success="cleanup"
      />
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
        info
      </v-icon> There's nothing here yet...
    </div>

    <template v-else>
      <v-list-item-group color="primary">
        <v-hover
          v-for="item in items"
          :key="item"
        >
          <v-list-item
            slot-scope="{ hover }"
            active-class="grey lighten-4"
            ripple
            :to="`/workspaces/${workspace}/table/${item}`"
          >
            <v-list-item-action @click.prevent>
              <v-icon
                v-if="!hover && !checkbox[item]"
                class="item-icon"
              >
                table_chart
              </v-icon>

              <v-checkbox
                v-else
                v-model="checkbox[item]"
                class="ws-detail-checkbox"
              />
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action
              v-if="hover"
              class="mx-0 my-0"
              @click.prevent
            >
              <v-btn icon>
                <v-icon
                  color="primary"
                  @click="downloadItem(item)"
                >
                  save_alt
                </v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action
              v-if="hover"
              class="mx-0 my-0"
              @click.prevent
            >
              <v-btn icon>
                <v-icon
                  color="red accent-3"
                  @click="deleteItem(item)"
                >
                  delete
                </v-icon>
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
import DeleteTableDialog from '@/components/DeleteTableDialog.vue';
import TableDialog from '@/components/TableDialog.vue';
import DownloadDialog from '@/components/DownloadDialog.vue';

import store from '@/store';

export default Vue.extend({
  name: 'TablePanel',

  components: {
    DeleteTableDialog,
    TableDialog,
    DownloadDialog,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },

    items: {
      type: Array as PropType<string[]>,
      required: true,
    },

    loading: {
      type: Boolean as PropType<boolean>,
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
      deleterDialog: false,
      downloaderDialog: false,
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

    anySelected(): boolean {
      return this.selection.length > 0;
    },
  },

  watch: {
    workspace() {
      this.clearCheckboxes();
    },
  },

  methods: {
    deleteItem(item: string) {
      this.singleSelected = item;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs.deleter as any).dialog = true;
    },

    downloadItem(item: string) {
      this.singleSelected = item;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs.downloader as any).dialog = true;
    },

    clearCheckboxes() {
      Object.keys(this.checkbox).forEach((key) => {
        this.checkbox[key] = false;
      });
    },

    async cleanup(selection?: string[]) {
      this.singleSelected = null;

      if (selection) {
        selection.forEach((item) => {
          this.checkbox[item] = false;
        });
      }

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
