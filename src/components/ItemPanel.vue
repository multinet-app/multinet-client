<template>
  <v-list
    class="item-panel"
    :data-title="title"
    subheader
  >
    <v-subheader class="px-0">
      <h2 class="black--text">{{title}}</h2>

      <v-spacer />

      <slot name="downloader"
        :selection="selection"
        :workspace="workspace"
      >
      </slot>
      <slot name="deleter"
        :selection="selection"
        :workspace="workspace"
      >
      </slot>

      <slot></slot>

    </v-subheader>

    <v-divider></v-divider>

    <template v-if="items.length > 0">
      <v-hover
        v-for="item in items"
        :key="item"
      >
        <v-list-item
          active-class="grey lighten-4"
          ripple
          slot-scope="{ hover }"
          :to="`/workspaces/${workspace}/${routeType}/${item}`"
        >
          <v-list-item-action @click.prevent>
            <v-icon
              color="blue lighten-1"
              v-if="!hover && !checkbox[item]"
            >{{icon}}</v-icon>

            <v-checkbox
              class="ws-detail-checkbox"
              v-else
              v-model="checkbox[item]"
            ></v-checkbox>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{item}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
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

<script lang="ts">
import Vue from 'vue';
import TableDialog from '@/components/TableDialog.vue';
import GraphDialog from '@/components/GraphDialog.vue';

export default Vue.extend({
  name: 'ItemPanel',
  components: {
    GraphDialog,
    TableDialog,
  },
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
    interface CheckboxTable {
      [index: string]: boolean;
    }

    return {
      checkbox: {} as CheckboxTable,
    };
  },
  computed: {
    selection(): string[] {
      return Object.keys(this.checkbox)
        .filter((d) => !!this.checkbox[d]);
    },
    anySelected(): boolean {
      return this.selection.length > 0;
    },
  },

  methods: {
    clearCheckboxes() {
      Object.keys(this.checkbox).forEach((key) => {
        this.checkbox[key] = false;
      });
    },
  },
});
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
