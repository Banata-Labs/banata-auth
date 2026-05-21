import { BanataAuthProvider } from "@banata-auth/react";
import type { Organization } from "@banata-auth/shared";
import type { PropsWithChildren } from "react";
import { authClient } from "./auth-client";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function unwrapSessionPayload(payload: unknown) {
	if (isRecord(payload) && isRecord(payload.data)) {
		return payload.data;
	}
	return payload;
}

function unwrapOrganizationPayload(payload: unknown): Organization | null {
	if (isRecord(payload) && isRecord(payload.data)) {
		return payload.data as unknown as Organization;
	}
	if (isRecord(payload)) {
		return payload as unknown as Organization;
	}
	return null;
}

export function AuthProvider({ children }: PropsWithChildren) {
	return (
		<BanataAuthProvider
			adapter={{
				fetchSession: async () => {
					const sessionPayload = unwrapSessionPayload(await authClient.getSession());
					if (
						!isRecord(sessionPayload) ||
						!isRecord(sessionPayload.user) ||
						!isRecord(sessionPayload.session)
					) {
						return null;
					}

					const activeOrganizationId =
						typeof sessionPayload.session.activeOrganizationId === "string"
							? sessionPayload.session.activeOrganizationId
							: null;

					const organization = activeOrganizationId
						? unwrapOrganizationPayload(
								await authClient.organization.getFullOrganization({
									query: { organizationId: activeOrganizationId },
								}),
							)
						: null;

					return {
						user: sessionPayload.user as never,
						session: sessionPayload.session as never,
						organization,
					};
				},
				signOut: async () => {
					await authClient.signOut();
				},
				setActiveOrganization: async (organizationId) => {
					if (!organizationId) {
						return;
					}
					await authClient.organization.setActive({ organizationId });
				},
			}}
		>
			{children}
		</BanataAuthProvider>
	);
}
