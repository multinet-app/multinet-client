import { WorkspacePermissionsSpec, UserSpec } from 'multinet';

export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader';

export function canChangeWorkspacePermissions(userInfo: UserSpec | null, permissions: WorkspacePermissionsSpec | null): boolean {
  if (!userInfo || !permissions) { return false; }

  const userId = userInfo.id;
  const ownerId = permissions.owner.id;
  const maintainerIds = permissions.maintainers.map((user) => user.id);

  if (maintainerIds.includes(userId) || userId === ownerId) {
    return true;
  }

  return false;
}
