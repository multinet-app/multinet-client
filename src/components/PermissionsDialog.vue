<template>
  <v-dialog
    v-model="permDialog"
    max-width="600"
  >
    <template v-slot:activator="{ on }">
      <v-list-item
        ripple
        v-on="on"
      >
        <v-list-item-icon class="mr-3">
          <v-icon>vpn_key</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          Permissions
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title class="perm-title">
        <v-row
          align="center"
          justify="space-between"
        >
          <v-col cols="8">
            Permissions for&nbsp;<strong>{{ workspace }}</strong>
          </v-col>
          <v-col
            cols="3"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-switch
                  v-model="privacyToggle"
                  :append-icon="swapPermIcon"
                  class="no-label ma-0 pa-0 ml-2"
                  hide-details
                  inset
                  v-on="on"
                />
              </template>
              <span v-if="privacyToggle">Make public</span>
              <span v-else>Make private</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card
        class="global-perm grey darken-3 pa-5"
        dark
        flat
        tile
      >
        <v-row>
          <v-spacer />
          <v-col
            class="py-0"
            cols="10"
          >
            <v-autocomplete
              :items="['jarred.tomatoes@kitware.com', 'jakey.nesby@kitware.com', 'maca_roni.chowdery@kitware.com']"
              append-icon=""
              chips
              class="px-0"
              deletable-chips
              label="Give permissions by email"
              full-width
              hide-details
              hide-no-data
              hide-selected
              multiple
              outlined
            />
          </v-col>
          <v-col class="py-0">
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  color="grey lighten-1"
                  dark
                  fab
                  outlined
                  v-on="on"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </template>
              <span>Add selected</span>
            </v-tooltip>
          </v-col>
          <v-spacer />
        </v-row>
      </v-card>
      <v-card
        class="pa-5"
        flat
      >
        <v-list>
          <v-subheader class="pa-3">
            <v-row align-items="center">
              <v-col
                class="user-list-heading pa-1"
                cols="8"
              >
                Set individual permissions:
              </v-col>
              <v-col class="user-list-all-select pa-0">
                <v-select
                  :items="['owner','maintainer','writer','reader']"
                  class="no-border ma-0 pa-0"
                  hide-details
                  dense
                  placeholder="change all to"
                  prepend-icon="more_horiz"
                />
              </v-col>
            </v-row>
          </v-subheader>
          <v-divider />
          <v-list-item class="px-0">
            <v-list-item-avatar>
              <v-icon>account_circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="blue--text text--darken-2">
                jakey.nesby@kitware.com
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="user-list-individual-select">
              <v-select
                :items="['owner','maintainer','writer','reader']"
                class="no-border ma-0 pa-0"
                hide-details
                dense
                value="owner"
                prepend-icon="lock"
              />
            </v-list-item-action>
          </v-list-item>
          <v-divider />
          <v-list-item class="px-0">
            <v-list-item-avatar>
              <v-icon>account_circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="blue--text text--darken-2">
                maca_roni.chowdery@kitware.com
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="user-list-individual-select">
              <v-select
                :items="['owner','maintainer','writer','reader']"
                class="no-border ma-0 pa-0"
                hide-details
                dense
                value="maintainer"
                prepend-icon="lock"
              />
            </v-list-item-action>
          </v-list-item>
          <v-divider />
          <v-list-item class="px-0">
            <v-list-item-avatar>
              <v-icon>account_circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="blue--text text--darken-2">
                jarred.tomatoes@kitware.com
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="user-list-individual-select">
              <v-select
                :items="['owner','maintainer','writer','reader']"
                class="no-border ma-0 pa-0"
                hide-details
                dense
                value="reader"
                prepend-icon="lock"
              />
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </v-list>
        <v-card-actions class="pt-4">
          <v-spacer />
          <v-btn
            color="grey darken-2"
            large
            text
            @click="permDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            large
          >
            Save Permissions
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">

import Vue, { PropType } from 'vue';


export default Vue.extend({
  name: 'PermissionsDialog',
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      permDialog: false,
      privacyToggle: true,
    };
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    swapPermIcon(this: any) {
      return this.privacyToggle ? 'lock' : 'lock_open';
    },
  },
});
</script>

<style scoped>
.user-list-heading {
  font-size: 14px !important;
}

.user-list-individual-select {
  max-width: 175px;
}

.v-dialog > .v-card > .v-card__title.perm-title {
  font-size: 24px;
  font-weight: 400;
}

.v-dialog > .v-card > .v-card__title.perm-title strong {
  font-weight: 600;
}
</style>

<style>
.v-text-field.no-border > .v-input__control > .v-input__slot:before,
.v-text-field.no-border > .v-input__control > .v-input__slot:after {
  display: none;
}

.v-application--is-ltr .no-label .v-input__append-outer,
.v-application--is-ltr .no-label .v-input__prepend-outer {
  margin: 0;
}

.no-label {
  justify-content: flex-end;
}

.user-list-all-select .v-select__selections,
.user-list-individual-select .v-select__selections {
  font-size: 14px;
}

.v-application--is-ltr .no-label .v-input--selection-controls__input {
  margin: 0;
}

.v-application--is-ltr .no-label .v-input__control {
  flex-grow: 0;
  width: unset;
}

.global-perm-select.v-text-field > .v-input__control > .v-input__slot:before,
.global-perm-select.v-text-field > .v-input__control > .v-input__slot:after {
    border-width: 0;
    border-color: transparent;
}
</style>
