import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FlaskConical,
  FolderKanban,
  Home,
  Landmark,
  Lightbulb,
  Map as MapIcon,
  Search,
  Settings,
  Shield,
  Upload,
} from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { canViewDepartmentData, isAdmin } from '../../lib/roles';

/**
 * Dashboard navigation definitions.
 *
 * Kept in a plain module (rather than beside the sidebar component) so both the desktop
 * sidebar and the mobile menu render the same list, and so the sidebar file only exports a
 * component — which is what the react-refresh lint rule requires.
 */

export interface NavItem {
  name: string;
  path: string;
  icon: typeof Home;
  requiredRoles?: UserRole[];
}

export const BASE_NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/dashboard', icon: Home },
  { name: 'My Uploads', path: '/dashboard/uploads', icon: Upload },
  { name: 'My Workspaces', path: '/dashboard/workspaces', icon: FolderKanban },
  { name: 'Saved Searches', path: '/dashboard/saved-searches', icon: Search },
  { name: 'My Simulations', path: '/dashboard/simulations', icon: Activity },
  { name: 'Innovation Submissions', path: '/dashboard/innovation', icon: Lightbulb },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

/** Public platform sections, so signed-in users can navigate the whole site. */
export const PLATFORM_NAV_ITEMS: NavItem[] = [
  { name: 'Home', path: '/', icon: Landmark },
  { name: 'Knowledge Repository', path: '/repository', icon: BookOpen },
  { name: 'GIS Explorer', path: '/gis-explorer', icon: MapIcon },
  { name: 'Dashboards', path: '/dashboards', icon: BarChart3 },
  { name: 'Simulation Lab', path: '/simulation-lab', icon: FlaskConical },
  { name: 'Innovation Portal', path: '/innovation-portal', icon: Lightbulb },
];

export const ROLE_SPECIFIC_NAV_ITEMS: NavItem[] = [
  {
    name: 'Department/Institution Data',
    path: '/dashboard/department-data',
    icon: Database,
    requiredRoles: ['policymaker', 'admin'],
  },
  {
    name: 'Admin Panel',
    path: '/dashboard/admin',
    icon: Shield,
    requiredRoles: ['admin'],
  },
];

/**
 * Navigation for a given role. Role-specific entries are decided from the real role in
 * public.profiles, so the Admin Panel link cannot be unlocked by editing client metadata.
 */
export function getDashboardNavItems(role: UserRole | null): NavItem[] {
  return [
    ...BASE_NAV_ITEMS,
    ...ROLE_SPECIFIC_NAV_ITEMS.filter((item) => {
      if (item.path.endsWith('/admin')) return isAdmin(role);
      if (item.path.endsWith('/department-data')) return canViewDepartmentData(role);
      return !item.requiredRoles || (role !== null && item.requiredRoles.includes(role));
    }),
  ];
}
