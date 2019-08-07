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

    <WorkspaceDialog
      @created="addWorkspace"
    />

    <v-list subheader>
      <v-subheader class="pr-2">
        Your Workspaces
        <v-spacer />

          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-scroll-x-transition>
                <v-btn
                  flat
                  icon
                  v-if="somethingChecked"
                  v-on="on"
                >
                  <v-icon color="red accent-3">delete_sweep</v-icon>
                </v-btn>
              </v-scroll-x-transition>
            </template>
            <span>Delete selected</span>
          </v-tooltip>
      </v-subheader>

      <v-divider></v-divider>

      <v-hover
        v-for="space in workspaces"
        :key="space"
      >
        <v-list-tile
          active-class="grey lighten-4"
          avatar
          ripple
          slot-scope="{ hover }"
          :to="`/workspaces/${space}/`"
        >
          <v-list-tile-action @click.prevent>
            <v-fade-transition hide-on-leave>
              <v-icon
                color="primary"
                v-if="!hover && !checkbox[space]"
              >library_books</v-icon>

              <v-checkbox
                class="ws-checkbox"
                v-else
                v-model="checkbox[space]"
              ></v-checkbox>
            </v-fade-transition>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{space}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-hover>
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
      right: null,
      checkbox: {}
    }
  },
  components: {
    WorkspaceDialog
  },
  computed: {
    somethingChecked() {
      return Object.values(this.checkbox)
        .some(d => !!d);
    }
  },
  methods: {
    route (workspace) {
      this.$router.push(`/workspaces/${workspace}`);
    },
    addWorkspace (workspace) {
      const workspaces = this.workspaces.concat([workspace]);
      this.workspaces = workspaces.sort();
    },
  },
  async created () {
    const response = await api().post('multinet/graphql', {query: `query {
      workspaces { name }
    }`});

    this.workspaces = response.data.data.workspaces.map(space => space.name);
  }
}
</script>

<style scoped>
</style>
