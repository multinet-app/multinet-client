import Vue from 'vue';
import VueRouter from 'vue-router';

import FrontPage from '@/views/FrontPage.vue';
import WorkspaceDetail from '@/views/WorkspaceDetail.vue';
import TableDetail from '@/views/TableDetail.vue';
import NetworkDetail from '@/views/NetworkDetail.vue';
import NodeDetail from '@/views/NodeDetail.vue';
import AQLWizard from '@/views/AQLWizard.vue';
import NetworkAlgorithms from '@/views/NetworkAlgorithms.vue';

Vue.use(VueRouter);

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
    path: '/workspaces/:workspace/aql',
    name: 'aqlWizard',
    component: AQLWizard,
    props: true,
  },
  {
    path: '/workspaces/:workspace/table/:table',
    name: 'tableDetail',
    component: TableDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/network/:network',
    name: 'networkDetail',
    component: NetworkDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/network/:network/node/:type/:node',
    name: 'nodeDetail',
    component: NodeDetail,
    props: true,
  },
  {
    path: '/workspaces/:workspace/algorithm',
    name: 'networkAlgorithms',
    component: NetworkAlgorithms,
    props: true,
  },
  {
    path: '*',
    redirect: { name: 'home' },
  },
];

const router = new VueRouter({ routes });

export default router;
