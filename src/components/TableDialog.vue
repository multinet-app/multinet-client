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
      <v-card>
        <v-card-text class="px-4 pt-4 pb-1">
          <v-layout wrap>
            <v-flex>
              <v-file-input
                @change="handleFileInput"
                :error-messages="fileUploadError"
                label="Upload File"
                prepend-inner-icon="attach_file"
                prepend-icon=""
                single-line
                clearable
                dense
                outlined
              />
            </v-flex>
          </v-layout>
          <v-layout wrap>
            <v-flex>
              <v-text-field
                v-model="fileName"
                :error-messages="tableCreationError"
                label="Table Name"
                outlined
                dense
              />
            </v-flex>
          </v-layout>
          <v-row no-gutters>
            <v-col cols="4">
              <v-text-field
                v-model="key"
                label="Key"
                hide-details
                outlined
                dense
              />
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="overwrite"
                class="mt-1 ml-2"
                dense
                label="Overwrite Default Key"
                outlined
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn :disabled="createDisabled" @click="createTable">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import { FileType } from '@/types';
import { validFileType, fileName as getFileName } from '@/utils/files';


export default Vue.extend({
  name: 'TableDialog',

  props: {
    workspace: String,
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
      file: null as File | null,
      fileName: null as string | null,
      fileUploadError: null as string | null,
      tableCreationError: null as string | null,
      key: '_key',
      overwrite: false,
    };
  },
  computed: {
    createDisabled(): boolean {
      return (
        !this.file ||
        !this.fileName ||
        !!this.fileUploadError
      );
    },
  },
  methods: {
    handleFileInput(file: File) {
      this.file = file;

      if (!file) {
        this.fileUploadError = null;
      } else if (!validFileType(file, this.types)) {
        this.fileUploadError = 'Invalid file type';
      } else {
        this.fileName = this.fileName || getFileName(file);
        this.fileUploadError = null;
      }
    },
    async createTable() {
      const {
        file,
        workspace,
        fileName,
        key,
        overwrite,
      } = this;

      if (file === null || fileName === null) {
        return;
      }

      try {
        await api.uploadTable(workspace, fileName, {
          type: 'csv',
          data: file,
          key,
          overwrite,
        });

        this.tableCreationError = null;
        this.tableDialog = false;
        this.$emit('success');
      } catch (err) {
        this.tableCreationError = err.statusText;
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
