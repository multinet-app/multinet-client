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

  const userSub = userInfo.sub;
  const ownerSub = permissions.owner.sub;
  const maintainerSubs = permissions.maintainers.map((user) => user.sub);
  const writerSubs = permissions.writers.map((user) => user.sub);

  return maintainerSubs.includes(userSub)
    || writerSubs.includes(userSub)
    || userSub === ownerSub;
}
