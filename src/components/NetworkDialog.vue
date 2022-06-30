<template>
  <div>
    <!-- Multi CSV -->
    <v-dialog v-model="CSVNetworkDialog">
      <template #activator="{ on }">
        <v-btn
          id="add-csv-network"
          color="blue darken-2"
          icon
          medium
          :disabled="!userCanEdit"
          v-on="on"
        >
          <v-icon dark>
            library_add
          </v-icon>
        </v-btn>
      </template>
      <NetworkMultiCSVUploadForm
        :workspace="workspace"
        @success="CSVNetworkDialogSuccess"
      />
    </v-dialog>

    <!-- Normal -->
    <v-dialog
      v-model="networkDialog"
      width="700"
    >
      <template #activator="{ on }">
        <v-btn
          id="add-network"
          color="blue darken-2"
          icon
          medium
          :disabled="!userCanEdit"
          v-on="on"
        >
          <v-icon dark>
            add_circle
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-tabs>
          <v-tab>
            Upload
          </v-tab>
          <v-tab>
            Create
          </v-tab>

          <v-tab-item>
            <network-upload-form
              :workspace="workspace"
              @success="networkDialogSuccess"
            />
          </v-tab-item>

          <v-tab-item>
            <network-create-form
              :edge-tables="edgeTables"
              :workspace="workspace"
              @success="networkDialogSuccess"
            />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import NetworkCreateForm from '@/components/NetworkCreateForm.vue';
import NetworkUploadForm from '@/components/NetworkUploadForm.vue';
import NetworkMultiCSVUploadForm from '@/components/NetworkMultiCSVUploadForm.vue';
import store from '@/store';

export default Vue.extend({
  name: 'NetworkDialog',
  components: {
    NetworkCreateForm,
    NetworkUploadForm,
    NetworkMultiCSVUploadForm,
  },
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
      networkDialog: false,
      CSVNetworkDialog: false,
    };
  },
  computed: {
    userCanEdit(): boolean {
      return store.getters.userCanEdit;
    },
  },
  methods: {
    networkDialogSuccess() {
      this.networkDialog = false;
      this.$emit('success');
    },
    CSVNetworkDialogSuccess() {
      this.CSVNetworkDialog = false;
      this.$emit('success');
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
