<template>
  <v-list
    class="item-panel"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">{{title}}</h2>

      <v-spacer />

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-scroll-x-transition>
              <v-btn
                flat
                icon
                v-if="anySelected"
                v-on="on"
              >
                <v-icon color="red accent-2">delete_sweep</v-icon>
              </v-btn>
            </v-scroll-x-transition>
          </template>
          <span>Delete selected</span>
        </v-tooltip>
    </v-subheader>

    <v-divider></v-divider>

    <template v-if="items.length > 0">
      <v-hover
        v-for="item in items"
        :key="item"
      >
        <v-list-tile
          active-class="grey lighten-4"
          avatar
          ripple
          slot-scope="{ hover }"
          :to="`/workspaces/${workspace}/${routeType}/${item}`"
        >
          <v-list-tile-action @click.prevent>
            <v-fade-transition hide-on-leave>
              <v-icon
                color="blue lighten-1"
                v-if="!hover && !checkbox[item]"
              >{{icon}}</v-icon>

              <v-checkbox
                class="ws-detail-checkbox"
                v-else
                v-model="checkbox[item]"
              ></v-checkbox>
            </v-fade-transition>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{item}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-hover>
    </template>
    <div
      class="ws-detail-empty-list"
      v-else
    >
      <v-icon color="blue lighten-1">info</v-icon> There's nothing here yet...
    </div>
  </v-list>
</template>

<script>
export default {
  name: 'ItemPanel',
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    workspace: {
      type: String,
      required: true,
    },
    routeType: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      checkbox: {},
    };
  },
  computed: {
    anySelected() {
      return Object.values(this.checkbox)
        .some(d => !!d);
    },
  },
}
</script>

<style scoped>
.v-list.item-panel {
  background: none;
}

.ws-detail-empty-list {
  padding: 40px 40px 55px;
  text-align: center;
}
</style>
