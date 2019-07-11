import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Index from '@/views/Index'
import WorkspaceDetail from '@/views/WorkspaceDetail'
import TableDetail from '@/views/TableDetail'
import GraphDetail from '@/views/GraphDetail'
import NodeDetail from '@/views/NodeDetail'

const routes = [
  {
    path: '/',
    component: Index
  },
  {
    path: '/workspaces/:workspace',
    component: WorkspaceDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/table/:table',
    component: TableDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/graph/:graph',
    component: GraphDetail,
    props: true
  },
  {
    path: '/workspaces/:workspace/graph/:graph/node/:type/:node',
    component: NodeDetail,
    props: true
  }
]

const router = new VueRouter({routes})

export default router
