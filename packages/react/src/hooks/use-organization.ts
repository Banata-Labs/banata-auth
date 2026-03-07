"use client";

import type { Organization } from "@banata-auth/shared";
import { useBanataAuth } from "../provider";

export interface UseOrganizationReturn {
	organization: Organization | null;
	isLoading: boolean;
	/** Set the active organization for the session. Pass null to clear. */
	setActiveOrganization: (organizationId: string | null) => Promise<void>;
}

/**
 * Hook to access the current active organization.
 *
 * @example
 * ```tsx
 * function OrgSwitcher({ organizations }) {
 *   const { organization, isLoading, setActiveOrganization } = useOrganization();
 *   if (isLoading) return <Spinner />;
 *   return (
 *     <select
 *       value={organization?.id ?? ""}
 *       onChange={(e) => setActiveOrganization(e.target.value || null)}
 *     >
 *       <option value="">No organization</option>
 *       {organizations.map((org) => (
 *         <option key={org.id} value={org.id}>{org.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useOrganization(): UseOrganizationReturn {
	const { organization, isLoading, setActiveOrganization } = useBanataAuth();
	return { organization, isLoading, setActiveOrganization };
}
