import { ROLES } from "./roles";

export const canAccessUsers = (role: string) =>
  role === ROLES.OWNER;

export const canAccessReports = (role: string) =>
  role === ROLES.OWNER ||
  role === ROLES.MANAGER;