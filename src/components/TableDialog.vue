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
import Vue, { PropType } from 'vue';

import api from '@/api';
import { FileType, CSVColumnType } from '@/types';
import { validFileType, fileName as getFileName, csvFileTypeRecommendations } from '@/utils/files';

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
      columnType: {} as { [key: string]: CSVColumnType },
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

    multinetTypes(): CSVColumnType[] {
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
    async handleFileInput(this: any, file: File | undefined) {
      this.file = file || null;

      if (!file) {
        this.fileUploadError = null;
        this.columnType = {};
        return;
      }

      if (!validFileType(file, this.types)) {
        this.fileUploadError = 'Invalid file type';
      } else {
        this.fileName = this.fileName || getFileName(file);
        this.fileUploadError = null;
      }

      const typeRecs = await csvFileTypeRecommendations(file);
      this.columnType = Array.from(typeRecs.keys()).reduce(
        (acc, key) => ({ ...acc, [key]: typeRecs.get(key) }), {},
      );
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
