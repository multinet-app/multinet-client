<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex class="pr-2">
          <v-file-input
            @change="handleFileInput"
            clearable
            dense
            :error-messages="fileUploadError"
            id="file-selector"
            :label="fileInputPlaceholder"
            outlined
            prepend-icon=""
            prepend-inner-icon="attach_file"
            single-line
          />
        </v-flex>
        <v-flex xs6 class="pl-2" v-if="fileTypeSelector">
          <v-select
            class="file-type"
            dense
            :hint="selectedType ? selectedType.hint : null"
            id="file-type"
            :items="types"
            item-text="displayName"
            item-value="displayName"
            label="File type"
            outlined
            persistent-hint
            return-object
            v-if="types.length"
            v-model="selectedType"
          />
        </v-flex>
      </v-layout>
      <v-layout wrap>
        <v-flex>
          <v-text-field
            dense
            :error-messages="tableCreationError"
            id="table-name"
            :label="namePlaceholder"
            outlined
            v-model="fileName"
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
import { FileType } from '@/types';


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
      type: Array as PropType<FileType[]>,
      required: true,
    },
  },

  data() {
    return {
      tableCreationError: null as string | null,
      fileUploadError: null as string | null,
      fileName: null as string | null,
      selectedType: null as FileType | null,
      file: null as File | null,
    };
  },

  computed: {
    createDisabled(): boolean {
      return (
        !this.file ||
        !this.fileName ||
        !this.selectedType ||
        !!this.fileUploadError
      );
    },
  },

  methods: {
    handleFileInput(file: File) {
      this.file = file;

      if (!file) {
        this.selectedType = null;
        this.fileUploadError = null;
        return;
      }

      const fileInfo = this.fileInfo(file);
      if (fileInfo !== null) {
        const [fileName, selectedType] = fileInfo;
        this.fileName = this.fileName || fileName;
        this.selectedType = selectedType;
        this.fileUploadError = null;
      } else {
        this.fileUploadError = 'Invalid file type';
        this.selectedType = null;
      }
    },

    async createTable() {
      const {
        file,
        workspace,
        fileName,
        selectedType,
      } = this;

      if (file === null || fileName === null) {
        throw new Error('Valid file must be selected.');
      }

      try {
        await api.uploadTable(workspace, fileName, {
          type: selectedType!.queryCall as UploadType,
          data: file,
        });

        this.tableCreationError = null;
        this.$emit('success');
      } catch (err) {
        this.tableCreationError = err.response.data.message;
      }
    },

    fileInfo(file: File): [string, FileType] | null {
      if (!file) {
        return null;
      }

      const [fileName, ...extensions] = file.name.split('.');
      const extension = extensions[extensions.length - 1];

      for (const type of this.types) {
        if (type.extension.includes(extension) && validUploadType(type.queryCall)) {
          return [fileName, type];
        }
      }
      return null;
    },
  },
});
</script>

<style>
/* These styles make it so that the text-field details for file type
   don't nudge the network name field down if it goes to multiple lines. */
.file-type .v-text-field__details {
  min-height: 36px;
}
</style>

<style scoped>
.new-button {
  margin: 49px 10px 0 0;
  z-index: 1;
}
</style>