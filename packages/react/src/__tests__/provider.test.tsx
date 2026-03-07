import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import {
  BanataAuthProvider,
  useBanataAuth,
  type BanataAuthAdapter,
} from "../provider";
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

// ─── Test Consumer Component ─────────────────────────────────────────────────

function TestConsumer() {
  const auth = useBanataAuth();
  return (
    <div>
      <span data-testid="user">{auth.user?.name ?? "none"}</span>
      <span data-testid="email">{auth.user?.email ?? "none"}</span>
      <span data-testid="session">{auth.session?.id ?? "none"}</span>
      <span data-testid="organization">{auth.organization?.name ?? "none"}</span>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <button data-testid="signout" onClick={() => auth.signOut()}>
        Sign Out
      </button>
      <button data-testid="refresh" onClick={() => auth.refresh()}>
        Refresh
      </button>
      <button
        data-testid="set-org"
        onClick={() => auth.setActiveOrganization("org_456")}
      >
        Set Org
      </button>
      <button
        data-testid="clear-org"
        onClick={() => auth.setActiveOrganization(null)}
      >
        Clear Org
      </button>
    </div>
  );
}

// ─── Controlled Mode Tests ───────────────────────────────────────────────────

describe("BanataAuthProvider — Controlled Mode", () => {
  it("renders children", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <span data-testid="child">Hello</span>
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("provides user/session/organization to context when passed as props", () => {
    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        organization={mockOrganization}
      >
        <TestConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("email")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("session")).toHaveTextContent("ses_123");
    expect(screen.getByTestId("organization")).toHaveTextContent("Test Org");
  });

  it("isAuthenticated is true when user and session are provided", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <TestConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("isAuthenticated is false when user is null", () => {
    render(
      <BanataAuthProvider user={null} session={null}>
        <TestConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("isLoading defaults to false in controlled mode", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <TestConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("isLoading can be set to true in controlled mode", () => {
    render(
      <BanataAuthProvider user={null} session={null} isLoading={true}>
        <TestConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("signOut calls onSignOut prop", async () => {
    const onSignOut = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        onSignOut={onSignOut}
      >
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("signout").click();
    });

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("setActiveOrganization calls onSetActiveOrganization prop", async () => {
    const onSetActiveOrganization = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        onSetActiveOrganization={onSetActiveOrganization}
      >
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("set-org").click();
    });

    expect(onSetActiveOrganization).toHaveBeenCalledOnce();
    expect(onSetActiveOrganization).toHaveBeenCalledWith("org_456");
  });

  it("setActiveOrganization passes null when clearing", async () => {
    const onSetActiveOrganization = vi.fn().mockResolvedValue(undefined);

    render(
      <BanataAuthProvider
        user={mockUser}
        session={mockSession}
        onSetActiveOrganization={onSetActiveOrganization}
      >
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await act(async () => {
      screen.getByTestId("clear-org").click();
    });

    expect(onSetActiveOrganization).toHaveBeenCalledWith(null);
  });

  it("user can be null in controlled mode (unauthenticated)", () => {
    render(
      <BanataAuthProvider user={null} session={null}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("organization defaults to null when not provided in controlled mode", () => {
    render(
      <BanataAuthProvider user={mockUser} session={mockSession}>
        <TestConsumer />
      </BanataAuthProvider>,
    );
    expect(screen.getByTestId("organization")).toHaveTextContent("none");
  });
});

// ─── Adapter Mode Tests ─────────────────────────────────────────────────────

describe("BanataAuthProvider — Adapter Mode", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  function createMockAdapter(
    overrides: Partial<BanataAuthAdapter> = {},
  ): BanataAuthAdapter {
    return {
      fetchSession: vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
        organization: mockOrganization,
      }),
      signOut: vi.fn().mockResolvedValue(undefined),
      setActiveOrganization: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it("calls adapter.fetchSession on mount", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(adapter.fetchSession).toHaveBeenCalledOnce();
    });
  });

  it("sets user/session from adapter result", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    });

    expect(screen.getByTestId("session")).toHaveTextContent("ses_123");
    expect(screen.getByTestId("organization")).toHaveTextContent("Test Org");
  });

  it("sets isAuthenticated to true when adapter returns data", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });

  it("sets isAuthenticated to false when adapter returns null", async () => {
    const adapter = createMockAdapter({
      fetchSession: vi.fn().mockResolvedValue(null),
    });

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
  });

  it("handles adapter.fetchSession failure gracefully", async () => {
    const adapter = createMockAdapter({
      fetchSession: vi.fn().mockRejectedValue(new Error("Network error")),
    });

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[BanataAuth] Failed to fetch session:",
      expect.any(Error),
    );
  });

  it("signOut calls adapter.signOut and clears state", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Sign out
    await act(async () => {
      screen.getByTestId("signout").click();
    });

    expect(adapter.signOut).toHaveBeenCalledOnce();
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("refresh re-fetches via adapter", async () => {
    const fetchSession = vi
      .fn()
      .mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      })
      .mockResolvedValueOnce({
        user: { ...mockUser, name: "Updated User" },
        session: mockSession,
      });

    const adapter = createMockAdapter({ fetchSession });

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    });

    // Refresh
    await act(async () => {
      screen.getByTestId("refresh").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Updated User");
    });

    expect(fetchSession).toHaveBeenCalledTimes(2);
  });

  it("setActiveOrganization calls adapter.setActiveOrganization", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Set org
    await act(async () => {
      screen.getByTestId("set-org").click();
    });

    expect(adapter.setActiveOrganization).toHaveBeenCalledOnce();
    expect(adapter.setActiveOrganization).toHaveBeenCalledWith("org_456");
    // fetchSession is called again after setActiveOrganization (initial + re-fetch)
    expect(adapter.fetchSession).toHaveBeenCalledTimes(2);
  });

  it("shows loading state initially in adapter mode", () => {
    const adapter = createMockAdapter({
      // Never-resolving promise to keep loading state
      fetchSession: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("does not call adapter.fetchSession in controlled mode", async () => {
    const adapter = createMockAdapter();

    render(
      <BanataAuthProvider adapter={adapter} user={mockUser} session={mockSession}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    // Give time for any potential async calls
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(adapter.fetchSession).not.toHaveBeenCalled();
  });

  it("handles adapter without setActiveOrganization gracefully", async () => {
    const adapter: BanataAuthAdapter = {
      fetchSession: vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      }),
      signOut: vi.fn().mockResolvedValue(undefined),
      // No setActiveOrganization
    };

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Should not throw when setActiveOrganization is undefined on adapter
    await act(async () => {
      screen.getByTestId("set-org").click();
    });

    // fetchSession should not be called again since setActiveOrganization is undefined
    expect(adapter.fetchSession).toHaveBeenCalledTimes(1);
  });

  it("sets organization to null when adapter returns no organization", async () => {
    const adapter = createMockAdapter({
      fetchSession: vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
        // No organization field
      }),
    });

    render(
      <BanataAuthProvider adapter={adapter}>
        <TestConsumer />
      </BanataAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("organization")).toHaveTextContent("none");
  });
});

// ─── Error Tests ─────────────────────────────────────────────────────────────

describe("useBanataAuth — Error handling", () => {
  it("throws when used outside provider", () => {
    // Suppress React error boundary console output
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    function BadComponent() {
      useBanataAuth();
      return <div />;
    }

    expect(() => render(<BadComponent />)).toThrow(
      "useBanataAuth must be used within a BanataAuthProvider",
    );

    consoleErrorSpy.mockRestore();
  });
});
