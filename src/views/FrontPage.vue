<template>
  <v-container
    class="pa-0"
    fluid
  >
    <v-main>
      <!-- BANNER -->
      <v-responsive
        class="mb-5"
      >
        <v-card
          color="grey lighten-2"
          flat
          tile
        >
          <v-card-text
            class="grey--text text--darken-3 text-center text-h5 pt-10 pb-0 ma-auto"
            style="max-width: 700px;"
          >
            <strong class="black--text">Multinet</strong> is visualization tool for networks with attributes associated with the nodes and links.
          </v-card-text>
          <v-card-text>
            <v-img
              style="margin-left: 50px; margin-right: 50px;"
              :src="samples[1].image"
              max-height="200px"
            />
          </v-card-text>
        </v-card>
      </v-responsive>

      <v-row class="text-center">
        <v-spacer />
        <v-col class="text-h4 grey--text text--darken-4">
          Getting Started
        </v-col>
        <v-spacer />
      </v-row>
      <v-row class="text-center pb-6">
        <v-spacer />
        <v-col class="text-h6 grey--text text--darken-4">
          <v-icon large>
            search
          </v-icon>
          Sign Up and Upload Your Own Data
        </v-col>
        <v-spacer />
        <v-col class="text-h6 grey--text text--darken-4">
          <v-icon large>
            file_upload
          </v-icon>
          Try a Demo Below!
        </v-col>
        <v-spacer />
      </v-row>

      <!-- COLUMNS -->
      <div class="px-6 py-2">
        <v-row class="px-5 pb-6">
          <v-col
            v-for="sample in samples"
            :key="sample.title"
            cols="4"
          >
            <v-hover>
              <template v-slot:default="{ hover }">
                <v-card>
                  <v-img
                    class="align-end"
                    height="250px"
                    :src="sample.image"
                  >
                    <v-card-title class="box-shadow-title">
                      {{ sample.title }}
                    </v-card-title>
                  </v-img>
                  <v-fade-transition>
                    <v-overlay
                      v-if="hover"
                      absolute
                      opacity=".85"
                    >
                      <div class="overlay-text">
                        <p>{{ sample.text }}</p>
                        <v-btn
                          color="primary"
                          :href="sample.href"
                          target="_blank"
                        >
                          Open in New Window
                        </v-btn>
                      </div>
                    </v-overlay>
                  </v-fade-transition>
                </v-card>
              </template>
            </v-hover>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { App } from '@/types';

export default Vue.extend({
  props: {
    apps: {
      type: Array as PropType<App[]>,
      required: true,
    },
  },

  computed: {
    multiMatrixURL(): string {
      return `${this.apps.filter((d) => d.name === 'MultiMatrix')[0].url}`;
    },

    multiLinkURL(): string {
      return `${this.apps.filter((d) => d.name === 'MultiLink')[0].url}`;
    },

    samples(): Array<{title: string; image: NodeRequire; text: string; href: string }> {
      return [
        {
          title: 'Paul Revere - MultiLink',
          // eslint-disable-next-line global-require
          image: require('../assets/placard/boston.jpg'),
          text: 'Explore the Paul Revere dataset using an interactive and beautiful node-link diagram. Discover the figures coordinating a pivotal event in history!',
          href: `${this.multiLinkURL}/?workspace=boston&network=boston`,
        },
        {
          title: 'Les Miserables - MultiMatrix',
          // eslint-disable-next-line global-require
          image: require('../assets/placard/miserables.jpg'),
          text: 'Explore the Les Miserables dataset using an interactive adjacency matrix. See the factions and relationships for yourself!',
          href: `${this.multiMatrixURL}/?workspace=miserables&network=miserables`,
        },
        {
          title: 'Les Miserables - MultiLink',
          // eslint-disable-next-line global-require
          image: require('../assets/placard/miserables2.jpg'),
          text: 'The characters of Les Miserables, laid out in a colorful and interactive node-link diagram.',
          href: `${this.multiLinkURL}/?workspace=miserables&network=miserables`,
        },
        {
          title: 'Paul Revere - MultiMatrix',
          // eslint-disable-next-line global-require
          image: require('../assets/placard/boston2.jpg'),
          text: 'See the relationships between Paul Revere and his contemporaries through an adjacency matrix layout.',
          href: `${this.multiMatrixURL}/?workspace=boston&network=boston`,
        },
      ];
    },
  },
});
</script>

<style>
.box-shadow-title {
  box-shadow: inset 0px -230px 70px -120px white;
  padding-bottom: 8px;
  padding-top: 210px;
}
.overlay-text {
  padding: 48px;
}
.welcome-text p {
  font-size: 18px;
}
.logo {
  filter: grayscale(100%);
}
</style>
