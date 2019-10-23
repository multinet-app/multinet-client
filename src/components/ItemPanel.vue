<template>
  <v-list
    class="item-panel"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">{{title}}</h2>

      <v-spacer />

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-scroll-x-transition>
            <v-btn
              icon
              small
              text
              v-if="anySelected"
              v-on="on"
            >
              <v-icon color="red accent-2" size="22px">delete_sweep</v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Delete selected</span>
      </v-tooltip>

      <table-dialog
        :types="fileTypes"
        :workspace="workspace"
        @success="update"
      />

    </v-subheader>

    <v-divider></v-divider>

    <template v-if="items.length > 0">
      <v-hover
        v-for="item in items"
        :key="item"
      >
        <v-list-item
          active-class="grey lighten-4"
          ripple
          slot-scope="{ hover }"
          :to="`/workspaces/${workspace}/${routeType}/${item}`"
        >
          <v-list-item-action @click.prevent>
            <v-fade-transition hide-on-leave>
              <v-icon
                color="blue lighten-1"
                v-if="!hover && !checkbox[item]"
              >{{icon}}</v-icon>

              <v-checkbox
                class="ws-detail-checkbox"
                v-else
                v-model="checkbox[item]"
              ></v-checkbox>
            </v-fade-transition>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{item}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-hover>
    </template>
    <div
      class="ws-detail-empty-list"
      v-else
    >
      <v-icon color="blue lighten-1">info</v-icon> There's nothing here yet...
    </div>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '@/api';

import TableDialog from '@/components/TableDialog.vue';
import { FileTypeTable } from '@/types';

export default Vue.extend({
  name: 'ItemPanel',
  components: {
    TableDialog,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    workspace: {
      type: String,
      required: true,
    },
    routeType: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      checkbox: {},
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'},
        nested_json: {extension: ['json'], queryCall: 'nested_json'},
      } as FileTypeTable,
    };
  },
  watch: {
    workspace() {
      this.update();
    },
  },
  methods: {
    async update() {
      // Get lists of node and edge tables.
      let response = await api().get(`workspaces/${this.workspace}/tables?type=node`);
      const nodeTables = response.data;

      response = await api().get(`workspaces/${this.workspace}/tables?type=edge`);
      const edgeTables = response.data;

      this.tables = nodeTables.concat(edgeTables);
      this.nodeTables = nodeTables;
      this.edgeTables = edgeTables;

      // Get list of graphs.
      response = await api().get(`workspaces/${this.workspace}/graphs`);
      const graphs = response.data;

      this.graphs = graphs;
    },
  },
  created() {
    this.update();
  },
  computed: {
    anySelected(): boolean {
      return Object.values(this.checkbox)
        .some((d) => !!d);
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
</style>
