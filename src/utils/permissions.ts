import { UserSpec, WorkspacePermissionsSpec } from 'multinet';

export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader' | null;

export enum RoleLevel {
  owner = 4,
  maintainer = 3,
  writer = 2,
  reader = 1,
  none = 0,
}

export function canUpload(userInfo: UserSpec | null, permissions: WorkspacePermissionsSpec | null): boolean {
  if (!userInfo || !permissions) { return false; }

  const userSub = userInfo.username;
  const ownerSub = permissions.owner.username;
  const maintainerSubs = permissions.maintainers.map((user) => user.username);
  const writerSubs = permissions.writers.map((user) => user.username);

  return maintainerSubs.includes(userSub)
    || writerSubs.includes(userSub)
    || userSub === ownerSub;
}
