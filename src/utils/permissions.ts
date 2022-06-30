export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader' | null;

// Not sure why this error shows up here
// eslint-disable-next-line no-shadow
export enum RoleLevel {
  owner = 4,
  maintainer = 3,
  writer = 2,
  reader = 1,
  none = 0,
}
