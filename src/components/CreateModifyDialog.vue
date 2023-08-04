<template>
  <v-dialog v-model="dialog">
    <template #activator="{ on }">
      <v-btn
        id="add-csv-network"
        color="blue darken-2"
        dark
        :disabled="!userCanEdit"
        v-on="on"
      >
        Upload or Create
      </v-btn>
    </template>
    <v-card v-if="dialogStep === 0">
      <div class="d-flex flex-column pa-8" style="align-items: center;">
        <v-btn-toggle
          v-model="firstChosen"
          class="my-4"
          @change="dialogStep += 1"
        >
          <v-btn :color="firstChosen === 0 ? 'blue darken-2 white--text' : ''" width="500" height="400">
            <div class="pa-4 text-center d-flex flex-column justify-center text-body-2">
              <span class="text-h6">Create Network</span>
              <br />
              from existing tables
            </div>
          </v-btn>
          <v-btn :color="firstChosen === 1 ? 'blue darken-2 white--text' : ''" width="500" height="400">
            <div class="pa-4 text-center d-flex flex-column justify-center text-body-2">
              <span class="text-h6">Upload File</span>
              <br />
              to create a network or table
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card>
    <v-card v-else-if="dialogStep === 1">
      <NetworkCreationTool
        v-if="firstChosen === 0"
        :workspace="workspace"
        @success="dialog = false"
        @back="firstChosen = undefined; dialogStep -= 1"
      />
      <TableNetworkUploadStepper
        v-else-if="firstChosen === 1"
        :workspace="props.workspace"
        @success="dialog = false"
        @back="firstChosen = undefined; dialogStep -= 1"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import store from '@/store';
import { computed, ref, watch } from 'vue';
import NetworkCreationTool from './NetworkCreationTool.vue';
import TableNetworkUploadStepper from './TableNetworkUploadStepper.vue';

const props = defineProps<{
  workspace: string;
}>();

const userCanEdit = computed(() => store.getters.userCanEdit);

const dialog = ref(false);
const dialogStep = ref(0);

// First step vars
const firstChosen = ref<number | undefined>(undefined);

// Handle closing of the dialog
function resetDialog() {
  // Delay the reset so that the dialog can close first
  setTimeout(() => {
    dialogStep.value = 0;
    firstChosen.value = undefined;
  }, 250);
}
watch(dialog, (val) => {
  if (val === false) {
    resetDialog();
  }
});
</script>

<style>
.theme--light.v-btn--active::before {
  opacity: 0;
}
</style>
