<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-layout wrap>
        <v-flex>
          <v-file-input
            id="file-selector"
            clearable
            dense
            :error-messages="fileUploadError"
            :label="fileInputPlaceholder"
            outlined
            prepend-icon=""
            prepend-inner-icon="attach_file"
            single-line
            @change="handleFileInput"
          />
        </v-flex>
        <v-flex
          v-if="fileTypeSelector"
          xs6
          class="pl-2"
        >
          <v-select
            v-if="types.length"
            id="file-type"
            v-model="selectedType"
            class="file-type"
            dense
            :hint="selectedType ? selectedType.hint : null"
            :items="types"
            item-text="displayName"
            item-value="displayName"
            label="File type"
            outlined
            persistent-hint
            return-object
          />
        </v-flex>
      </v-layout>
      <v-layout wrap>
        <v-flex>
          <v-text-field
            id="table-name"
            v-model="fileName"
            dense
            :error-messages="tableCreationError"
            :label="namePlaceholder"
            outlined
          />
        </v-flex>
      </v-layout>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-spacer />
      <v-btn
        id="create-table"
        :disabled="createDisabled"
        @click="createTable"
      >
        {{ createButtonText }}
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
        !this.file
        || !this.fileName
        || !this.selectedType
        || !!this.fileUploadError
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

      if (selectedType === null) {
        throw new Error('`selectedType` is null, which is impossible');
      }

      try {
        await api.uploadTable(workspace, fileName, {
          type: selectedType.queryCall as UploadType,
          data: file,
        });

        this.tableCreationError = null;
        this.$emit('success');
      } catch (err) {
        if (err.status === 409) {
          this.tableCreationError = `Table "${fileName}" already exists`;
        } else if (err.status === 415) {
          this.tableCreationError = 'Data could not be read as CSV';
        } else {
          this.tableCreationError = 'Unknown error; please see developer console for details';
          throw err;
        }
      }
    },

    fileInfo(file: File): [string, FileType] | null {
      if (!file) {
        return null;
      }

      const [fileName, ...extensions] = file.name.split('.');
      const extension = extensions[extensions.length - 1];

      const found = this.types.find((type) => type.extension.includes(extension) && validUploadType(type.queryCall));

      return found === undefined ? null : [fileName, found];
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
