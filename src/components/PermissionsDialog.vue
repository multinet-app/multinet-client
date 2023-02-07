<template>
  <v-dialog
    v-model="permDialog"
    max-width="600"
  >
    <template #activator="{ on }">
      <v-list-item
        ripple
        :disabled="!workspacePermissionsEditable"
        v-on="on"
      >
        <v-list-item-icon class="mr-3">
          <v-icon>mdi-key</v-icon>
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
              <template #activator="{ on }">
                <v-btn
                  color="grey lighten-1"
                  dark
                  fab
                  outlined
                  v-on="on"
                  @click="addSelectedUsers"
                >
                  <v-icon>mdi-plus</v-icon>
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
            <v-row class="align-items">
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
                  prepend-icon="mdi-dots-horizontal"
                  @input="setRoleForAllUsers(singularRoleToPlural($event))"
                />
              </v-col>
            </v-row>
          </v-subheader>
          <v-divider />
          <v-list-item
            v-for="{ user, role } in userPermissionsList"
            :key="user.id"
            class="px-0"
          >
            <v-list-item-avatar>
              <v-icon>mdi-account-circle</v-icon>
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
                prepend-icon="mdi-lock"
                @input="setRoleForUser(user, role, singularRoleToPlural($event))"
              />
            </v-list-item-action>
            <v-list-item-action>
              <v-btn
                icon
                :disabled="role === 'owner'"
                @click="removeUserPermissions(user, role)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </v-list>
        <v-card-actions class="pt-4">
          <v-checkbox
            v-model="publicToggle"
            class="ma-0 mb-2"
            label="Make this workspace public"
            hide-details
            dense
          />
          <v-menu
            offset-y
            top
            left
            open-on-hover
          >
            <template #activator="{ on }">
              <v-icon
                small
                class="ml-2 mb-1"
                v-on="on"
              >
                mdi-help-circle
              </v-icon>
            </template>
            <v-card width="20vw">
              <v-card-text>
                Public workspaces are readable by all users, even those who are not logged in.
                You can revoke this at any time by unchecking the box.
              </v-card-text>
            </v-card>
          </v-menu>
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
import type { PropType, Ref } from 'vue';
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import type { WorkspacePermissionsSpec, UserSpec } from 'multinet';
import { cloneDeep, debounce } from 'lodash';
import api from '@/api';

import store from '@/store';
import type {
  Role,
  SingularRole,
} from '@/utils/permissions';
import {
  RoleLevel,
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

export default defineComponent({
  name: 'PermissionsDialog',
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const permDialog = ref(false);
    const mutablePermissions: Ref<WorkspacePermissionsSpec | null> = ref(null);
    const userSearchString: Ref<string | null> = ref(null);
    const userSearchResults: Ref<UserSearchResult[]> = ref([]);
    const newUserSelection: Ref<UserSpec[]> = ref([]);

    const publicToggle = ref(true);
    watch(publicToggle, (val) => {
      if (mutablePermissions.value) {
        mutablePermissions.value.public = val;
      }
    });

    const filteredWorkspacePermissions = computed(() => {
      // Used to remove the `public` field in the permissions object.
      if (mutablePermissions.value === null) { return null; }

      const {
        owner, maintainers, readers, writers,
      } = mutablePermissions.value;

      return {
        owner,
        maintainers,
        readers,
        writers,
      };
    });
    const userPermissionsList = computed(() => {
      const userPermissionList: UserPermissionSpec[] = [];
      if (filteredWorkspacePermissions.value === null) {
        return userPermissionList;
      }

      const roles = Object.keys(
        filteredWorkspacePermissions.value,
      ) as Role[];

      roles.forEach((role) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const roleUsers = filteredWorkspacePermissions.value![role];

        if (roleUsers) {
          if (role === 'owner') {
            userPermissionList.push({ role, user: roleUsers as UserSpec });
          } else {
            (roleUsers as UserSpec[]).forEach((user: UserSpec) => {
              userPermissionList.push({ role, user });
            });
          }
        }
      });

      return userPermissionList;
    });

    async function searchUsers(query: string) {
      if (userSearchString.value === null) { return; }

      const userPermissionList = userPermissionsList.value as UserPermissionSpec[];
      const userInWorkspace = (user: UserSpec) => (userPermissionList.find((userPerm) => userPerm.user.id === user.id));

      const result = await api.searchUsers(query);
      const mappedResults: UserSearchResult[] = result
        .map((user) => ({ ...user, listing: `${user.first_name} ${user.last_name} (${user.email})` }))
        .filter((user) => !userInWorkspace(user));

      userSearchResults.value = mappedResults;
    }
    const throttledUserSearch = debounce(searchUsers, 200);

    const workspacePermissionsEditable = computed(() => store.getters.permissionLevel >= RoleLevel.maintainer);

    function initMutableData(permissions: WorkspacePermissionsSpec) {
      mutablePermissions.value = cloneDeep(permissions);
      publicToggle.value = permissions.public;
    }

    // Workspace permissions setup
    const permissions: Ref<WorkspacePermissionsSpec | null> = ref(null);
    api.getWorkspacePermissions(props.workspace).then((data) => { permissions.value = data; });
    watch(permissions, (val) => {
      if (val !== null) {
        initMutableData(val);
      }
    });

    function singularRoleToPlural(role: SingularRole): Role {
      if (role === 'owner') { return role; }

      return `${role}s` as Role;
    }
    function pluralRoleToSingular(role: Role): SingularRole {
      if (role === 'owner') { return role; }

      return role.slice(0, -1) as SingularRole;
    }
    function setRoleForUser(user: UserSpec, currentRole: Role, newRole: Role) {
      if (mutablePermissions.value === null) {
        return;
      }

      // Currently don't allow changing owners
      if (newRole !== currentRole && newRole !== 'owner' && currentRole !== 'owner') {
        mutablePermissions.value[newRole].push(user);
        mutablePermissions.value[currentRole] = mutablePermissions.value[currentRole].filter((x) => x.id !== user.id);
      }
    }
    function setRoleForAllUsers(role: Role) {
      if (mutablePermissions.value === null) {
        return;
      }
      const userList: UserSpec[] = userPermissionsList.value
        .filter((user: UserPermissionSpec) => user.role !== 'owner')
        .map((user) => user.user);

      mutablePermissions.value = {
        owner: mutablePermissions.value.owner,
        public: mutablePermissions.value.public,
        maintainers: [],
        writers: [],
        readers: [],
        [role]: userList,
      };
    }
    function removeUserPermissions(user: UserSpec, currentRole: Role) {
      if (currentRole === 'owner' || mutablePermissions.value === null) return;

      const newRoleList = mutablePermissions.value[currentRole].filter((x) => x.id !== user.id);

      mutablePermissions.value[currentRole] = newRoleList;
    }
    async function setPermissions() {
      if (mutablePermissions.value === null) {
        return;
      }
      try {
        await api.setWorkspacePermissions(props.workspace, mutablePermissions.value);
        permDialog.value = false;
      } catch (error) {
        // TODO #205
      }
    }
    function resetUserSearch() {
      newUserSelection.value = [];
      userSearchResults.value = [];
      userSearchString.value = null;
    }
    function cancelChange() {
      if (permissions.value === null) {
        return;
      }
      permDialog.value = false;
      initMutableData(permissions.value);
      resetUserSearch();
    }
    function addSelectedUsers() {
      if (mutablePermissions.value === null) {
        return;
      }

      mutablePermissions.value.readers.push(...newUserSelection.value);
      resetUserSearch();
    }

    return {
      assignableRoleListing,
      totalRoleListing,
      permDialog,
      publicToggle,
      mutablePermissions,
      throttledUserSearch,
      userSearchString,
      userSearchResults,
      newUserSelection,
      workspacePermissionsEditable,
      setPermissions,
      cancelChange,
      userPermissionsList,
      pluralRoleToSingular,
      addSelectedUsers,
      singularRoleToPlural,
      setRoleForUser,
      setRoleForAllUsers,
      removeUserPermissions,
    };
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
