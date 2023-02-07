<template>
  <v-container
    class="network-container fill-height pa-0"
    fluid
  >
    <v-app-bar
      app
      clipped-right
    >
      <v-toolbar-title
        class="ws-detail-title"
      >
        <v-icon
          class="ml-4 mr-5"
          color="grey lighten-1"
        >
          mdi-text-box-multiple
        </v-icon>

        <span class="breadcrumbs">
          <router-link
            :to="{
              name: 'workspaceDetail',
              params: { workspace },
            }"
          >{{ workspace }}</router-link>
          <v-icon
            class="mx-4"
            color="grey lighten-2"
          >mdi-chevron-right</v-icon>
          <v-icon
            class="mr-3"
            color="grey lighten-1"
          >mdi-chart-timeline-variant</v-icon>
          {{ network }}
        </span>
      </v-toolbar-title>

      <v-spacer />

      <workspace-option-menu :workspace="workspace" />
    </v-app-bar>
    <v-main class="fill-height">
      <v-container
        class="align-stretch d-flex fill-height flex-column pa-0"
        fluid
      >
        <div :class="networkVisClasses">
          <v-list>
            <v-list-item>
              <v-list-item-title>
                Nodes: {{ totalNodes }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                Edges: {{ totalEdges }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <v-navigation-drawer
            absolute
            right
            permanent
          >
            <v-list subheader>
              <v-subheader>
                More ways to visualize
              </v-subheader>
              <v-divider />
              <div class="grey lighten-4 pa-3">
                <v-select
                  v-model="selectedVis"
                  :items="visItems"
                  background-color="white"
                  dense
                  hide-details
                  label="Visualization"
                  menu-props="auto"
                  outlined
                />
              </div>
              <v-divider />
              <v-list-item
                v-for="app in apps.network_visualizations"
                :key="app.name"
                class="pl-2"
                :href="`${app.url}/?workspace=${workspace}&network=${network}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                <v-list-item-avatar class="mr-3">
                  <v-icon color="blue lighten-3">
                    mdi-exit-to-app
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-title>
                  {{ app.name }}
                </v-list-item-title>
                <v-list-item-icon>
                  <v-icon color="blue lighten-3">
                    mdi-chevron-right
                  </v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </div>
        <div :class="nodeColsClasses">
          <div class="node-types flex-grow-1">
            <v-card
              flat
              height="100%"
              tile
            >
              <v-toolbar
                color="blue darken-1"
                dark
                dense
                flat
              >
                <v-toolbar-title>
                  Node Types
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text class="pa-0">
                <v-list
                  class="node-type-list pa-0"
                  color="transparent"
                  dense
                >
                  <div v-if="loading">
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                  </div>

                  <v-list-item
                    v-for="table in nodeTypes"
                    :key="table.name"
                    class="pl-2"
                    :to="`/workspaces/${workspace}/table/${table}`"
                  >
                    <v-list-item-avatar class="my-0">
                      <v-icon
                        color="grey lighten-1"
                        size="18"
                      >
                        mdi-scatter-plot
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{ table }}
                    </v-list-item-title>
                    <v-list-item-icon>
                      <v-icon color="grey lighten-1">
                        mdi-chevron-right
                      </v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </div>
          <div class="edge-types flex-grow-1">
            <v-card
              color="grey lighten-5"
              flat
              height="100%"
              tile
            >
              <v-toolbar
                color="blue darken-2"
                dark
                dense
                flat
              >
                <v-toolbar-title>
                  Edge Types
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text class="pa-0">
                <v-list
                  class="edge-type-list pa-0"
                  color="transparent"
                  dense
                >
                  <div v-if="loading">
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                  </div>

                  <v-list-item
                    v-for="table in edgeTypes"
                    :key="table.name"
                    class="pl-2"
                    :to="`/workspaces/${workspace}/table/${table}`"
                  >
                    <v-list-item-avatar class="my-0">
                      <v-icon
                        color="grey lighten-1"
                        size="18"
                      >
                        mdi-merge
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{ table }}
                    </v-list-item-title>
                    <v-list-item-icon>
                      <v-icon color="grey lighten-1">
                        mdi-chevron-right
                      </v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </div>
          <div class="nodes-list flex-grow-1">
            <v-card
              flat
              height="100%"
              tile
            >
              <v-toolbar
                color="blue darken-1"
                dark
                dense
                flat
              >
                <v-toolbar-title>
                  Nodes
                </v-toolbar-title>
                <v-spacer />
                <div class="pagination">
                  <v-btn
                    class="mx-1"
                    icon
                    small
                    :disabled="!prev"
                    @click="firstPage()"
                  >
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    class="mx-1"
                    icon
                    small
                    :disabled="!prev"
                    @click="turnPage(false)"
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <v-btn
                    class="mx-1"
                    icon
                    small
                    :disabled="!next"
                    @click="turnPage(true)"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                  <v-btn
                    class="mx-1"
                    icon
                    small
                    :disabled="!next"
                    @click="lastPage()"
                  >
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                </div>
              </v-toolbar>
              <v-card-text class="pa-0">
                <v-list
                  class="node-list pa-0"
                  color="transparent"
                  dense
                >
                  <div v-if="loading">
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                  </div>

                  <v-list-item
                    v-for="node in nodes"
                    :key="node"
                    :to="`/workspaces/${workspace}/network/${network}/node/${node}`"
                  >
                    <v-list-item-title>
                      {{ node }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </div>
          <v-btn
            class="tray-action"
            color="blue darken-2"
            dark
            depressed
            fab
            small
            @click="toggle"
          >
            <v-icon
              dark
              size="18"
            >
              {{ drawerIcon }}
            </v-icon>
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-container>
</template>

<script lang="ts">
import type { PropType, Ref } from 'vue';
import {
  computed,
  defineComponent, ref, watch,
} from 'vue';
import type { EdgesSpec, TableRow } from 'multinet';
import WorkspaceOptionMenu from '@/components/WorkspaceOptionMenu.vue';

import api from '@/api';
import type { App } from '@/types';

export default defineComponent({
  name: 'NetworkDetail',

  components: {
    WorkspaceOptionMenu,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
    network: {
      type: String as PropType<string>,
      required: true,
    },
    apps: {
      type: Object as PropType<{ network_visualizations: App[]; table_visualizations: App[] }>,
      required: true,
    },
  },
  setup(props) {
    const nodeTypes: Ref<string[]> = ref([]);
    const edgeTypes: Ref<string[]> = ref([]);
    const nodes: Ref<string[]> = ref([]);
    const offset = ref(0);
    const limit = ref(10);
    const loading = ref(true);
    const totalNodes = ref(0);
    const totalEdges = ref(0);
    const visItems = ref(['Network Overview']);
    const selectedVis = ref(visItems.value[0]);
    const panelOpen = ref(true);

    const highestOffset = computed(() => (totalNodes.value % limit.value
      ? Math.floor(totalNodes.value / limit.value)
      : totalNodes.value / limit.value - 1
    ) * limit.value);
    const next = computed(() => highestOffset.value !== offset.value);
    const prev = computed(() => offset.value !== 0);
    const nodeColsClasses = computed(() => `d-flex flex-row node-cols${panelOpen.value ? '' : ' node-cols-closed'}`);
    const networkVisClasses = computed(() => `network-vis${panelOpen.value ? '' : ' network-vis-closed'}`);
    const drawerIcon = computed(() => (panelOpen.value ? 'mdi-chevron-down' : 'mdi-chevron-up'));

    function toggle() {
      panelOpen.value = !panelOpen.value;
    }
    async function update() {
      function tableName(tableRow: TableRow | EdgesSpec) {
        // eslint-disable-next-line no-underscore-dangle
        return tableRow._id.split('/')[0];
      }
      loading.value = true;
      const network = await api.network(props.workspace, props.network);
      const newNodes = await api.nodes(props.workspace, props.network, {
        offset: offset.value,
        limit: limit.value,
      });
      const newEdges = await api.edges(props.workspace, props.network, {
        offset: offset.value,
        limit: limit.value,
      });
      totalNodes.value = network.node_count;
      totalEdges.value = network.edge_count;

      const prelimNodes = newNodes.results.map((node) => tableName(node));
      prelimNodes.forEach((nodeType) => {
        if (!nodeTypes.value.includes(nodeType)) {
          nodeTypes.value.push(nodeType);
        }
      });
      edgeTypes.value = newEdges.results.length > 0 ? [tableName(newEdges.results[0])] : [];
      nodeTypes.value = nodeTypes.value.sort();
      edgeTypes.value = edgeTypes.value.sort();

      // eslint-disable-next-line no-underscore-dangle
      nodes.value = newNodes.results.map((node) => node._id);
      loading.value = false;
    }
    function turnPage(forward: number) {
      offset.value += forward ? limit.value : -limit.value;
    }
    function lastPage() {
      offset.value = highestOffset.value;
    }
    function firstPage() {
      offset.value = 0;
    }

    watch([offset, limit, () => props.workspace, () => props.network], () => update());

    update();

    return {
      nodeTypes,
      edgeTypes,
      nodes,
      offset,
      limit,
      loading,
      totalNodes,
      totalEdges,
      visItems,
      selectedVis,
      panelOpen,
      toggle,
      drawerIcon,
      next,
      prev,
      nodeColsClasses,
      networkVisClasses,
      turnPage,
      lastPage,
      firstPage,
    };
  },
});
</script>

<style scoped>
ul {
  padding: 10px;
  list-style-type: none;
  text-align: left;
}

.network-vis {
  height: calc(100vh - 314px  - 60px); /* 100vh - 314px - 60px for toolbar */
  position: relative;
  z-index: 1;
}

.network-vis-closed {
  height: calc(100vh - 75px - 60px); /* 100vh - 75px - 60px for toolbar */
}

.node-cols {
  height: 250px;
  position: relative;
  z-index: 2;
}

.node-cols > div {
  height: 100%;
}

.node-cols-closed {
  height: 11px;
}

.node-cols-closed > * {
  overflow: hidden;
}

.node-type-list,
.edge-type-list,
.node-list {
  overflow-y: auto;
  max-height: 202px;
}

.tray-action {
  height: 22px;
  position: absolute;
  right: calc(50% + 13px);
  top: -11px;
  width: 22px;
}

.tray-action i {
  margin-top: -1px;
}

.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}
.ws-detail-title a {
  text-decoration: none;
}
.ws-detail-title a:hover {
  text-decoration: underline;
}
</style>
