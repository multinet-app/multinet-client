<template>
  <v-dialog
    v-model="tableDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-table"
        color="blue darken-2"
        icon
        medium
        v-on="on"
      >
        <v-icon dark>
          add_circle
        </v-icon>
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
                :error-messages="fileUploadError"
                label="Upload File"
                prepend-inner-icon="attach_file"
                prepend-icon=""
                single-line
                clearable
                dense
                outlined
                @change="handleFileInput"
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
                label="Key Column"
                append-icon="restore"
                outlined
                dense
                @click:append="restoreKeyField"
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

          <v-row>
            <v-col
              v-for="(type, field) in columnType"
              :key="field"
              cols="3"
            >
              <v-select
                v-model="columnType[field]"
                outlined
                dense
                :label="field"
                :items="multinetTypes"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn
            :disabled="createDisabled"
            @click="createTable"
          >
            Create
          </v-btn>
        </v-card-actions>
        <v-progress-linear
          v-if="uploading"
          :value="uploadProgress"
        />
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent, ref, Ref, computed,
} from '@vue/composition-api';

import api from '@/api';
import { FileType, CSVColumnType } from '@/types';
import { validFileType, fileName as getFileName, csvFileTypeRecommendations } from '@/utils/files';

const defaultKeyField = '_key';
const multinetTypes: readonly CSVColumnType[] = ['label', 'category', 'number', 'date'];
const fileTypes: readonly FileType[] = [
  {
    extension: ['csv'],
    queryCall: 'csv',
    hint: 'Comma Separated Value file',
    displayName: 'CSV',
  },
];

export default defineComponent({
  name: 'TableDialog',
  props: {
    workspace: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    // Type recommendation
    const columnType: Ref<{[key: string]: CSVColumnType}> = ref({});

    // File selection
    const selectedFile = ref<File | null>(null);
    const fileName = ref<string | null>(null);
    const fileUploadError = ref<string | null>(null);
    async function handleFileInput(file: File | undefined) {
      if (file === undefined) {
        fileUploadError.value = null;
        selectedFile.value = null;
        columnType.value = {};

        return;
      }

      selectedFile.value = file;

      if (!validFileType(file, fileTypes)) {
        fileUploadError.value = 'Invalid file type';
      } else {
        fileName.value = fileName.value || getFileName(file);
        fileUploadError.value = null;
      }

      const typeRecs = await csvFileTypeRecommendations(file);
      columnType.value = Array.from(typeRecs.keys()).reduce(
        (acc, key) => ({ ...acc, [key]: typeRecs.get(key) }), {},
      );
    }

    // Upload options
    const overwrite = ref(false);
    const keyField = ref<string>(defaultKeyField);
    const restoreKeyField = () => { keyField.value = defaultKeyField; };

    // Upload state
    const uploading = ref(false);
    const uploadProgress = ref<number | null>(null);
    function handleUploadProgress(evt: { loaded: number; total: number; [key: string]: unknown }) {
      uploadProgress.value = (evt.loaded / evt.total) * 100;
    }

    // Table creation state
    const tableDialog = ref(false);
    const tableCreationError = ref<string | null>(null);
    const createDisabled = computed(() => !selectedFile.value || !fileName.value || fileUploadError.value);
    async function createTable() {
      if (selectedFile.value === null || fileName.value === null) {
        return;
      }

      const { workspace } = props;
      uploading.value = true;

      try {
        await api.uploadTable(workspace, fileName.value, {
          type: 'csv',
          data: selectedFile.value,
          key: keyField.value,
          overwrite: overwrite.value,
        }, {
          onUploadProgress: handleUploadProgress,
        });

        tableCreationError.value = null;
        tableDialog.value = false;

        emit('success');
      } catch (err) {
        tableCreationError.value = err.statusText;
      } finally {
        uploading.value = false;
        uploadProgress.value = null;
      }
    }

    return {
      columnType,
      multinetTypes,
      fileName,
      fileUploadError,
      tableDialog,
      tableCreationError,
      uploading,
      uploadProgress,
      createDisabled,
      handleFileInput,
      createTable,
      restoreKeyField,
      key: keyField,
      overwrite,
    };
  },
});
</script>

<style scoped>
.new-button {
  margin: 49px 10px 0 0;
  z-index: 1;
}
</style>
