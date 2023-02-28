<template>
  <v-dialog
    v-model="tableDialog"
    :width="dialogWidth"
  >
    <template #activator="{ on }">
      <v-btn
        id="add-table"
        color="blue darken-2"
        icon
        medium
        :disabled="!userCanEdit"
        v-on="on"
      >
        <v-icon dark>
          mdi-plus-circle
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
          :rules="[() => tableCreationError === null]"
        >
          Set Column Types
          <small>{{ tableCreationError }}</small>
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card>
              <v-card-text class="px-4 pt-4 pb-1">
                <v-row>
                  <v-col>
                    <v-file-input
                      v-model="selectedFile"
                      label="Upload File"
                      prepend-inner-icon="mdi-paperclip"
                      prepend-icon=""
                      single-line
                      clearable
                      dense
                      outlined
                      show-size
                      accept=".csv,.json"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="fileName"
                      label="Table Name"
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <!-- TODO: Fix after https://github.com/multinet-app/multinetjs/issues/46 -->
                <!-- <v-row no-gutters>
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
                </v-row> -->
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
            <template #header="{ props: { headers: innerHeaders } }">
              <thead dark>
                <tr>
                  <th
                    v-for="(header, i) in innerHeaders"
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
            <v-select
              v-model="delimiter"
              :items="delimiterOptions"
              persistent-hint
              hint="Delimiter"
              style="max-width: 100px"
              class="mr-2"
              :disabled="!fileIsCSV"
              @change="delimiterQuoteChanged"
            />

            <v-select
              v-model="quoteChar"
              :items="quoteCharOptions"
              persistent-hint
              hint="Quote Character"
              style="max-width: 100px"
              :disabled="!fileIsCSV"
              @change="delimiterQuoteChanged"
            />

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
              :loading="loading"
              :disabled="loading"
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
  defineComponent, ref, Ref, computed, watch,
} from 'vue';

import api from '@/api';
import { CSVColumnType } from '@/types';
import { analyzeCSV, guessJSONColumnTypes } from '@/utils/files';
import store from '@/store';

const defaultKeyField = '_key';
const multinetTypes: readonly CSVColumnType[] = ['label', 'boolean', 'category', 'number', 'date'];

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sampleRows: Ref<Array<Record<string, any>>> = ref([]);
    const headers = computed(() => {
      const keys = Object.keys(sampleRows.value[0] || {});
      return keys.map((key) => ({
        text: key,
        value: key,
      }));
    });

    const delimiter = ref('');
    const delimiterOptions = [{ text: ',', value: ',' }, { text: ';', value: ';' }, { text: '|', value: '|' }, { text: 'tab', value: '\t' }];

    const quoteChar = ref('"');
    const quoteCharOptions = ['"', '\''];

    const edgeTable = computed(() => {
      const sample = sampleRows.value[0] || {};
      const hasFrom = Object.prototype.hasOwnProperty.call(sample, '_from');
      const hasTo = Object.prototype.hasOwnProperty.call(sample, '_to');
      return hasFrom && hasTo;
    });

    // Type recommendation
    const columnType: Ref<{[key: string]: CSVColumnType}> = ref({});

    async function runCSVAnalysis(newFile: File, userDelim?: string, userQuote?: string) {
      const analysis = await analyzeCSV(newFile, userDelim, userQuote);
      columnType.value = Array.from(analysis.typeRecs.keys()).reduce((acc, key) => ({ ...acc, [key]: analysis.typeRecs.get(key) }), {});

      sampleRows.value = [...analysis.sampleRows];
      delimiter.value = analysis.delimiter;
    }

    async function runJSONAnalysis(newFile: File) {
      // Get the sample rows
      sampleRows.value = (JSON.parse(await newFile.text()) as object[]).slice(0, 30);
      columnType.value = guessJSONColumnTypes(sampleRows.value);
    }

    const tableCreationError = ref<string | null>(null);

    // File selection
    const selectedFile = ref<File | null>(null);
    const fileIsCSV = computed(() => selectedFile.value !== null && selectedFile.value.name.substring(selectedFile.value.name.length - 4, selectedFile.value.name.length) === '.csv');
    const fileName = ref<string | null>(null);
    watch(selectedFile, async (newFile) => {
      tableCreationError.value = null;

      if (newFile === null) {
        fileName.value = null;
        columnType.value = {};

        return;
      }

      const newName = newFile.name;

      if (fileIsCSV.value) {
        fileName.value = newName.replace('.csv', '');
        await runCSVAnalysis(newFile);
      }

      if (newName.substring(newName.length - 5, newName.length) === '.json') {
        fileName.value = newName.replace('.json', '');
        await runJSONAnalysis(newFile);
      }
    });

    async function delimiterQuoteChanged() {
      // Re-run the analysis with the user-specified delimiter and quote character
      if (selectedFile.value !== null) {
        await runCSVAnalysis(selectedFile.value, delimiter.value, quoteChar.value);
      }
    }

    // Upload options
    const overwrite = ref(false);
    const keyField = ref<string>(defaultKeyField);
    const restoreKeyField = () => { keyField.value = defaultKeyField; };

    // Upload state
    const uploading = ref(false);
    const uploadProgress = ref<number | null>(null);
    // function handleUploadProgress(evt: { loaded: number; total: number; [key: string]: unknown }) {
    //   uploadProgress.value = (evt.loaded / evt.total) * 100;
    // }

    // Reset component
    function resetAllFields() {
      step.value = 1;
      columnType.value = {};

      selectedFile.value = null;
      fileName.value = null;

      overwrite.value = false;
      restoreKeyField();

      uploading.value = false;
      uploadProgress.value = null;
    }

    // Table creation state
    const tableDialog = ref(false);
    const createDisabled = computed(() => selectedFile.value === null || !fileName.value);
    const loading = ref(false);
    async function createTable() {
      if (selectedFile.value === null || fileName.value === null) {
        return;
      }

      const { workspace } = props;
      uploading.value = true;

      try {
        loading.value = true;
        await api.uploadTable(workspace, fileName.value, {
          data: selectedFile.value,
          edgeTable: edgeTable.value,
          columnTypes: columnType.value,
          fileType: fileIsCSV.value ? 'csv' : 'json',
          delimiter: delimiter.value,
          quoteChar: quoteChar.value,
        });

        tableCreationError.value = null;
        tableDialog.value = false;
        loading.value = false;

        emit('success');
        resetAllFields();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        tableCreationError.value = `${Object.values(err.response.data).flat()[0]}`;
      } finally {
        uploading.value = false;
        uploadProgress.value = null;
      }
    }

    const userCanEdit = computed(() => store.getters.userCanEdit);

    return {
      step,
      dialogWidth,
      headers,
      sampleRows,
      delimiter,
      delimiterOptions,
      quoteChar,
      quoteCharOptions,
      delimiterQuoteChanged,
      columnType,
      multinetTypes,
      selectedFile,
      fileName,
      tableDialog,
      tableCreationError,
      uploading,
      uploadProgress,
      createDisabled,
      loading,
      createTable,
      restoreKeyField,
      keyField,
      overwrite,
      userCanEdit,
      fileIsCSV,
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
