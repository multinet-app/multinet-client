<template>
  <v-card>
    <v-sheet width="10vw">
      <v-file-input
        v-model="files"
        multiple
        label="CSV Files"
        accept="text/csv"
      />
    </v-sheet>

    <!-- Data tables -->
    <template v-if="fileSamples.length">
      <v-row
        v-for="(samples, i) in chunkedFileSamples"
        :key="`${i*2}-${(i*2)+1}`"
        no-gutters
      >
        <v-col
          v-for="sample in samples"
          :key="sample.name"
          cols="6"
        >
          <span>{{ sample.name }}</span>
          <v-data-table
            class="upload-preview"
            hide-default-footer
            hide-default-header
            :headers="sample.headers"
            :items="sample.rows"
            disable-sort
          >
            <template v-slot:header="{ props: { headers } }">
              <thead dark>
                <tr>
                  <th
                    v-for="header in headers"
                    :key="header.text"
                    class="pt-2 pb-4"
                  >
                    {{ header.text }}
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                        >
                          link
                        </v-icon>
                      </template>
                      <v-list>
                        <v-list-item>
                          Choose source
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </th>
                </tr>
              </thead>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watchEffect,
} from '@vue/composition-api';
import { chunk } from 'lodash';
import Papa from 'papaparse';
import { DataTableHeader } from 'vuetify';

type CSVRow = {[key: string]: string};
interface CSVPreview {
  name: string;
  headers: DataTableHeader[];
  rows: CSVRow[];
}

export default defineComponent({
  setup() {
    const files = ref<File[]>([]);
    const fileSamples = ref<CSVPreview[]>([]);
    watchEffect(async () => {
      const samplesPromise = await Promise.all(files.value.map(async (file) => (
        new Promise((resolve) => {
          Papa.parse(file, {
            preview: 5,
            header: true,
            complete: (result) => {
              resolve({
                name: file.name,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                headers: result.meta.fields!.map((field) => ({ text: field, value: field })),
                rows: result.data as CSVRow[],
              });
            },
          });
        })
      )));

      fileSamples.value = (await samplesPromise) as CSVPreview[];
    });

    // Chunk samples to allow for row rendering
    const chunkedFileSamples = computed(() => chunk(fileSamples.value, 2));

    return {
      files,
      fileSamples,
      chunkedFileSamples,
    };
  },
});
</script>
<style scoped>
.upload-preview table th {
  background-color: #1976d2 !important;
  color: #fff !important;
}
</style>
