<template>
  <v-dialog
    v-model="dialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="workspace-btn ma-0 pa-4"
        block
        color="blue-grey darken-3"
        dark
        depressed
        large
        v-on="on"
      >
        New Workspace
        <v-spacer />
        <v-icon right dark>add_circle</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline pb-0 pt-3"
        primary-title
      >
        Create Workspace
      </v-card-title>

      <v-card-text class="px-4 pt-4 pb-1">
        <v-text-field
          box
          label="Workspace name"
          v-model="newWorkspace"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-4 py-3">
        <v-spacer></v-spacer>
        <v-btn
          color="blue-grey darken-3"
          dark
          depressed
          @click="create"
        >
          Create Workspace
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      dialog: false
    }
  },
  methods: {
    async create () {
      if (this.newWorkspace) {
        const response = await api().post('multinet/graphql', {query: `mutation {
          workspace (name: "${this.newWorkspace}" )
        }`});

        if (response.data.data) {
          this.$router.push(`/workspaces/${this.newWorkspace}`);
          this.dialog = false;
        }
      }
    },
  }
}
</script>
