<template>
  <v-card>
    <v-card-text class="px-4 pt-4 pb-1">
      <v-row>
        <v-col>
          <v-file-input
            id="file-selector"
            clearable
            dense
            :error-messages="fileUploadError"
            label="Select network file"
            outlined
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            single-line
            @change="handleFileInput"
          />
        </v-col>
        <v-col
          cols="6"
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
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            id="table-name"
            v-model="fileName"
            dense
            :rules="[() => objectNameIsValid(fileName) || 'File name must contain only alphanumeric characters or \'-\' or \'_\'. First character must be a letter. Max length 250 characters.']"
            :error-messages="tableCreationError"
            label="Network name"
            outlined
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-spacer />
      <v-btn
        id="create-table"
        color="primary"
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
import type { NetworkUploadType } from 'multinet';
import { validNetworkUploadType } from 'multinet';
import type { Ref } from 'vue';
import {
  computed, defineComponent, ref,
} from 'vue';

import api from '@/api';
import type { NetworkFileType } from '@/types';
import { objectNameIsValid } from '@/utils/validation';

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

export default defineComponent({
  name: 'NetworkUploadForm',

  props: {
    workspace: {
      type: String,
      required: true,
    },
  },

  setup(props, { emit }) {
    const tableCreationError: Ref<string | null> = ref(null);
    const fileUploadError : Ref<string | null> = ref(null);
    const fileName: Ref<string | null> = ref(null);
    const selectedType: Ref<NetworkFileType | null> = ref(null);
    const file: Ref<File | null> = ref(null);
    const uploading = ref(false);
    const uploadProgress: Ref<number | null> = ref(null);

    const createDisabled = computed(() => (
      !file.value
      || !objectNameIsValid(fileName.value)
      || !selectedType.value
      || !!fileUploadError.value
    ));

    function handleUploadProgress(event: { loaded: number; total: number; [key: string]: unknown }) {
      uploadProgress.value = (event.loaded / event.total) * 100;
    }

    function fileInfo(fileInput: File): [string, NetworkFileType] | null {
      if (!fileInput) {
        return null;
      }

      const [fileNameSplit, ...extensions] = fileInput.name.split('.');
      const extension = extensions[extensions.length - 1];

      const found = fileTypes.find((type) => type.extension.includes(extension) && validNetworkUploadType(type.queryCall));

      return found === undefined ? null : [fileNameSplit, found];
    }

    function handleFileInput(fileInput: File) {
      file.value = fileInput;

      if (!file.value) {
        selectedType.value = null;
        fileUploadError.value = null;
        return;
      }

      const fileInfoResult = fileInfo(file.value);
      if (fileInfoResult !== null) {
        const [fileNameResult, selectedTypeResult] = fileInfoResult;
        fileName.value = fileName.value || fileNameResult;
        selectedType.value = selectedTypeResult;
        fileUploadError.value = null;
      } else {
        fileUploadError.value = 'Invalid file type';
        selectedType.value = null;
      }
    }

    async function createNetwork() {
      if (file.value === null || fileName.value === null) {
        throw new Error('Valid file must be selected.');
      }

      if (selectedType.value === null) {
        throw new Error('`selectedType` is null, which is impossible');
      }

      uploading.value = true;

      try {
        await api.uploadNetwork(props.workspace, fileName.value, {
          type: selectedType.value.queryCall as NetworkUploadType,
          data: file.value,
        });

        tableCreationError.value = null;
        emit('success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.status === 409) {
          tableCreationError.value = `Table "${fileName}" already exists`;
        } else if (err.status === 415) {
          tableCreationError.value = 'Data could not be read as CSV';
        } else {
          tableCreationError.value = 'Unknown error; please see developer console for details';
          throw err;
        }
      } finally {
        uploading.value = false;
        uploadProgress.value = null;
      }
    }

    return {
      fileTypes,
      tableCreationError,
      fileUploadError,
      fileName,
      selectedType,
      file,
      uploading,
      uploadProgress,
      createDisabled,
      handleUploadProgress,
      handleFileInput,
      createNetwork,
      objectNameIsValid,
    };
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
