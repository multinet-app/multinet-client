<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex class="pr-2">
          <v-file-input
            id="file-selector"
            clearable
            filled
            :label="fileInputPlaceholder"
            prepend-icon=""
            prepend-inner-icon="attach_file"
            single-line
            @change="handleFileInput"
            :error-messages="fileUploadError"
          />
        </v-flex>
        <v-flex xs6 class="pl-2" v-if="fileTypeSelector">
          <v-select
            id="file-type"
            filled
            label="File type"
            v-if="typeList.length"
            v-model="selectedFileType"
            :items="typeList"
          />
        </v-flex>
      </v-layout>
      <v-layout wrap>
        <v-flex>
          <v-text-field
            id="table-name"
            filled
            v-model="selectedFileName"
            :label="namePlaceholder"
            :error-messages="tableCreationError"
          />
        </v-flex>
      </v-layout>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="px-4 py-3">
      <v-spacer></v-spacer>
      <v-btn id="create-table" :disabled="createDisabled" @click="createTable">
        {{createButtonText}}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { UploadType, validUploadType } from 'multinet';
import Vue, { PropType } from 'vue';

import api from '@/api';
import { FileTypeTable } from '@/types';


export default Vue.extend({
  name: 'FileUploadForm',

  props: {
    fileTypeSelector: {
      type: Boolean,
      default: false,
      required: false,
    },
    namePlaceholder: {
      type: String,
      default: 'Table name',
      required: false,
    },
    fileInputPlaceholder: {
      type: String,
      default: 'Upload file',
      required: false,
    },
    createButtonText: {
      type: String,
      default: 'Create',
      required: false,
    },
    workspace: {
      type: String,
      required: true,
    },
    types: {
      type: Object as PropType<FileTypeTable>,
      required: true,
    },
  },

  data() {
    return {
      tableCreationError: null as string | null,
      fileUploadError: null as string | null,
      selectedFileName: null as string | null,
      selectedFileType: null as string | null,
      file: null as File | null,
    };
  },

  computed: {
    typeList(): string[] {
      return Object.keys(this.types);
    },
    createDisabled(): boolean {
      return (
        !this.file ||
        !this.selectedFileName ||
        !this.selectedFileType ||
        !!this.fileUploadError
      );
    },
  },

  methods: {
    handleFileInput(file: File) {
      this.file = file;

      if (!file) {
        this.selectedFileName = null;
        this.selectedFileType = null;
        this.fileUploadError = null;
        return;
      }

      const fileInfo = this.fileInfo(file);
      if (fileInfo !== null) {
        [this.selectedFileName, this.selectedFileType] = fileInfo;
        this.fileUploadError = null;
      } else {
        this.fileUploadError = 'Invalid file type';
      }
    },

    async createTable() {
      if (this.file === null || this.selectedFileName === null) {
        throw new Error('Valid file must be selected.');
      }

      try {
        await api.uploadTable(this.workspace, this.selectedFileName, {
          type: this.selectedFileType as UploadType,
          data: this.file,
        });

        this.tableCreationError = null;
        this.$emit('success');
      } catch (err) {
        this.tableCreationError = err.response.data.message;
      }
    },

    fileInfo(file: File): [string, string] | null {
      if (!file) {
        return null;
      }

      const [fileName, ...extensions] = file.name.split('.');
      const extension = extensions[extensions.length - 1];

      for (const type in this.types) {
        if (this.types[type].extension.includes(extension) && validUploadType(type)) {
          return [fileName, type];
        }
      }
      return null;
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
