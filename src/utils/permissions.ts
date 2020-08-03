import { WorkspacePermissionsSpec, UserSpec } from 'multinet';

export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader';

export function canChangeWorkspacePermissions(userInfo: UserSpec | null, permissions: WorkspacePermissionsSpec | null): boolean {
  if (!userInfo || !permissions) { return false; }

  const userSub = userInfo.sub;
  const ownerSub = permissions.owner.sub;
  const maintainerSubs = permissions.maintainers.map((user) => user.sub);

  if (maintainerSubs.includes(userSub) || userSub === ownerSub) {
    return true;
  }

  return false;
}
