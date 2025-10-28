import { SidebarIconKey } from '../components/sidebar/sidebar-icons';

export interface MenuItem {
  label: string;
  path?: string; // Router path
  iconKey: SidebarIconKey; // key in sidebarIcons map (typed)
  requiredPermissions?: string[]; // permissions needed to show
  requireAll?: boolean; // whether all permissions required (default false: any)
  disabled?: boolean; // show but disabled
  devNote?: string; // optional badge text like Under Development
  children?: MenuItem[]; // future nested support
  section?: string; // optional section title marker
}
