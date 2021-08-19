export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader';

export const RoleOrdering: Record<SingularRole, number> = {
  owner: 4,
  maintainer: 3,
  writer: 2,
  reader: 1,
};
