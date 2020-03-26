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
      <file-upload-form
        :types="types"
        :workspace="workspace"
        @success="uploadSuccess"
      >
        <template v-slot:default="{ uploadParams }">
          <v-row no-gutters>
            <v-col cols="4">
              <v-text-field
                v-model="uploadParams.key"
                dense
                label="Key"
                outlined
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <v-switch
                v-model="uploadParams.overwrite"
                class="mt-1 ml-2"
                dense
                label="Overwrite _key field"
                outlined
              />
            </v-col>
          </v-row>
        </template>
      </file-upload-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import { FileType } from '@/types';
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
      types: [
        {
          extension: ['csv'],
          queryCall: 'csv',
          hint: 'Comma Separated Value file',
          displayName: 'CSV',
        },
      ] as FileType[],
    };
  },
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
