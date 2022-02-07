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
        <v-sheet
          class="pa-6"
          color="primary"
          dark
          flat
          height="100%"
        >
          <v-row>
            <v-col cols="9">
              <v-card
                class="pr-6"
                color="transparent"
                flat
                height="0%"
              >
                <v-card-title class="text-h4">
                  Welcome to Multinet!
                </v-card-title>
                <v-divider />
                <v-card-text class="welcome-text">
                  <p>
                    Check out the featured datasets and visualizations below! You
                    can also create your own workspace and upload your own data with
                    the <strong>New Workspace</strong> button to the left, or
                    explore data others have uploaded.
                  </p>
                  <p>
                    This project is a joint research and development effort between
                    the University of Utah and Kitware Inc., funded by the National
                    Science Foundation.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-responsive>

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
