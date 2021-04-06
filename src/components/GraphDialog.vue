<template>
  <v-dialog
    v-model="graphDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-graph"
        color="blue darken-2"
        icon
        medium
        :disabled="!hasPerms"
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
            <file-upload-form
              file-type-selector
              name-placeholder="Network name"
              file-input-placeholder="Select network file"
              create-button-text="Upload"
              :workspace="workspace"
              :types="uploadFiletypes"
              @success="graphDialogSuccess"
            />
          </v-tab-item>

          <v-tab-item>
            <graph-create-form
              :edge-tables="edgeTables"
              :workspace="workspace"
              @success="graphDialogSuccess"
            />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import GraphCreateForm from '@/components/GraphCreateForm.vue';
import FileUploadForm from '@/components/FileUploadForm.vue';
import api from '@/api';
import { WorkspacePermissionsSpec } from 'multinet';
import { canUpload } from '@/utils/permissions';
import store from '@/store';

export default Vue.extend({
  name: 'GraphDialog',
  components: {
    GraphCreateForm,
    FileUploadForm,
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
      graphDialog: false,
      uploadFiletypes: [
        {
          displayName: 'D3 JSON (ext: .json)',
          hint: 'JSON format compatible with d3-force',
          queryCall: 'd3_json',
          extension: ['json'],
        },
        {
          displayName: 'Arbor Nested Tree (ext: .json)',
          hint: 'JSON-encoded tree format used by the Arbor project',
          queryCall: 'nested_json',
          extension: ['json'],
        },
        {
          displayName: 'Newick Tree (ext: .phy, .tree)',
          hint: 'The Newick Standard for representing trees in computer-readable form',
          queryCall: 'newick',
          extension: ['phy', 'tree'],
        },
      ],
    };
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasPerms(this: any) {
      return canUpload(store.state.userInfo, this.permissions);
    },
  },
  asyncComputed: {
    permissions: {
      async get(): Promise<WorkspacePermissionsSpec | null> {
        try {
          return api.getWorkspacePermissions(this.workspace);
        } catch (error) {
          return null;
        }
      },
      default: null,
    },
  },
  methods: {
    graphDialogSuccess() {
      this.graphDialog = false;
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
