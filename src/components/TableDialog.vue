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
              cols="2"
            >
              <v-select
                v-model="columnType[field]"
                outlined
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
import Vue, { PropType } from 'vue';
import Papa, { ParseResult } from 'papaparse';
import dayjs from 'dayjs';

import api from '@/api';
import { FileType } from '@/types';
import { validFileType, fileName as getFileName } from '@/utils/files';

type MultinetType = 'label' | 'category' | 'number' | 'date';

const defaultKeyField = '_key';
export default Vue.extend({
  name: 'TableDialog',

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      tableDialog: false,
      types: [
        {
          extension: ['csv'],
          queryCall: 'csv',
          hint: 'Comma Separated Value file',
          displayName: 'CSV',
        },
      ] as FileType[],
      file: null as File | null,
      fileName: null as string | null,
      fileUploadError: null as string | null,
      tableCreationError: null as string | null,
      key: defaultKeyField,
      overwrite: false,
      columnType: {} as { [key: string]: MultinetType },
      uploading: false,
      uploadProgress: null as number | null,
    };
  },
  computed: {
    createDisabled(): boolean {
      return (
        !this.file
        || !this.fileName
        || !!this.fileUploadError
      );
    },

    multinetTypes(): MultinetType[] {
      return [
        'label',
        'category',
        'number',
        'date',
      ];
    },
  },

  methods: {
    restoreKeyField() {
      this.key = defaultKeyField;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleFileInput(this: any, file: File) {
      this.file = file;

      if (!file) {
        this.fileUploadError = null;
      } else if (!validFileType(file, this.types)) {
        this.fileUploadError = 'Invalid file type';
      } else {
        this.fileName = this.fileName || getFileName(file);
        this.fileUploadError = null;
      }

      interface TypeScore {
        strings: Set<string>;
        number: number;
        date: number;
        total: number;
      }
      const columnTypes = new Map<string, TypeScore>();

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step(row: ParseResult<{}>) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = row.data as { [key: string]: any };

          Object.keys(data).forEach((key: string) => {
            if (!columnTypes.has(key)) {
              columnTypes.set(key, {
                strings: new Set<string>(),
                number: 0,
                date: 0,
                total: 0,
              });
            }

            const entry = columnTypes.get(key);
            if (entry === undefined) {
              throw new Error('impossible');
            }

            // Pass the value through a gauntlet of heuristics to see what types
            // it can convert to.
            const value = data[key];
            entry.total += 1;

            // Test for categoriness by counting up all the unique strings in
            // the column.
            entry.strings.add(value);

            // See if the value can be converted to a number. Empty strings
            // convert to 0, so those are excluded specifically.
            if (value !== '' && !Number.isNaN(Number(value))) {
              entry.number += 1;
            }

            // See if the value looks like a date.
            if (dayjs(value).isValid()) {
              entry.date += 1;
            }
          });
        },

        complete: () => {
          const typeRecs = new Map<string, MultinetType>();

          columnTypes.forEach((entry, field) => {
            const isKey = field === '_key' || field === '_from' || field === '_to';
            const category = entry.strings.size <= 10;
            const number = entry.number === entry.total;
            const date = entry.date === entry.total;

            let rec: MultinetType = 'label';
            if (isKey) {
              rec = 'label';
            } else if (category && !number && !date) {
              rec = 'category';
            } else if (number) {
              rec = 'number';
            } else if (date) {
              rec = 'date';
            }

            typeRecs.set(field, rec);
          });

          this.columnType = {};
          typeRecs.forEach((type, field) => {
            this.$set(this.columnType, field, type);
          });
        },
      });
    },

    handleUploadProgress(evt: { loaded: number; total: number; [key: string]: unknown }) {
      this.uploadProgress = (evt.loaded / evt.total) * 100;
    },

    async createTable() {
      const {
        file,
        workspace,
        fileName,
        key,
        overwrite,
      } = this;

      if (file === null || fileName === null) {
        return;
      }

      this.uploading = true;

      try {
        await api.uploadTable(workspace, fileName, {
          type: 'csv',
          data: file,
          key,
          overwrite,
        }, {
          onUploadProgress: this.handleUploadProgress,
        });

        this.tableCreationError = null;
        this.tableDialog = false;
        this.$emit('success');
      } catch (err) {
        this.tableCreationError = err.statusText;
      } finally {
        this.uploading = false;
        this.uploadProgress = null;
      }
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
