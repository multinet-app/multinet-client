import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import FrontPage from '@/views/FrontPage'
import WorkspaceDetail from '@/views/WorkspaceDetail'
import TableDetail from '@/views/TableDetail'
import GraphDetail from '@/views/GraphDetail'
import NodeDetail from '@/views/NodeDetail'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FrontPage
  },
  {
    path: '/workspaces/:workspace',
    name: 'workspaceDetail',
    component: WorkspaceDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/table/:table',
    name: 'tableDetail',
    component: TableDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/graph/:graph',
    name: 'graphDetail',
    component: GraphDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/graph/:graph/node/:type/:node',
    name: 'nodeDetail',
    component: NodeDetail,
    props: true
  }
]

const router = new VueRouter({routes})

export default router
