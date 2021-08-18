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
            label="Select network file"
            outlined
            prepend-icon=""
            prepend-inner-icon="attach_file"
            single-line
            @change="handleFileInput"
          />
        </v-flex>
        <v-flex
          xs6
          class="pl-2"
        >
          <v-select
            v-if="fileTypes.length"
            id="file-type"
            v-model="selectedType"
            class="file-type"
            dense
            :hint="selectedType ? selectedType.hint : null"
            :items="fileTypes"
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
            label="Network name"
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
        @click="createNetwork"
      >
        Upload
      </v-btn>
    </v-card-actions>
    <v-progress-linear
      v-if="uploading"
      :value="uploadProgress"
    />
  </v-card>
</template>

<script lang="ts">
import { NetworkUploadType, validNetworkUploadType } from 'multinet';
import Vue from 'vue';

import api from '@/api';
import { NetworkFileType } from '@/types';

const fileTypes: NetworkFileType[] = [
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
];

export default Vue.extend({
  name: 'NetworkUploadForm',

  props: {
    workspace: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      fileTypes,
      tableCreationError: null as string | null,
      fileUploadError: null as string | null,
      fileName: null as string | null,
      selectedType: null as NetworkFileType | null,
      file: null as File | null,
      uploading: false,
      uploadProgress: null as number | null,
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
    handleUploadProgress(event: { loaded: number; total: number; [key: string]: unknown }) {
      this.uploadProgress = (event.loaded / event.total) * 100;
    },

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

    async createNetwork() {
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

      this.uploading = true;

      try {
        await api.uploadNetwork(workspace, fileName, {
          type: selectedType.queryCall as NetworkUploadType,
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
      } finally {
        this.uploading = false;
        this.uploadProgress = null;
      }
    },

    fileInfo(file: File): [string, NetworkFileType] | null {
      if (!file) {
        return null;
      }

      const [fileName, ...extensions] = file.name.split('.');
      const extension = extensions[extensions.length - 1];

      const found = this.fileTypes.find((type) => type.extension.includes(extension) && validNetworkUploadType(type.queryCall));

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
