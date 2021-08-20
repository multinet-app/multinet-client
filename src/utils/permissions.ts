export type Role = 'owner' | 'maintainers' | 'writers' | 'readers';
export type SingularRole = 'owner' | 'maintainer' | 'writer' | 'reader' | null;

export function getRoleOrdinal(role: SingularRole): number {
  switch (role) {
    case 'owner':
      return 4;
    case 'maintainer':
      return 3;
    case 'writer':
      return 2;
    case 'reader':
      return 1;
    default:
      return 0;
  }
}
