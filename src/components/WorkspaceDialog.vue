<template>
  <v-dialog
    class="ws-dialogue"
    v-model="dialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="ws-btn ma-0 px-4 py-5"
        block
        color="grey darken-3"
        dark
        depressed
        large
        v-on="on"
      >
        New Workspace
        <v-spacer />
        <v-icon
          right
          dark
          size="20px"
        >add_circle</v-icon>
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
          filled
          label="Workspace name"
          v-model="newWorkspace"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-4 py-3">
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-3"
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
      dialog: false,
      newWorkspace: '',
    }
  },
  methods: {
    async create () {
      if (this.newWorkspace) {
        const response = await api().post(`/workspaces/${this.newWorkspace}`);

        if (response) {
          this.$router.push(`/workspaces/${this.newWorkspace}`);
          this.$emit('created', this.newWorkspace);
          this.newWorkspace = '';
          this.dialog = false;
        }
      }
    },
  }
}
</script>

<style scoped>
.v-dialog__container.ws-dialogue {
  /* dialog adds weird space above button. Positioning absolutely pulls it out of the layout
     so that it does not push the button down */
  position: absolute;
}
.v-btn.ws-btn {
  border-radius: 0;
  height: auto !important;
}
</style>
