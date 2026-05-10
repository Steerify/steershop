import { User, UserRole } from "@/types/api";

/**
 * Role-Based Access Control (RBAC) Utility
 * 
 * Centralizes all user role checks to avoid hardcoding strings and
 * ensure consistent security logic across the application.
 */
export const rbac = {
  /**
   * Check if user is an Entrepreneur (Vendor)
   */
  isEntrepreneur: (user: any): boolean => {
    return user?.role === UserRole.ENTREPRENEUR;
  },

  /**
   * Check if user is a Customer
   */
  isCustomer: (user: any): boolean => {
    return user?.role === UserRole.CUSTOMER;
  },

  /**
   * Check if user is an Administrator
   */
  isAdmin: (user: any): boolean => {
    return user?.role === UserRole.ADMIN;
  },

  /**
   * Check if user can access the Vendor Dashboard
   */
  canAccessVendorDashboard: (user: any): boolean => {
    return user?.role === UserRole.ENTREPRENEUR || user?.role === UserRole.ADMIN;
  },

  /**
   * Check if user is the owner of a specific resource or an admin
   */
  isOwner: (user: any, ownerId: string | undefined): boolean => {
    if (!user || !ownerId) return false;
    return user.id === ownerId || user.role === UserRole.ADMIN;
  },

  /**
   * Get the primary landing page for a user based on their role
   */
  getLandingPage: (user: any): string => {
    if (user?.role === UserRole.ADMIN) return "/admin";
    if (user?.role === UserRole.ENTREPRENEUR) return "/dashboard";
    return "/shopper";
  }
};
