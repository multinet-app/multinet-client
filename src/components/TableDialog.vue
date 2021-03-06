<template>
  <v-dialog
    v-model="tableDialog"
    :width="dialogWidth"
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

    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          :complete="step > 1"
          step="1"
        >
          Select Dataset
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          :complete="step > 2"
          step="2"
        >
          Set Column Types
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
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
                      v-model="keyField"
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
              </v-card-text>

              <v-divider />

              <v-card-actions class="px-4 py-3">
                <v-spacer />
                <v-btn
                  class="mt-3"
                  :disabled="createDisabled"
                  color="primary"
                  @click="step = 2"
                >
                  Next
                </v-btn>
              </v-card-actions>

              <v-progress-linear
                v-if="uploading"
                :value="uploadProgress"
              />
            </v-card>
          </v-card>
        </v-stepper-content>

        <v-stepper-content
          class="pa-0"
          step="2"
        >
          <v-data-table
            class="upload-preview"
            fixed-header
            :headers="headers"
            hide-default-header
            :items="sampleRows"
            height="65vh"
          >
            <template v-slot:header="{ props: { headers } }">
              <thead dark>
                <tr>
                  <th
                    v-for="(header, i) in headers"
                    :key="i"
                    class="pt-2 pb-4"
                  >
                    {{ header.text }}
                    <v-select
                      v-model="columnType[header.text]"
                      outlined
                      dark
                      dense
                      hide-details
                      :items="multinetTypes"
                    />
                  </th>
                </tr>
              </thead>
            </template>
          </v-data-table>

          <v-footer class="py-3">
            <v-spacer />
            <v-btn
              color="primary"
              text
              @click="step = 1"
            >
              Back
            </v-btn>

            <v-btn
              color="primary"
              depressed
              @click="createTable"
            >
              Create Table
            </v-btn>
          </v-footer>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent, ref, Ref, computed,
} from '@vue/composition-api';

import api from '@/api';
import { FileType, CSVColumnType } from '@/types';
import { validFileType, fileName as getFileName, analyzeCSV } from '@/utils/files';

const defaultKeyField = '_key';
const multinetTypes: readonly CSVColumnType[] = ['label', 'boolean', 'category', 'number', 'date'];
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
    // Stepper control
    const step: Ref<number> = ref(1);
    const dialogWidth = computed(() => {
      if (step.value === 2) {
        return 'unset';
      }
      return '35vw';
    });

    const sampleRows: Ref<Array<{}>> = ref([]);
    const headers = computed(() => {
      const keys = Object.keys(sampleRows.value[0] || {});
      return keys.map((key) => ({
        text: key,
        value: key,
      }));
    });

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

      const analysis = await analyzeCSV(file);
      columnType.value = Array.from(analysis.typeRecs.keys()).reduce(
        (acc, key) => ({ ...acc, [key]: analysis.typeRecs.get(key) }), {},
      );

      sampleRows.value = [...analysis.sampleRows];
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

    // Reset component
    function resetAllFields() {
      step.value = 1;
      columnType.value = {};

      selectedFile.value = null;
      fileName.value = null;
      fileUploadError.value = null;

      overwrite.value = false;
      restoreKeyField();

      uploading.value = false;
      uploadProgress.value = null;
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
          columnTypes: columnType.value,
        }, {
          onUploadProgress: handleUploadProgress,
        });

        tableCreationError.value = null;
        tableDialog.value = false;

        emit('success');
        resetAllFields();
      } catch (err) {
        tableCreationError.value = err.statusText;
      } finally {
        uploading.value = false;
        uploadProgress.value = null;
      }
    }

    return {
      step,
      dialogWidth,
      headers,
      sampleRows,
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
      keyField,
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
.upload-preview table th {
  background-color: #1976d2 !important;
  color: #fff !important;
}
</style>
