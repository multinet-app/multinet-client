<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex>
          <v-select
            v-model="networkEdgeTable"
            dense
            :items="edgeTables"
            label="Choose edge table"
            outlined
          />
        </v-flex>
      </v-layout>

      <v-layout wrap>
        <v-flex>
          <v-text-field
            v-model="newNetwork"
            dense
            :error-messages="networkCreationErrors"
            label="Network name"
            outlined
          />
        </v-flex>
      </v-layout>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-spacer />
      <v-btn
        depressed
        :disabled="networkCreateDisabled"
        @click="createNetwork"
      >
        create network
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import api from '@/api';

export default Vue.extend({
  name: 'NetworkCreateForm',
  props: {
    edgeTables: {
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
      networkCreationErrors: [] as string[],
      networkEdgeTable: null as string | null,
      newNetwork: '',
    };
  },
  computed: {
    networkCreateDisabled(): boolean {
      return !this.networkEdgeTable || !this.newNetwork;
    },
  },
  methods: {
    async createNetwork() {
      const { workspace, newNetwork } = this;

      if (this.networkEdgeTable === null) {
        throw new Error('this.networkEdgeTable must not be null');
      }

      try {
        await api.createNetwork(workspace, newNetwork, {
          edgeTable: this.networkEdgeTable,
        });
        this.networkCreationErrors = [];
        this.$emit('success');
      } catch (error) {
        const message = `Network "${this.newNetwork}" already exists.`;
        this.networkCreationErrors = [message];
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
