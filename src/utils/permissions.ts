import { WorkspacePermissionsSpec } from 'multinet';
import { State } from '@/store';


export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader';


export function canChangeWorkspacePermissions(state: State, permissions: WorkspacePermissionsSpec) {
  if (state.userInfo === null) { return false; }

  const userSub = state.userInfo.sub;
  const ownerSub = permissions.owner.sub;
  const maintainerSubs = permissions.maintainers.map((user) => user.sub);

  if (maintainerSubs.includes(userSub) || userSub === ownerSub) {
    return true;
  }

  return false;
}
