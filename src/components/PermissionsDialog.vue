<template>
  <v-dialog
    v-model="permDialog"
    max-width="600"
  >
    <template v-slot:activator="{ on }">
      <v-list-item
        ripple
        :disabled="!workspacePermissionsEditable"
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
          <v-col cols="3">
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
              v-model="newUserSelection"
              :items="userSearchResults"
              label="Give permissions by email"
              class="px-0"
              item-text="listing"
              chips
              deletable-chips
              full-width
              return-object
              multiple
              outlined
              hide-details
              hide-no-data
              hide-selected
              :search-input.sync="userSearchString"
              @update:search-input="throttledUserSearch"
              @change="userSearchString = null"
              @keypress.enter="addSelectedUsers"
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
                  @click="addSelectedUsers"
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
                  :items="assignableRoleListing"
                  class="no-border ma-0 pa-0"
                  hide-details
                  dense
                  placeholder="change all to"
                  prepend-icon="more_horiz"
                  @input="setRoleForAllUsers(singularRoleToPlural($event))"
                />
              </v-col>
            </v-row>
          </v-subheader>
          <v-divider />
          <v-list-item
            v-for="{ user, role } in userPermissionsList"
            :key="user.sub"
            class="px-0"
          >
            <v-list-item-avatar>
              <v-icon>account_circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="blue--text text--darken-2">
                {{ user.email }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="user-list-individual-select">
              <v-select
                :items="role === 'owner' ? totalRoleListing : assignableRoleListing"
                class="no-border ma-0 pa-0"
                hide-details
                dense
                :value="pluralRoleToSingular(role)"
                :disabled="role === 'owner'"
                prepend-icon="lock"
                @input="setRoleForUser(user, role, singularRoleToPlural($event))"
              />
            </v-list-item-action>
            <v-list-item-action>
              <v-btn
                icon
                :disabled="role === 'owner'"
                @click="removeUserPermissions(user, role)"
              >
                <v-icon>close</v-icon>
              </v-btn>
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
            @click="cancelChange"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            large
            @click="setPermissions"
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
import api from '@/api';
import { WorkspacePermissionsSpec, UserSpec } from 'multinet';
import { cloneDeep, debounce } from 'lodash';

import store from '@/store';
import {
  Role,
  SingularRole,
  canChangeWorkspacePermissions,
} from '@/utils/permissions';

export interface UserPermissionSpec {
  role: Role;
  user: UserSpec;
}

export interface UserSearchResult extends UserSpec {
  listing: string;
}

const assignableRoleListing: SingularRole[] = ['maintainer', 'writer', 'reader'];
const totalRoleListing: SingularRole[] = [...assignableRoleListing, 'owner'];

export default Vue.extend({
  name: 'PermissionsDialog',
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data(this: any) {
    return {
      assignableRoleListing,
      totalRoleListing,
      permDialog: false,
      privacyToggle: false,
      mutablePermissions: null as WorkspacePermissionsSpec | null,
      throttledUserSearch: debounce(this.searchUsers, 200),
      userSearchString: null as string | null,
      userSearchResults: [] as UserSearchResult[],
      newUserSelection: [] as UserSpec[],
    };
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workspacePermissionsEditable(this: any) {
      return canChangeWorkspacePermissions(store.state.userInfo, this.permissions);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    swapPermIcon(this: any) {
      return this.privacyToggle ? 'lock' : 'lock_open';
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredWorkspacePermissions(this: any) {
      // Used to remove the `public` field in the permissions object.
      if (this.mutablePermissions === null) { return null; }

      const {
        owner, maintainers, readers, writers,
      } = this.mutablePermissions as WorkspacePermissionsSpec;

      return {
        owner,
        maintainers,
        readers,
        writers,
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userPermissionsList(this: any): UserPermissionSpec[] {
      const userPermissionList: UserPermissionSpec[] = [];
      if (this.filteredWorkspacePermissions === null) return userPermissionList;

      const roles = Object.keys(
        this.filteredWorkspacePermissions,
      ) as Role[];

      roles.forEach((role) => {
        const roleUsers = this.filteredWorkspacePermissions[role];

        if (roleUsers) {
          if (role === 'owner') {
            userPermissionList.push({ role, user: roleUsers });
          } else {
            roleUsers.forEach((user: UserSpec) => {
              userPermissionList.push({ role, user });
            });
          }
        }
      });

      return userPermissionList;
    },
  },
  asyncComputed: {
    permissions: {
      async get(): Promise<WorkspacePermissionsSpec | null> {
        try {
          return api.getWorkspacePermissions(this.workspace);
        } catch (error) {
          return null;
        }
      },
      default: null,
    },
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissions(this: any, val: WorkspacePermissionsSpec) {
      if (val !== null) {
        this.initMutableData(val);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    privacyToggle(this: any, val: boolean) {
      if (this.mutablePermissions) {
        this.mutablePermissions.public = !val;
      }
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initMutableData(this: any, permissions: WorkspacePermissionsSpec) {
      this.mutablePermissions = cloneDeep(permissions);
      this.privacyToggle = !this.permissions.public;
    },
    singularRoleToPlural(role: SingularRole): Role {
      if (role === 'owner') { return role; }

      return `${role}s` as Role;
    },
    pluralRoleToSingular(role: Role): SingularRole {
      if (role === 'owner') { return role; }

      return role.slice(0, -1) as SingularRole;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRoleForUser(this: any, user: UserSpec, currentRole: Role, newRole: Role) {
      const mutablePermissions = this.mutablePermissions as WorkspacePermissionsSpec;

      // Currently don't allow changing owners
      if (newRole !== currentRole && newRole !== 'owner' && currentRole !== 'owner') {
        mutablePermissions[newRole].push(user);
        mutablePermissions[currentRole] = mutablePermissions[currentRole].filter((x) => x.sub !== user.sub);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRoleForAllUsers(this: any, role: Role) {
      const userList: UserSpec[] = (this.userPermissionsList as UserPermissionSpec[])
        .filter((user: UserPermissionSpec) => user.role !== 'owner')
        .map((user) => user.user);

      this.mutablePermissions = {
        owner: this.mutablePermissions.owner,
        public: this.mutablePermissions.public,
        maintainers: [],
        writers: [],
        readers: [],
        [role]: userList,
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeUserPermissions(this: any, user: UserSpec, currentRole: Role) {
      if (currentRole === 'owner') return;

      const mutablePermissions = this.mutablePermissions as WorkspacePermissionsSpec;
      const newRoleList = mutablePermissions[currentRole].filter((x) => x.sub !== user.sub);

      mutablePermissions[currentRole] = newRoleList;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setPermissions(this: any) {
      try {
        await api.setWorkspacePermissions(this.workspace, this.mutablePermissions);
        this.permDialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cancelChange(this: any) {
      this.permDialog = false;
      this.initMutableData(this.permissions);
      this.resetUserSearch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async searchUsers(this: any, query: string) {
      if (!this.userSearchString) { return; }

      const userPermissionList = this.userPermissionsList as UserPermissionSpec[];
      const userInWorkspace = (user: UserSpec) => (userPermissionList.find((userPerm) => userPerm.user.sub === user.sub));

      const result = await api.searchUsers(query);
      const mappedResults: UserSearchResult[] = result
        .map((user) => ({ ...user, listing: `${user.name} (${user.email})` }))
        .filter((user) => !userInWorkspace(user));

      this.userSearchResults = mappedResults;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetUserSearch(this: any) {
      this.newUserSelection = [];
      this.userSearchResults = [];
      this.userSearchString = null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addSelectedUsers(this: any) {
      const mutablePermissions = this.mutablePermissions as WorkspacePermissionsSpec;
      const newUserSelection = this.newUserSelection as UserSpec[];

      mutablePermissions.readers.push(...newUserSelection);

      this.resetUserSearch();
    },
  },
});
</script>

<style scoped>
.user-list-heading {
  font-size: 14px !important;
}

.user-list-individual-select {
  max-width: 150px;
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
