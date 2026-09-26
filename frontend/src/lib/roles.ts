import type { UserRole } from '../types/auth';

/** Human-readable names for the roles stored in public.profiles.role. */
export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen',
  researcher: 'Verified Researcher',
  policymaker: 'Government Official',
  admin: 'Administrator',
};

/** Only the `admin` role may open the Admin Panel. */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}

/**
 * Roles allowed to see a department/institution data section. There is no institution
 * membership table yet, so this only decides whether the informational page is linked.
 */
export function canViewDepartmentData(role: UserRole | null): boolean {
  return role === 'policymaker' || role === 'admin';
}

export function roleLabel(role: UserRole | null): string | null {
  return role ? (ROLE_LABELS[role] ?? role) : null;
}
