<template>
  <v-dialog
    v-model="graphDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        id="add-graph"
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
      <v-card>
        <v-tabs>
          <v-tab>
            Upload
          </v-tab>
          <v-tab>
            Create
          </v-tab>

          <v-tab-item>
            <graph-upload-form
              :workspace="workspace"
              @success="graphDialogSuccess"
            />
          </v-tab-item>

          <v-tab-item>
            <graph-create-form
              :edge-tables="edgeTables"
              :workspace="workspace"
              @success="graphDialogSuccess"
            />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import GraphCreateForm from '@/components/GraphCreateForm.vue';
import GraphUploadForm from '@/components/GraphUploadForm.vue';

export default Vue.extend({
  name: 'GraphDialog',
  components: {
    GraphCreateForm,
    GraphUploadForm,
  },
  props: {
    edgeTables: {
      type: Array as PropType<string[]>,
      required: true,
    },

    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      graphDialog: false,
    };
  },
  computed: {},
  methods: {
    graphDialogSuccess() {
      this.graphDialog = false;
      this.$emit('success');
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
