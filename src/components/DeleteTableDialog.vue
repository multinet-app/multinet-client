<template>

  <v-dialog
    v-model="dialog"
    width="700"
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
              <v-icon color="red accent-3" size="22px">delete_sweep</v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Delete selected</span>
      </v-tooltip>
    </template>

    <v-card v-if="!dependentGraphs">
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
    <v-card v-else>
      <v-card-title
        class="headline pb-0 pt-3 px-5"
        primary-title
        >
        Delete Tables
      </v-card-title>

      <v-card-text class="px-5 py-4">
        The following networks are using these tables:
        <ul>
          <li v-for="graph in using">
            {{ graph.graph }} ({{ graph.tables.join(', ') }})
          </li>
        </ul>
      </v-card-text>

      <v-card-text class="px-5 py-4">
        You must delete these networks before you can delete the tables.
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />

        <v-btn
          depressed
          @click="dialog = false"
          >ok</v-btn>
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
      using: [] as Array<{graph: string, tables: string[]}>,
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

    dependentGraphs(): boolean {
      return this.using.length > 0;
    },
  },

  watch: {
    async dialog() {
      if (this.dialog) {
        this.using = [];
        const using = await this.findDependentGraphs();
        if (using.length > 0) {
          this.using = using;
        } else {
          this.timeout = window.setTimeout(() => {
            this.disabled = false;
            this.timeout = undefined;
          }, 2000);
        }
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

    async findDependentGraphs() {
      const {
        selection,
        workspace,
      } = this;

      const graphNames = await api.graphs(workspace);

      const using = [] as Array<{graph: string, tables: string[]}>;
      for (const graph of graphNames) {
        const data = await api.graph(workspace, graph);

        const tables = [];
        for (const table of selection) {
          if (table === data.edgeTable || data.nodeTables.indexOf(table) > -1) {
            tables.push(table);
          }
        }

        if (tables.length > 0) {
          using.push({
            graph,
            tables,
          });
        }
      }

      return using;
    },
  },
});
</script>
