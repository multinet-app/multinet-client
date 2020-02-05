<template>
  <v-dialog
    v-model="graphDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-graph"
        class="new-button"
        color="blue darken-2"
        fab
        dark
        medium
        v-on="on"
      >
        <v-icon dark>add</v-icon>
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
              fileTypeSelector
              namePlaceholder="Network name"
              fileInputPlaceholder="Select network file"
              createButtonText="Upload"
              :workspace="workspace"
              :types="uploadFiletypes"
              @success="graphDialogSuccess"
            />
          </v-tab-item>

          <v-tab-item>
            <graph-create-form :edge-tables="edgeTables" :workspace="workspace" @success="graphDialogSuccess"/>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import GraphCreateForm from '@/components/GraphCreateForm.vue';
import FileUploadForm from '@/components/FileUploadForm.vue';

export default Vue.extend({
  name: 'GraphDialog',
  props: {
    edgeTables: Array,
    workspace: String,
  },
  components: {
    GraphCreateForm,
    FileUploadForm,
  },
  data() {
    return {
      graphDialog: false,
      uploadFiletypes: {
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'},
        d3_json: {extension: ['json'], queryCall: 'd3_json'},
        nested_json: {extension: ['json'], queryCall: 'nested_json'},
      },
    };
  },
  computed: {},
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
