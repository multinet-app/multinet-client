<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex>
          <v-select
            filled
            label="Choose edge table"
            v-model="graphEdgeTable"
            :items="edgeTables"
          />
        </v-flex>
      </v-layout>

      <v-layout wrap>
        <v-flex>
          <v-text-field
            filled
            label="Network name"
            v-model="newGraph"
            :error-messages="graphCreationErrors"
          />
        </v-flex>
      </v-layout>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="px-4 py-3">
      <v-spacer></v-spacer>
      <v-btn
        depressed
        :disabled="graphCreateDisabled"
        @click="createGraph"
      >create network</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';

export default Vue.extend({
  name: 'GraphCreateForm',
  props: {
    edgeTables: Array,
    workspace: String,
  },
  data() {
    return {
      graphCreationErrors: [] as string[],
      graphEdgeTable: null as string | null,
      newGraph: '',
    };
  },
  computed: {
    graphCreateDisabled(): boolean {
      return !this.graphEdgeTable || !this.newGraph;
    },
  },
  methods: {
    async createGraph() {
      const { workspace, newGraph } = this;

      if (this.graphEdgeTable === null) {
        throw new Error('this.graphEdgeTable must not be null');
      }

      try {
        await api.createGraph(workspace, newGraph, {
          edgeTable: this.graphEdgeTable,
        });
        this.graphCreationErrors = [];
        this.$emit('success');
      } catch (error) {
        const message = `Network "${this.newGraph}" already exists.`;
        this.graphCreationErrors = [message];
      }
    },
  },
});
</script>

<style scoped>
.new-button {
  margin: 49px 10px 0 0;
  z-index: 1;
}
</style>
