<template>
  <v-dialog
    v-model="networkDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-network"
        color="blue darken-2"
        icon
        medium
        :disabled="!editable"
        v-on="on"
      >
        <v-icon dark>
          add_circle
        </v-icon>
      </v-btn>
    </template>
    <v-card>
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
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import NetworkCreateForm from '@/components/NetworkCreateForm.vue';
import NetworkUploadForm from '@/components/NetworkUploadForm.vue';
import store from '@/store';
import { RoleLevel } from '@/utils/permissions';

export default Vue.extend({
  name: 'NetworkDialog',
  components: {
    NetworkCreateForm,
    NetworkUploadForm,
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
    };
  },
  computed: {
    editable(): boolean {
      return store.getters.permissionLevel >= RoleLevel.writer;
    },
  },
  methods: {
    networkDialogSuccess() {
      this.networkDialog = false;
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
