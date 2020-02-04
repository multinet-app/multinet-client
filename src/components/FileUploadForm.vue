<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex>
          <v-text-field
            id="table-name"
            autofocus
            filled
            v-model="newTable"
            :label="namePlaceholder"
            :error-messages="tableCreationError"
          />
        </v-flex>
      </v-layout>
      <v-layout wrap>
        <v-flex
          class="pr-2"
        >
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
    workspace: {
      type: String,
      required: true,
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
    types: {
      type: Object as PropType<FileTypeTable>,
      required: true,
    },
  },

  data() {
    return {
      tableCreationError: null as string | null,
      fileUploadError: null as string | null,
      selectedType: null as string | null,
      file: null as File | null,
      newTable: '',
    };
  },

  computed: {
    createDisabled(): boolean {
      return !this.file || !this.selectedType || !this.newTable;
    },
  },

  methods: {
    handleFileInput(file: File) {
      this.file = file;
      const fileType = this.fileType(file);

      if (fileType) {
        this.selectedType = fileType;
        this.fileUploadError = null;
      } else {
        this.fileUploadError = 'Invalid file type';
      }
    },

    async createTable() {
      try {
        if (this.file === null) {
          throw new Error('this.file must not be null');
        }

        await api.uploadTable(this.workspace, this.newTable, {
          type: this.selectedType as UploadType,
          data: this.file,
        });

        this.tableCreationError = null;
        this.$emit('success');
      } catch (err) {
        this.tableCreationError = err.response.data.message;
      }
    },

    fileType(file: File): string | null {
      if (!file) {
        return null;
      }

      const fileName = file.name.split('.');
      const extension = fileName[fileName.length - 1];

      for (const type in this.types) {
        if (this.types[type].extension.includes(extension) && validUploadType(type)) {
          return type;
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
