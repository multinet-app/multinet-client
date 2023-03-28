<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-row>
        <v-col>
          <v-select
            v-model="networkEdgeTable"
            dense
            :items="edgeTables"
            label="Choose edge table"
            outlined
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="newNetwork"
            dense
            :error-messages="networkCreationErrors"
            label="Network name"
            outlined
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-spacer />
      <v-btn
        depressed
        color="primary"
        :disabled="networkCreateDisabled || loading"
        :loading="loading"
        @click="createNetwork"
      >
        create network
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref, Ref,
} from 'vue';

import api from '@/api';
import { objectNameIsValid } from '@/utils/validation';

export default defineComponent({
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
  setup(props, { emit }) {
    const networkCreationErrors: Ref<string[]> = ref([]);
    const networkEdgeTable: Ref<string | null> = ref(null);
    const newNetwork = ref('');
    const loading = ref(false);

    const networkCreateDisabled = computed(() => !networkEdgeTable.value || !objectNameIsValid(newNetwork.value));

    function clear() {
      networkEdgeTable.value = null;
      newNetwork.value = '';
      loading.value = false;
    }

    async function createNetwork() {
      if (networkEdgeTable.value === null) {
        throw new Error('this.networkEdgeTable must not be null');
      }

      try {
        loading.value = true;
        await api.createNetwork(props.workspace, newNetwork.value, {
          edgeTable: networkEdgeTable.value,
        });
        networkCreationErrors.value = [];
        clear();
        emit('success');
      } catch (error) {
        const message = `Network "${newNetwork.value}" already exists.`;
        networkCreationErrors.value = [message];
      }
    }

    return {
      networkCreationErrors,
      networkEdgeTable,
      newNetwork,
      loading,
      networkCreateDisabled,
      createNetwork,
    };
  },
});
</script>

<style scoped>
.new-button {
  margin: 49px 10px 0 0;
  z-index: 1;
}
</style>
