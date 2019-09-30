import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import FrontPage from '@/views/FrontPage.vue';
import WorkspaceDetail from '@/views/WorkspaceDetail.vue';
import TableDetail from '@/views/TableDetail.vue';
import GraphDetail from '@/views/GraphDetail.vue';
import NodeDetail from '@/views/NodeDetail.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: FrontPage,
  },
  {
    path: '/workspaces/:workspace',
    name: 'workspaceDetail',
    component: WorkspaceDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/table/:table',
    name: 'tableDetail',
    component: TableDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/graph/:graph',
    name: 'graphDetail',
    component: GraphDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/graph/:graph/node/:type/:node',
    name: 'nodeDetail',
    component: NodeDetail,
    props: true,
  },
  {
    path: '*',
    redirect: { name: 'home' },
  },
];

const router = new VueRouter({routes});

export default router;
