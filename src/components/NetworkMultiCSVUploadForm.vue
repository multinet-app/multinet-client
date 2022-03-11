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
        v-for="sample in fileSamples"
        :key="sample.name"
        no-gutters
        justify="center"
        class="my-3"
      >
        <v-card
          outlined
          raised
        >
          <v-sheet class="table-title px-2">
            <span>{{ sample.name }}</span>
          </v-sheet>
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
                    <v-menu
                      :close-on-content-click="false"
                      @input="menuOpen = $event"
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                        >
                          link
                        </v-icon>
                      </template>
                      <v-card>
                        <v-card-actions
                          v-if="sourceMenu || targetMenu"
                          class="my-0 py-0"
                        >
                          <v-btn
                            icon
                            @click="closeBothMenus"
                          >
                            <v-icon>
                              arrow_left
                            </v-icon>
                          </v-btn>
                        </v-card-actions>
                        <v-list class="my-0 py-0">
                          <!-- Source/Target listing -->
                          <template v-if="!(sourceMenu || targetMenu)">
                            <v-list-item>
                              <v-card
                                flat
                                @click="sourceMenu = true"
                              >
                                Source
                              </v-card>
                            </v-list-item>
                            <v-list-item>
                              <v-card
                                flat
                                @click="targetMenu = true"
                              >
                                Target
                              </v-card>
                            </v-list-item>
                          </template>

                          <!-- Source Menu-->
                          <template v-else-if="sourceMenu">
                            <v-list-item>
                              source menu
                            </v-list-item>
                          </template>

                          <!-- Target Menu -->
                          <template v-else>
                            <v-list-item>
                              Target menu
                            </v-list-item>
                          </template>
                        </v-list>
                      </v-card>
                    </v-menu>
                  </th>
                </tr>
              </thead>
            </template>
          </v-data-table>
        </v-card>
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

    // Menu state
    const menuOpen = ref(false);
    const sourceMenu = ref(false);
    const targetMenu = ref(false);
    function closeBothMenus() {
      sourceMenu.value = false;
      targetMenu.value = false;
    }

    // Ensure values reset if menu closed
    watchEffect(async () => {
      if (!menuOpen.value) {
        // Delay by a small amount to look natural
        await new Promise((resolve) => setTimeout(resolve, 200));
        closeBothMenus();
      }
    });

    return {
      files,
      fileSamples,
      chunkedFileSamples,

      menuOpen,
      sourceMenu,
      targetMenu,
      closeBothMenus,
    };
  },
});
</script>
<style scoped>
.upload-preview table th, .table-title {
  background-color: #1976d2 !important;
  color: #fff !important;
}
</style>
