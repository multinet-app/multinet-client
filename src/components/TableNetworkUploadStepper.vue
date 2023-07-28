<template>
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          :complete="step > 1"
          step="1"
        >
          Select Data to Upload
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          step="2"
          :complete="step > 2"
          :rules="[() => (!isNetwork && (tableCreationError === null || tableCreationError.length === 0)) || isNetwork]"
        >
          {{ isNetwork ? 'Set Column Types (Nodes)' : 'Set Column Types' }}
          <small>{{ !isNetwork ? tableCreationError : '' }}</small>
        </v-stepper-step>

        <v-divider v-if="isNetwork" />

        <v-stepper-step
          v-if="isNetwork"
          step="3"
          :rules="[() => (tableCreationError === null || tableCreationError.length === 0)]"
        >
          Set Column Types (Edges)
          <small>{{ tableCreationError }}</small>
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card-text>
            <div class="d-flex flex-column mb-8" style="align-items: center;">
              <span class="text-h6 mb-2">Upload Type</span>
              <v-btn-toggle v-model="uploadType">
                <v-btn
                  :color="uploadType === 0 ? 'blue darken-2 white--text' : ''"
                  width="150"
                >
                  Network
                </v-btn>
                <v-btn
                  :color="uploadType === 1 ? 'blue darken-2 white--text' : ''"
                  width="150"
                >
                  Table
                </v-btn>
              </v-btn-toggle>
            </div>
            <v-row>
              <v-col>
                <v-file-input
                  v-model="file"
                  clearable
                  :error-messages="fileUploadError"
                  label="Select a file"
                  outlined
                  prepend-icon=""
                  prepend-inner-icon="mdi-paperclip"
                  :accept="uploadType === 0 ? '.json' : '.json,.csv'"
                  :disabled="uploadType === undefined"
                  :hint="uploadType === undefined ? 'Select an upload type first' : undefined"
                  :persistent-hint="uploadType === undefined"
                  @change="handleFileInput"
                />
              </v-col>
              <v-col
                cols="6"
                class="pl-2"
              >
                <v-select
                  v-if="fileTypes.length"
                  v-model="selectedFileType"
                  :hint="selectedFileType ? selectedFileType.hint : null"
                  :items="fileTypes"
                  item-text="displayName"
                  item-value="displayName"
                  label="File type"
                  outlined
                  persistent-hint
                  return-object
                  readonly
                  append-icon=""
                  style="pointer-events: none;"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="uploadName"
                  :rules="[() => objectNameIsValid(uploadName) || uploadName === null || 'File name must contain only alphanumeric characters or \'-\' or \'_\'. First character must be a letter. Max length 250 characters.']"
                  :label="uploadType === undefined ? 'Name' : (uploadType === 0 ? 'Network name' : 'Table name')"
                  :disabled="uploadType === undefined"
                  outlined
                  @input="tableCreationError = null"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-stepper-content>

        <v-stepper-content v-for="val, idx in Array(isNetwork ? 2 : 1).fill(0)" :key="idx" :step="idx + 2" class="pa-0">
          <v-data-table
            class="upload-preview"
            fixed-header
            :headers="headers[idx]"
            hide-default-header
            :items="sampleRows[idx]"
            height="60vh"
          >
            <template #header="{ props: { headers: innerHeaders } }">
              <thead dark>
                <tr>
                  <th
                    v-for="(header, i) in innerHeaders"
                    :key="i"
                    class="pt-2 pb-4 grey lighten-3"
                  >
                    {{ header.text }}
                    <v-select
                      v-model="columnTypes[idx][header.text]"
                      outlined
                      dense
                      hide-details
                      class="mt-1"
                      :items="multinetTypes"
                    />
                  </th>
                </tr>
              </thead>
            </template>

            <template v-if="fileIsCSV" #footer.prepend>
              <v-row class="mx-0">
                <v-select
                  v-model="delimiter"
                  :items="delimiterOptions"
                  persistent-hint
                  hint="Delimiter"
                  style="max-width: 100px"
                  class="mr-2 pt-1"
                  @change="delimiterQuoteChanged"
                />

                <v-select
                  v-model="quoteChar"
                  :items="quoteCharOptions"
                  persistent-hint
                  hint="Quote Character"
                  style="max-width: 100px"
                  class="pt-1"
                  @change="delimiterQuoteChanged"
                />
              </v-row>
            </template>
          </v-data-table>
        </v-stepper-content>
      </v-stepper-items>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          color="blue darken-2"
          text
          @click="step === 1 ? emit('back') : step -= 1"
        >
          Back
        </v-btn>
        <v-btn
          id="create-table"
          color="primary"
          :disabled="buttonDisabled"
          :loading="uploading"
          @click="(isNetwork && step === 3) || (!isNetwork && step === 2) ? upload() : step += 1"
        >
          {{ (isNetwork && step === 3) || (!isNetwork && step === 2) ? 'Upload' : 'Next' }}
        </v-btn>
      </v-card-actions>

      <v-progress-linear v-if="uploading" indeterminate />
    </v-stepper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { analyzeCSV, guessJSONColumnTypes } from '@/utils/files';

import { objectNameIsValid } from '@/utils/validation';
import api from '@/api';
import type { ColumnType } from 'multinet';
import type { FileType } from '@/types';

const props = defineProps<{
  workspace: string;
}>();

const emit = defineEmits(['success', 'back']);

const fileTypes: FileType[] = [
  {
    displayName: 'Network JSON (ext: .json)',
    hint: 'A JSON format compatible with Multinet Networks',
    extension: 'json',
    type: 'network',
  },
  {
    displayName: 'Table CSV (ext: .csv)',
    hint: 'A CSV table compatible with Multinet',
    extension: 'csv',
    type: 'table',
  },
  {
    displayName: 'Table JSON (ext: .json)',
    hint: 'A JSON table compatible with Multinet Tables',
    extension: 'json',
    type: 'table',
  },
];

const step = ref(1);

const tableCreationError = ref<string | null>(null);
const fileUploadError = ref<string | null>(null);
const uploadName = ref<string | null>(null);
const selectedFileType = ref<FileType | null>(null);
const file = ref<File | null>(null);
const uploading = ref(false);

const uploadType = ref<number | undefined>(undefined);
function resetForm() {
  file.value = null;
  uploadName.value = null;
  selectedFileType.value = null;
  fileUploadError.value = null;
}
const isNetwork = computed(() => uploadType.value === 0);

function fileInfo(fileInput: File): [string, FileType] | null {
  if (!fileInput) {
    return null;
  }

  const [fileNameSplit, ...extensions] = fileInput.name.split('.');
  const extension = extensions[extensions.length - 1];

  const found = fileTypes.find((type) => type.extension.includes(extension) && (isNetwork.value ? type.type === 'network' : type.type === 'table'));

  return found === undefined ? null : [fileNameSplit, found];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sampleRows = ref<Record<string, any>[][]>([]);
const headers = computed(() => sampleRows.value.map((sample) => {
  const keys = Object.keys(sample[0] || {});
  return keys.map((key) => ({
    text: key,
    value: key,
  }));
}));

const delimiter = ref(',');
const delimiterOptions = [{ text: ',', value: ',' }, { text: ';', value: ';' }, { text: '|', value: '|' }, { text: 'tab', value: '\t' }];

const quoteChar = ref('"');
const quoteCharOptions = ['"', '\''];

// Type recommendation
const columnTypes = ref<Record<string, ColumnType>[]>([]);
const multinetTypes: readonly ColumnType[] = ['primary key', 'edge source', 'edge target', 'label', 'boolean', 'category', 'number', 'date'];
const fileIsCSV = computed(() => file.value !== null && file.value.name.substring(file.value.name.length - 4, file.value.name.length) === '.csv');

async function runCSVAnalysis(newFile: File, userDelim?: string, userQuote?: string) {
  const analysis = await analyzeCSV(newFile, userDelim, userQuote);
  columnTypes.value[0] = analysis.columnTypes;

  sampleRows.value = [[...analysis.sampleRows]];
  delimiter.value = analysis.delimiter;
}

async function runJSONAnalysis(newFile: File) {
  // Get the sample rows
  if (isNetwork.value) {
    const jsonData = JSON.parse(await newFile.text());

    // Throw an error if the JSON is not a network
    if (!jsonData.nodes || !(jsonData.edges || jsonData.links)) {
      // TODO: show this error to the user
      throw new Error('Invalid network JSON');
    }

    const nodes = jsonData.nodes.slice(0, 30);
    const edges = (jsonData.edges || jsonData.links).slice(0.30);

    sampleRows.value = [nodes, edges];
    columnTypes.value = [guessJSONColumnTypes(sampleRows.value[0]), guessJSONColumnTypes(sampleRows.value[1])];
  } else {
    sampleRows.value = [(JSON.parse(await newFile.text()) as object[]).slice(0, 30)];
    columnTypes.value = [guessJSONColumnTypes(sampleRows.value[0])];
  }
}

async function handleFileInput() {
  // Handles clearing the file input
  if (!file.value) {
    resetForm();
    return;
  }

  // Reset the table creation issue
  tableCreationError.value = null;

  const fileInfoResult = fileInfo(file.value);
  if (fileInfoResult !== null) {
    const [fileNameResult, selectedTypeResult] = fileInfoResult;
    uploadName.value = fileNameResult;
    selectedFileType.value = selectedTypeResult;
    fileUploadError.value = null;
  } else {
    fileUploadError.value = 'Invalid file type';
    selectedFileType.value = null;
  }

  if (fileIsCSV.value) {
    await runCSVAnalysis(file.value);
  } else {
    await runJSONAnalysis(file.value);
  }
}

const buttonDisabled = computed(() => (
  (step.value === 1
    && (!file.value
      || !objectNameIsValid(uploadName.value)
      || !selectedFileType.value
      || !!fileUploadError.value
    )
  )
  || (step.value === 2
    && (!(Object.entries(columnTypes.value[0]).length > 0)
      || (
        // If we have a network, first table must have a primary key
        !(isNetwork.value && Object.values(columnTypes.value[0]).includes('primary key'))
        && !(
          // If we don't have a network, table may or may not have a primary key.
          // If it's an edge table, must have source and target
          !isNetwork.value
          && (
            Object.values(columnTypes.value[0]).find((type) => type.includes('edge'))
              ? (Object.values(columnTypes.value[0]).includes('edge source')
              && Object.values(columnTypes.value[0]).includes('edge target'))
              : true
          )
        )
      )
    )
  )
  || (step.value === 3
    && (!(Object.entries(columnTypes.value[1]).length > 0)
      || !Object.values(columnTypes.value[1]).includes('edge source')
      || !Object.values(columnTypes.value[1]).includes('edge target')
    )
  )
));

async function delimiterQuoteChanged() {
  // Re-run the analysis with the user-specified delimiter and quote character
  if (file.value !== null) {
    await runCSVAnalysis(file.value, delimiter.value, quoteChar.value);
  }
}

async function upload() {
  tableCreationError.value = null;

  try {
    if (file.value === null || uploadName.value === null || selectedFileType.value === null) {
      return;
    }

    uploading.value = true;

    if (isNetwork.value) {
      api.uploadNetwork(
        props.workspace,
        uploadName.value,
        file.value,
        columnTypes.value[0],
        columnTypes.value[1],
      );
    } else {
      const isEdgeTable = Object.values(columnTypes.value[0]).includes('edge source') && Object.values(columnTypes.value[0]).includes('edge target');
      api.uploadTable(props.workspace, uploadName.value, {
        data: file.value,
        edgeTable: isEdgeTable,
        columnTypes: columnTypes.value[0],
        fileType: fileIsCSV.value ? 'csv' : 'json',
        delimiter: delimiter.value,
        quoteChar: quoteChar.value,
      });
    }

    emit('success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    tableCreationError.value = `${[Object.values(err.response.data).flat()][0]}`;
  } finally {
    uploading.value = false;
  }
}
</script>
