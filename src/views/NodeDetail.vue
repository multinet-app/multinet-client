<template>
  <v-container fluid>
    <v-content>
      <h1>Node: {{`${this.workspace}/${this.graph}/${this.type}/${this.node}`}}</h1>
      <div style="border-style: solid;">
        <label>Attributes</label>
        <table>
          <tr v-for="field in attributes" :key="field.key">
            <td class="key"><b>{{field.key}}:</b></td>
            <td class="value">{{field.value}}</td>
          </tr>
        </table>
      </div>
      <div id="node-details">
        <div style="border-style: solid; width: 100%;">
          <label>Incoming Edges</label>
          <br/>
          <br/>
          <div style="display: flex; flex-flow: row nowrap; justify-content: space-around">
            <div v-if="prevIncoming" v-on:click="firstPage('incoming')">first</div>
            <div v-if="prevIncoming" v-on:click="turnPage('incoming', false)">previous</div>
            <div v-if="nextIncoming" v-on:click="turnPage('incoming', true)">next</div>
            <div v-if="nextIncoming" v-on:click="lastPage('incoming')">last</div>
          </div>
          <ul>
            <li v-for="(edge, index) in incoming" :key="index">
              <router-link :to="`/workspaces/${workspace}/graph/${graph}/node/${edge.airport}`">{{edge.airport}}</router-link>
            </li>
          </ul>
        </div>
        <div style="border-style: solid; width: 100%;">
          <label>Outgoing Edges</label>
          <br/>
          <br/>
          <div style="display: flex; flex-flow: row nowrap; justify-content: space-around">
            <div v-if="prevOutgoing" v-on:click="firstPage('outgoing')">first</div>
            <div v-if="prevOutgoing" v-on:click="turnPage('outgoing', false)">previous</div>
            <div v-if="nextOutgoing" v-on:click="turnPage('outgoing', true)">next</div>
            <div v-if="nextOutgoing" v-on:click="lastPage('outgoing')">last</div>
          </div>
          <ul>
            <li v-for="(edge, index) in outgoing" :key="index">
              <router-link :to="`/workspaces/${workspace}/graph/${graph}/node/${edge.airport}`">{{edge.airport}}</router-link>
            </li>
          </ul>
        </div>
      </div>
    </v-content>
  </v-container>
</template>

<script>
import api from '@/api'

export default {
  name: 'NodeDetail',
  props: ['workspace', 'graph', 'type', 'node'],
  data () {
    return {
      incoming: [],
      outgoing: [],
      attributes: [],
      offsetIncoming: 0,
      offsetOutgoing: 0,
      pageCount: 20,
      totalIncoming: 0,
      totalOutgoing: 0
    }
  },
  computed: {
    lastIncomingPage () {
      return (
        this.totalIncoming % this.pageCount
          ? Math.floor(this.totalIncoming/this.pageCount)
          : this.totalIncoming/this.pageCount-1
      ) * this.pageCount
    },
    lastOutgoingPage () {
      return (
        this.totalOutgoing % this.pageCount
          ? Math.floor(this.totalOutgoing/this.pageCount)
          : this.totalOutgoing/this.pageCount-1
      ) * this.pageCount
    },
    nextIncoming () {
      return this.lastIncomingPage !== this.offsetIncoming
    },
    nextOutgoing () {
      return this.lastOutgoingPage !== this.offsetOutgoing
    },
    prevIncoming () {
      return 0 !== this.offsetIncoming
    },
    prevOutgoing () {
      return 0 !== this.offsetOutgoing
    }
  },
  methods: {
    async update () {
      let response = await api().get(`/workspaces/${this.workspace}/graphs/${this.graph}/nodes/${this.type}/${this.node}/data`);
      const attributes = response.data;

      response = await api().get(`/workspaces/${this.workspace}/graphs/${this.graph}/nodes/${this.type}/${this.node}/edges?direction=incoming&offset=${this.offsetIncoming}&limit=${this.pageCount}`);
      const incoming = response.data;

      response = await api().get(`/workspaces/${this.workspace}/graphs/${this.graph}/nodes/${this.type}/${this.node}/edges?direction=outgoing&offset=${this.offsetOutgoing}&limit=${this.pageCount}`);
      const outgoing = response.data;

      this.attributes = Object.keys(attributes).map(key => ({
        key,
        value: attributes[key],
      }));
      this.incoming = incoming.edges.map(edge => ({id: edge.id, airport: edge.from}));
      this.outgoing = outgoing.edges.map(edge => ({id: edge.id, airport: edge.to}));
      this.totalIncoming = incoming.edgeCount;
      this.totalOutgoing = outgoing.edgeCount;
    },
    turnPage (edgeType, forward) {
      if (edgeType === 'incoming') {
        this.offsetIncoming += forward ? this.pageCount : -this.pageCount
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing += forward ? this.pageCount : -this.pageCount
      }
    },
    lastPage (edgeType) {
      if (edgeType === 'incoming') {
        this.offsetIncoming = this.lastIncomingPage
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing = this.lastOutgoingPage
      }
    },
    firstPage (edgeType) {
      if (edgeType === 'incoming') {
        this.offsetIncoming = 0
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing = 0
      }
    }
  },
  watch: {
    workspace () {
      this.update()
    },
    graph () {
      this.update()
    },
    type () {
      this.update()
    },
    node () {
      this.update()
    },
    offsetIncoming () {
      this.update()
    },
    offsetOutgoing () {
      this.update()
    },
    pageCount () {
      this.update()
    },
  },
  created () {
    this.update()
  }
}
</script>

<style scoped>
#node-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}

ul {
  padding: 10px;
  list-style-type: none;
  text-align: left;
}

td.key {
  text-align: right;
  padding-right: 20px;
  padding-left: 10px;
}

td.value {
  text-align: left;
}
</style>
