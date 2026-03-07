import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import { BanataAuthProvider } from "../provider";
import { useUser } from "../hooks/use-user";
import { useSession } from "../hooks/use-session";
import { useOrganization } from "../hooks/use-organization";
import type { User, Session, Organization } from "@banata-auth/shared";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: "usr_123",
  email: "test@example.com",
  name: "Test User",
  emailVerified: true,
  image: null,
  username: null,
  phoneNumber: null,
  phoneNumberVerified: false,
  role: "user" as const,
  banned: false,
  banReason: null,
  banExpires: null,
  twoFactorEnabled: false,
  metadata: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockSession: Session = {
  id: "ses_123",
  userId: "usr_123",
  token: "test-token",
  expiresAt: new Date(Date.now() + 86400000),
  ipAddress: null,
  userAgent: null,
  activeOrganizationId: null,
  impersonatedBy: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockOrganization: Organization = {
  id: "org_123",
  name: "Test Org",
  slug: "test-org",
  logo: null,
  metadata: null,
  requireMfa: false,
  ssoEnforced: false,
  allowedEmailDomains: null,
  maxMembers: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

// ─── useUser Tests ───────────────────────────────────────────────────────────

describe("useUser", () => {
  function UserConsumer() {
    const { user, isLoading, isAuthenticated, signOut } = useUser();
    return (
      <div>
        <span data-testid="user-name">{user?.name ?? "none"}</span>
        <span data-testid="user-email">{user?.email ?? "none"}</span>
        <span data-testid="user-id">{user?.id ?? "none"}</span>
        <span data-testid="loading">{String(isLoading)}</span>
        <span data-testid="authenticated">{String(isAuthenticated)}</span>
        <button data-testid="signout" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>
    );
  }

  it("returns user from context", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <UserConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com",
    );
    expect(screen.getByTestId("user-id")).toHaveTextContent("usr_123");
  });

  it("returns null user when unauthenticated", () => {
    render(
      <BanataAuthProvider user={null} session={null}>
        <UserConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent("none");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(screen.getByTestId("user-id")).toHaveTextContent("none");
  });

  it("returns isLoading from context", () => {
    render(
      <BanataAuthProvider user={null} session={null} isLoading={true}>
        <UserConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("returns isLoading false by default", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <UserConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("returns isAuthenticated from context", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <UserConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("returns isAuthenticated false when not authenticated", () => {
    render(
      <BanataAuthProvider user={null} session={null}>
        <UserConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("returns signOut from context", async () => {
    const onSignOut = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        onSignOut={onSignOut}
      >
        <UserConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("signout").click();
    });

    expect(onSignOut).toHaveBeenCalledOnce();
  });
});

// ─── useSession Tests ────────────────────────────────────────────────────────

describe("useSession", () => {
  function SessionConsumer() {
    const { session, isLoading, refresh } = useSession();
    return (
      <div>
        <span data-testid="session-id">{session?.id ?? "none"}</span>
        <span data-testid="session-token">{session?.token ?? "none"}</span>
        <span data-testid="session-userId">{session?.userId ?? "none"}</span>
        <span data-testid="loading">{String(isLoading)}</span>
        <button data-testid="refresh" onClick={() => refresh()}>
          Refresh
        </button>
      </div>
    );
  }

  it("returns session from context", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <SessionConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("session-id")).toHaveTextContent("ses_123");
    expect(screen.getByTestId("session-token")).toHaveTextContent("test-token");
    expect(screen.getByTestId("session-userId")).toHaveTextContent("usr_123");
  });

  it("returns null session when unauthenticated", () => {
    render(
      <BanataAuthProvider user={null} session={null}>
        <SessionConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("session-id")).toHaveTextContent("none");
    expect(screen.getByTestId("session-token")).toHaveTextContent("none");
  });

  it("returns isLoading from context", () => {
    render(
      <BanataAuthProvider user={null} session={null} isLoading={true}>
        <SessionConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("returns isLoading false by default", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <SessionConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("returns refresh from context", async () => {
    // In controlled mode, refresh is a no-op (no adapter), but it should still be callable
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <SessionConsumer />
      </BanataAuthProvider>,
    );

    // Should not throw
    await act(async () => {
      screen.getByTestId("refresh").click();
    });
  });
});

// ─── useOrganization Tests ───────────────────────────────────────────────────

describe("useOrganization", () => {
  function OrganizationConsumer() {
    const { organization, isLoading, setActiveOrganization } =
      useOrganization();
    return (
      <div>
        <span data-testid="org-id">{organization?.id ?? "none"}</span>
        <span data-testid="org-name">{organization?.name ?? "none"}</span>
        <span data-testid="org-slug">{organization?.slug ?? "none"}</span>
        <span data-testid="loading">{String(isLoading)}</span>
        <button
          data-testid="set-org"
          onClick={() => setActiveOrganization("org_456")}
        >
          Set Org
        </button>
        <button
          data-testid="clear-org"
          onClick={() => setActiveOrganization(null)}
        >
          Clear Org
        </button>
      </div>
    );
  }

  it("returns organization from context", () => {
    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        organization={mockOrganization}
      >
        <OrganizationConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("org-id")).toHaveTextContent("org_123");
    expect(screen.getByTestId("org-name")).toHaveTextContent("Test Org");
    expect(screen.getByTestId("org-slug")).toHaveTextContent("test-org");
  });

  it("returns null organization when none is set", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <OrganizationConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("org-id")).toHaveTextContent("none");
    expect(screen.getByTestId("org-name")).toHaveTextContent("none");
    expect(screen.getByTestId("org-slug")).toHaveTextContent("none");
  });

  it("returns isLoading from context", () => {
    render(
      <BanataAuthProvider user={null} session={null} isLoading={true}>
        <OrganizationConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("returns setActiveOrganization from context", async () => {
    const onSetActiveOrganization = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        onSetActiveOrganization={onSetActiveOrganization}
      >
        <OrganizationConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("set-org").click();
    });

    expect(onSetActiveOrganization).toHaveBeenCalledOnce();
    expect(onSetActiveOrganization).toHaveBeenCalledWith("org_456");
  });

  it("setActiveOrganization can pass null to clear", async () => {
    const onSetActiveOrganization = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        organization={mockOrganization}
        onSetActiveOrganization={onSetActiveOrganization}
      >
        <OrganizationConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("clear-org").click();
    });

    expect(onSetActiveOrganization).toHaveBeenCalledWith(null);
  });
});
