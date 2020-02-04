<template>
  <v-dialog
    v-model="tableDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-table"
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
      <v-card-title
        class="headline pb-0 pt-3"
        primary-title
      >
        Create Table
      </v-card-title>
      <file-upload-form :types="types" :workspace="workspace" @success="uploadSuccess" />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import { FileTypeTable } from '@/types';
import FileUploadForm from '@/components/FileUploadForm.vue';


export default Vue.extend({
  name: 'TableDialog',

  props: {
    workspace: String,
  },
  components: {
    FileUploadForm,
  },
  data() {
    return {
      tableDialog: false,
      types: {
        csv: {extension: ['csv'], queryCall: 'csv'},
      } as FileTypeTable,
    };
  },
  computed: {},
  methods: {
    uploadSuccess() {
      this.tableDialog = false;
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
