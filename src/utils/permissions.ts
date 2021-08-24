export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader' | null;

export enum RoleLevel {
  owner = 4,
  maintainer = 3,
  writer = 2,
  reader = 1,
  none = 0,
}
