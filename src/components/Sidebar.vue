<template>
  <v-navigation-drawer
    app
    fixed
    permanent
    stateless
    value="true"
  >
    <v-toolbar
      color="grey lighten-2"
    >
      <v-toolbar-title>multinet</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-avatar
          color="grey lighten-4"
          size="36px"
        >
          <v-icon color="grey">account_circle</v-icon>
        </v-avatar>
      </v-btn>
    </v-toolbar>

    <WorkspaceDialog />

    <v-list subheader>
      <v-subheader>Your Workspaces</v-subheader>

      <v-divider></v-divider>

      <v-list-tile
        active-class="grey lighten-4"
        avatar
        ripple
        :key="space"
        :to="`/workspaces/${space}/`"
        v-for="space in workspaces"
      >
        <v-list-tile-avatar>
          <v-icon color="primary">library_books</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title>{{space}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import api from '@/api'
import WorkspaceDialog from '@/components/WorkspaceDialog'

export default {
  data () {
    return {
      newWorkspace: '',
      workspaces: [],
      right: null
    }
  },
  components: {
    WorkspaceDialog
  },
  methods: {
    route (workspace) {
      this.$router.push(`/workspaces/${workspace}`);
    }
  },
  async created () {
    const response = await api().post('multinet/graphql', {query: `query {
      workspaces { name }
    }`});

    this.workspaces = response.data.data.workspaces.map(space => space.name);
  }
}
</script>

<style>
.workspace-btn.v-btn {
  border-radius: 0;
  height: auto;
}
</style>
