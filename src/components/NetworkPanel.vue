<template>
  <v-list
    class="item-panel"
    data-title="Networks"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">Networks</h2>

      <v-spacer />

      <div class="actions mr-2 pr-3">
        <download-dialog
          ref="downloader"
          :selection="selection"
          :workspace="workspace"
          download-type="graph"
        />

        <delete-graph-dialog
          ref="deleter"
          :selection="selection"
          :workspace="workspace"
          @closed="cleanup"
        />
      </div>

      <graph-dialog
        :workspace="workspace"
        :node-tables="nodeTables"
        :edge-tables="edgeTables"
        @success="cleanup"
      />

    </v-subheader>

    <v-divider />

    <template v-if="items.length > 0">
      <v-list-item-group color="primary">
        <v-hover
          v-for="item in items"
          :key="item"
        >
          <v-list-item
            active-class="grey lighten-4"
            ripple
            slot-scope="{ hover }"
            :to="`/workspaces/${workspace}/graph/${item}`"
          >
            <v-list-item-action @click.prevent>
              <v-icon
                class="item-icon"
                v-if="!hover && !checkbox[item]"
              >timeline</v-icon>

              <v-checkbox
                class="ws-detail-checkbox"
                v-else
                v-model="checkbox[item]"
              ></v-checkbox>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{item}}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action class="mx-0 my-0"
              @click.prevent
              v-if="hover"
            >
              <v-btn icon>
                <v-icon
                  color="primary"
                  @click="downloadItem(item)"
                >save_alt</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action class="mx-0 my-0"
              @click.prevent
              v-if="hover"
            >
              <v-btn icon>
                <v-icon
                  color="red accent-3"
                  @click="deleteItem(item)"
                >delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
      </v-list-item-group>
    </template>
    <div
      v-else
      class="ws-detail-empty-list"
    >
      <v-icon color="blue lighten-1">info</v-icon> There's nothing here yet...
    </div>
  </v-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import DeleteGraphDialog from '@/components/DeleteGraphDialog';
import GraphDialog from '@/components/GraphDialog';
import DownloadDialog from '@/components/DownloadDialog';

export default Vue.extend({
  name: 'GraphPanel',

  components: {
    DeleteGraphDialog,
    GraphDialog,
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

    nodeTables: {
      type: Array as PropType<string[]>,
      required: true,
    },

    edgeTables: {
      type: Array as PropType<string[]>,
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

      let result = [];

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

  methods: {
    deleteItem(item: string) {
      this.singleSelected = item;
      this.$refs.deleter.dialog = true;
    },

    downloadItem(item: string) {
      this.singleSelected = item;
      this.$refs.downloader.dialog = true;
    },

    clearCheckboxes() {
      Object.keys(this.checkbox).forEach((key) => {
        this.checkbox[key] = false;
      });
    },

    cleanup(deleted?: string[]) {
      const {
        singleSelected,
      } = this;

      if (singleSelected !== null) {
        this.singleSelected = null;
      }

      if (deleted) {
        deleted.forEach((item) => this.checkbox[item] = false);
      }

      this.$emit('update');
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
