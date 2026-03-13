/**
 * Auto-generated search index for client-side instant search.
 *
 * DO NOT EDIT MANUALLY -- regenerate with:
 *   bun run scripts/generate-search-index.ts
 *
 * Pages: 42
 * Total headings: 699
 */

export interface SearchIndexHeading {
	level: number;
	text: string;
	anchor: string;
	snippet: string;
}

export interface SearchIndexEntry {
	slug: string;
	title: string;
	description: string;
	section: string;
	headings: SearchIndexHeading[];
	/** Flattened lowercase text for fast substring matching */
	searchText: string;
}

export const SEARCH_INDEX: SearchIndexEntry[] = [
  {
    "slug": "account",
    "title": "Account Management",
    "description": "Manage your profile, security settings, connected accounts, and active sessions from the Banata Auth dashboard.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Profile",
        "anchor": "profile",
        "snippet": "The Profile page lets you update your personal information and manage the sign-in methods linked to your account."
      },
      {
        "level": 3,
        "text": "Updating Your Name and Avatar",
        "anchor": "updating-your-name-and-avatar",
        "snippet": "You can change your display name and avatar directly from the dashboard:"
      },
      {
        "level": 3,
        "text": "Changing Your Email",
        "anchor": "changing-your-email",
        "snippet": "To change your email address:"
      },
      {
        "level": 3,
        "text": "Connected Accounts",
        "anchor": "connected-accounts",
        "snippet": "The Connected Accounts section shows every sign-in method linked to your account:"
      },
      {
        "level": 3,
        "text": "Deleting Your Account",
        "anchor": "deleting-your-account",
        "snippet": "You can permanently delete your account from the bottom of the Profile page. To confirm, type DELETE in the confirmation field and submit. A confirmation email is sent before deletion is finalized."
      },
      {
        "level": 2,
        "text": "Security",
        "anchor": "security",
        "snippet": "The Security page is where you manage your authentication credentials and review active sessions."
      },
      {
        "level": 3,
        "text": "Changing Your Password",
        "anchor": "changing-your-password",
        "snippet": "To change your password:"
      },
      {
        "level": 3,
        "text": "Setting Up Two-Factor Authentication (TOTP)",
        "anchor": "setting-up-two-factor-authentication-totp",
        "snippet": "TOTP-based two-factor authentication adds an extra layer of security to your account. Here is the step-by-step setup flow:"
      },
      {
        "level": 3,
        "text": "Managing Active Sessions",
        "anchor": "managing-active-sessions",
        "snippet": "The Active Sessions section lists every device where you are currently signed in. Each entry shows:"
      },
      {
        "level": 2,
        "text": "Auth Client Methods",
        "anchor": "auth-client-methods",
        "snippet": "If you are building a custom account management UI, the following authClient methods are available. All methods return { data, error }."
      },
      {
        "level": 2,
        "text": "Client Plugins",
        "anchor": "client-plugins",
        "snippet": "The dashboard auth client includes the twoFactorClient() plugin for 2FA methods. If you are building a custom UI, import it from the react package:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Settings -- Configure your project name and team. Authentication -- Set up authentication methods for your project. Radar & Bot Protection -- Configure bot detection for your auth endpoints."
      }
    ],
    "searchText": "account management manage your profile, security settings, connected accounts, and active sessions from the banata auth dashboard. profile the profile page lets you update your personal information and manage the sign-in methods linked to your account. updating your name and avatar you can change your display name and avatar directly from the dashboard: changing your email to change your email address: connected accounts the connected accounts section shows every sign-in method linked to your account: deleting your account you can permanently delete your account from the bottom of the profile page. to confirm, type delete in the confirmation field and submit. a confirmation email is sent before deletion is finalized. security the security page is where you manage your authentication credentials and review active sessions. changing your password to change your password: setting up two-factor authentication (totp) totp-based two-factor authentication adds an extra layer of security to your account. here is the step-by-step setup flow: managing active sessions the active sessions section lists every device where you are currently signed in. each entry shows: auth client methods if you are building a custom account management ui, the following authclient methods are available. all methods return { data, error }. client plugins the dashboard auth client includes the twofactorclient() plugin for 2fa methods. if you are building a custom ui, import it from the react package: next steps settings -- configure your project name and team. authentication -- set up authentication methods for your project. radar & bot protection -- configure bot detection for your auth endpoints."
  },
  {
    "slug": "addons",
    "title": "Add-ons",
    "description": "Extend your project with third-party integrations — Google Analytics, Segment, Stripe, and PostHog.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Available Add-ons",
        "anchor": "available-add-ons",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Enabling and Disabling Add-ons",
        "anchor": "enabling-and-disabling-add-ons",
        "snippet": "You manage all add-ons from the dashboard:"
      },
      {
        "level": 2,
        "text": "Setting Up Each Add-on",
        "anchor": "setting-up-each-add-on",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Google Analytics",
        "anchor": "google-analytics",
        "snippet": "Enable the Google Analytics add-on in the dashboard. Add your Google Analytics measurement ID to your application's environment variables. Auth events such as sign-up and sign-in are automatically att"
      },
      {
        "level": 3,
        "text": "Segment",
        "anchor": "segment",
        "snippet": "Enable the Segment add-on in the dashboard. Add your Segment write key to your application's environment variables. Auth events are sent to Segment as track calls."
      },
      {
        "level": 3,
        "text": "Stripe",
        "anchor": "stripe",
        "snippet": "Enable the Stripe add-on in the dashboard. Add your Stripe API keys to your application's environment variables. When a user is created, a corresponding Stripe customer is provisioned automatically."
      },
      {
        "level": 3,
        "text": "PostHog",
        "anchor": "posthog",
        "snippet": "Enable the PostHog add-on in the dashboard. Add your PostHog API key and host URL to your application's environment variables. Auth events are sent to PostHog as custom events."
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Admin-only access — Only admin users can enable or disable add-ons. API keys in environment variables — Third-party service credentials should always be stored in environment variables, not in the add"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": "Add-on is enabled but no data appears in the third-party service"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Radar & Bot Protection — AI-powered bot detection and fraud prevention Webhooks — Get notified about auth events Audit Logs — Track all authentication activity"
      }
    ],
    "searchText": "add-ons extend your project with third-party integrations — google analytics, segment, stripe, and posthog. available add-ons --- enabling and disabling add-ons you manage all add-ons from the dashboard: setting up each add-on google analytics enable the google analytics add-on in the dashboard. add your google analytics measurement id to your application's environment variables. auth events such as sign-up and sign-in are automatically att segment enable the segment add-on in the dashboard. add your segment write key to your application's environment variables. auth events are sent to segment as track calls. stripe enable the stripe add-on in the dashboard. add your stripe api keys to your application's environment variables. when a user is created, a corresponding stripe customer is provisioned automatically. posthog enable the posthog add-on in the dashboard. add your posthog api key and host url to your application's environment variables. auth events are sent to posthog as custom events. security considerations admin-only access — only admin users can enable or disable add-ons. api keys in environment variables — third-party service credentials should always be stored in environment variables, not in the add troubleshooting add-on is enabled but no data appears in the third-party service next steps radar & bot protection — ai-powered bot detection and fraud prevention webhooks — get notified about auth events audit logs — track all authentication activity"
  },
  {
    "slug": "anonymous-auth",
    "title": "Anonymous Authentication",
    "description": "Let users interact with your app without an account, then upgrade to a full account while preserving their data.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Use Cases",
        "anchor": "use-cases",
        "snippet": "Anonymous auth shines wherever you want to reduce friction and let people experience your product before committing:"
      },
      {
        "level": 2,
        "text": "Enable Anonymous Auth",
        "anchor": "enable-anonymous-auth",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard",
        "anchor": "via-the-dashboard",
        "snippet": "Go to Authentication > Methods in your project. Toggle on Anonymous. Make sure at least one upgrade method is also enabled (Email & Password, Social OAuth, Magic Links, etc.) so anonymous users have a"
      },
      {
        "level": 3,
        "text": "Via the SDK",
        "anchor": "via-the-sdk",
        "snippet": "You can also enable anonymous auth programmatically:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Create an Anonymous Session",
        "anchor": "create-an-anonymous-session",
        "snippet": "Call authClient.signIn.anonymous() to create a guest session. This generates a user record with no credentials and returns a fully functional session:"
      },
      {
        "level": 3,
        "text": "Check if the Current User Is Anonymous",
        "anchor": "check-if-the-current-user-is-anonymous",
        "snippet": "Use the isAnonymous flag to decide what UI to show -- for example, displaying an upgrade banner or restricting certain features:"
      },
      {
        "level": 3,
        "text": "Upgrade to Email & Password",
        "anchor": "upgrade-to-email-password",
        "snippet": "Link an email and password to the anonymous user, converting them to a full account:"
      },
      {
        "level": 3,
        "text": "Upgrade via Social OAuth",
        "anchor": "upgrade-via-social-oauth",
        "snippet": "Anonymous users can also upgrade by linking a social account:"
      },
      {
        "level": 2,
        "text": "Complete Component Example",
        "anchor": "complete-component-example",
        "snippet": "Here is a full React component that wraps your app with anonymous session management and an upgrade banner:"
      },
      {
        "level": 2,
        "text": "What's Preserved on Upgrade",
        "anchor": "whats-preserved-on-upgrade",
        "snippet": "When an anonymous user upgrades to a full account, the upgrade is an in-place mutation of the existing user record -- not a creation of a new one. This means all foreign key relationships to the user "
      },
      {
        "level": 2,
        "text": "What Changes on Upgrade",
        "anchor": "what-changes-on-upgrade",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Cleanup of Stale Anonymous Accounts",
        "anchor": "cleanup-of-stale-anonymous-accounts",
        "snippet": "Anonymous users who never upgrade will accumulate over time. You should plan for cleanup from the start."
      },
      {
        "level": 3,
        "text": "Automatic Cleanup",
        "anchor": "automatic-cleanup",
        "snippet": "You can configure a maximum age for anonymous accounts in your dashboard under Authentication > Methods > Anonymous > Settings, or via the SDK:"
      },
      {
        "level": 3,
        "text": "Manual Cleanup via Admin SDK",
        "anchor": "manual-cleanup-via-admin-sdk",
        "snippet": "If you prefer more control, you can clean up stale anonymous accounts programmatically:"
      },
      {
        "level": 2,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "Anonymous session creation is rate-limited to prevent abuse:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Rate limits are your first line of defense. Without them, anonymous auth can be abused to create unlimited user records. The built-in limit of 30 per minute per IP keeps this in check."
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"User is not anonymous\"",
        "anchor": "user-is-not-anonymous",
        "snippet": "You called the upgrade endpoint on a user whose isAnonymous flag is already false. Only anonymous users can be upgraded. If the user already has credentials, they are a full account."
      },
      {
        "level": 3,
        "text": "\"Email already in use\"",
        "anchor": "email-already-in-use",
        "snippet": "The email provided during upgrade belongs to another existing user. An anonymous user cannot claim an email that is already registered. You may want to prompt the user to sign in to the existing accou"
      },
      {
        "level": 3,
        "text": "\"Anonymous session expired\"",
        "anchor": "anonymous-session-expired",
        "snippet": "The session expired before the user upgraded. The anonymous user record may still exist, but since there are no credentials to re-authenticate, the user will get a new anonymous session if they return"
      },
      {
        "level": 3,
        "text": "\"Too many anonymous accounts\"",
        "anchor": "too-many-anonymous-accounts",
        "snippet": "If you see a large number of anonymous user records, check for:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Email & Password -- The most common upgrade target for anonymous users. Social OAuth -- Let anonymous users upgrade via Google, GitHub, and more. Magic Links -- Passwordless upgrade path."
      }
    ],
    "searchText": "anonymous authentication let users interact with your app without an account, then upgrade to a full account while preserving their data. use cases anonymous auth shines wherever you want to reduce friction and let people experience your product before committing: enable anonymous auth via the dashboard go to authentication > methods in your project. toggle on anonymous. make sure at least one upgrade method is also enabled (email & password, social oauth, magic links, etc.) so anonymous users have a via the sdk you can also enable anonymous auth programmatically: client-side api create an anonymous session call authclient.signin.anonymous() to create a guest session. this generates a user record with no credentials and returns a fully functional session: check if the current user is anonymous use the isanonymous flag to decide what ui to show -- for example, displaying an upgrade banner or restricting certain features: upgrade to email & password link an email and password to the anonymous user, converting them to a full account: upgrade via social oauth anonymous users can also upgrade by linking a social account: complete component example here is a full react component that wraps your app with anonymous session management and an upgrade banner: what's preserved on upgrade when an anonymous user upgrades to a full account, the upgrade is an in-place mutation of the existing user record -- not a creation of a new one. this means all foreign key relationships to the user  what changes on upgrade --- cleanup of stale anonymous accounts anonymous users who never upgrade will accumulate over time. you should plan for cleanup from the start. automatic cleanup you can configure a maximum age for anonymous accounts in your dashboard under authentication > methods > anonymous > settings, or via the sdk: manual cleanup via admin sdk if you prefer more control, you can clean up stale anonymous accounts programmatically: rate limits anonymous session creation is rate-limited to prevent abuse: security considerations rate limits are your first line of defense. without them, anonymous auth can be abused to create unlimited user records. the built-in limit of 30 per minute per ip keeps this in check. troubleshooting \"user is not anonymous\" you called the upgrade endpoint on a user whose isanonymous flag is already false. only anonymous users can be upgraded. if the user already has credentials, they are a full account. \"email already in use\" the email provided during upgrade belongs to another existing user. an anonymous user cannot claim an email that is already registered. you may want to prompt the user to sign in to the existing accou \"anonymous session expired\" the session expired before the user upgraded. the anonymous user record may still exist, but since there are no credentials to re-authenticate, the user will get a new anonymous session if they return \"too many anonymous accounts\" if you see a large number of anonymous user records, check for: next steps email & password -- the most common upgrade target for anonymous users. social oauth -- let anonymous users upgrade via google, github, and more. magic links -- passwordless upgrade path."
  },
  {
    "slug": "api-keys",
    "title": "API Keys",
    "description": "API keys connect your application to a Banata project. Learn how to create, use, rotate, and manage API keys.",
    "section": "Start Here",
    "headings": [
      {
        "level": 2,
        "text": "Creating an API Key",
        "anchor": "creating-an-api-key",
        "snippet": "Sign in to the Banata dashboard. Select the project you want to connect your app to. Go to API Keys in the sidebar. Click Create new key. Copy the key immediately and store it securely."
      },
      {
        "level": 2,
        "text": "Using Your API Key",
        "anchor": "using-your-api-key",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "In a Next.js app",
        "anchor": "in-a-nextjs-app",
        "snippet": "Pass the API key to createBanataAuthServer in your server auth helpers:"
      },
      {
        "level": 3,
        "text": "With the admin SDK",
        "anchor": "with-the-admin-sdk",
        "snippet": "Pass the API key when creating a BanataAuth client:"
      },
      {
        "level": 2,
        "text": "How Project Scoping Works",
        "anchor": "how-project-scoping-works",
        "snippet": "Each API key belongs to exactly one project. When your app sends a request with that key, Banata automatically scopes the request to the correct project. You don't need to pass a projectId in your cod"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Store keys in environment variables",
        "anchor": "store-keys-in-environment-variables",
        "snippet": "Never hard-code API keys in your source code. Use environment variables or a secrets manager:"
      },
      {
        "level": 3,
        "text": "Use separate keys for separate concerns",
        "anchor": "use-separate-keys-for-separate-concerns",
        "snippet": "If you have multiple services connecting to the same project (e.g., your web app and a background job worker), create a separate API key for each. This way, if one key is compromised, you can revoke i"
      },
      {
        "level": 3,
        "text": "Rotate keys regularly",
        "anchor": "rotate-keys-regularly",
        "snippet": "To rotate an API key safely:"
      },
      {
        "level": 2,
        "text": "Managing API Keys with the SDK",
        "anchor": "managing-api-keys-with-the-sdk",
        "snippet": "You can also create and manage API keys programmatically:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Auth requests work in the dashboard but fail in the app",
        "anchor": "auth-requests-work-in-the-dashboard-but-fail-in-the-app",
        "snippet": "Verify BANATA_API_KEY is set in your server environment (not just .env.local — check your deployment platform too). Make sure you're using the correct key for the right project."
      },
      {
        "level": 3,
        "text": "Requests return data from the wrong project",
        "anchor": "requests-return-data-from-the-wrong-project",
        "snippet": "You may be using an API key from a different project. Check which project the key was created in."
      },
      {
        "level": 3,
        "text": "Key works locally but not in production",
        "anchor": "key-works-locally-but-not-in-production",
        "snippet": "Confirm the production deployment has the correct BANATA_API_KEY environment variable. If you recently created the key, make sure the production Banata backend has been redeployed."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Projects — Understand how projects provide data isolation Quick Start — Set up your first app with Banata SDK Reference — Manage API keys and other resources programmatically"
      }
    ],
    "searchText": "api keys api keys connect your application to a banata project. learn how to create, use, rotate, and manage api keys. creating an api key sign in to the banata dashboard. select the project you want to connect your app to. go to api keys in the sidebar. click create new key. copy the key immediately and store it securely. using your api key in a next.js app pass the api key to createbanataauthserver in your server auth helpers: with the admin sdk pass the api key when creating a banataauth client: how project scoping works each api key belongs to exactly one project. when your app sends a request with that key, banata automatically scopes the request to the correct project. you don't need to pass a projectid in your cod security best practices store keys in environment variables never hard-code api keys in your source code. use environment variables or a secrets manager: use separate keys for separate concerns if you have multiple services connecting to the same project (e.g., your web app and a background job worker), create a separate api key for each. this way, if one key is compromised, you can revoke i rotate keys regularly to rotate an api key safely: managing api keys with the sdk you can also create and manage api keys programmatically: troubleshooting auth requests work in the dashboard but fail in the app verify banata_api_key is set in your server environment (not just .env.local — check your deployment platform too). make sure you're using the correct key for the right project. requests return data from the wrong project you may be using an api key from a different project. check which project the key was created in. key works locally but not in production confirm the production deployment has the correct banata_api_key environment variable. if you recently created the key, make sure the production banata backend has been redeployed. next steps projects — understand how projects provide data isolation quick start — set up your first app with banata sdk reference — manage api keys and other resources programmatically"
  },
  {
    "slug": "audit-logs",
    "title": "Audit Logs",
    "description": "Automatic audit trail for all auth events with custom event support, filtering, and export capabilities.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Audit Event Structure",
        "anchor": "audit-event-structure",
        "snippet": "Every audit event captures five pieces of information:"
      },
      {
        "level": 2,
        "text": "Auto-Tracked Events",
        "anchor": "auto-tracked-events",
        "snippet": "Banata tracks 30 events automatically, grouped into five categories."
      },
      {
        "level": 3,
        "text": "User Events",
        "anchor": "user-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Session Events",
        "anchor": "session-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Email & Password Events",
        "anchor": "email-password-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization Events",
        "anchor": "organization-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Security Events",
        "anchor": "security-events",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Querying Audit Logs via the SDK",
        "anchor": "querying-audit-logs-via-the-sdk",
        "snippet": "Use auditLogs.listEvents to search and filter your audit trail programmatically."
      },
      {
        "level": 3,
        "text": "Basic Queries",
        "anchor": "basic-queries",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Pagination",
        "anchor": "pagination",
        "snippet": "Audit logs use cursor-based pagination. The listMetadata object returned with each response contains the cursors you need to move forward and backward through results."
      },
      {
        "level": 2,
        "text": "Querying via the Dashboard",
        "anchor": "querying-via-the-dashboard",
        "snippet": "You can also browse your audit trail in the Banata dashboard. Navigate to Audit Logs in the sidebar to see a searchable, filterable view of all events. The dashboard lets you filter by action type, ac"
      },
      {
        "level": 2,
        "text": "Custom Audit Events",
        "anchor": "custom-audit-events",
        "snippet": "The 30 auto-tracked events cover authentication and authorization. For business-specific actions — like exporting a document, approving a request, or changing a billing plan — you can log custom event"
      },
      {
        "level": 3,
        "text": "Via the SDK",
        "anchor": "via-the-sdk",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the logAuditEvent Helper (Server-Side)",
        "anchor": "via-the-logauditevent-helper-server-side",
        "snippet": "Inside Convex functions, you can log audit events directly using the logAuditEvent helper:"
      },
      {
        "level": 2,
        "text": "Exporting Audit Logs",
        "anchor": "exporting-audit-logs",
        "snippet": "You can export audit logs for compliance reporting, external analysis, or long-term archival."
      },
      {
        "level": 2,
        "text": "Change Tracking",
        "anchor": "change-tracking",
        "snippet": "For any update event, Banata captures a before-and-after snapshot so you can see exactly what changed. This is especially useful for investigating permission escalations, profile modifications, and co"
      },
      {
        "level": 2,
        "text": "Compliance Use Cases",
        "anchor": "compliance-use-cases",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "SOC 2",
        "anchor": "soc-2",
        "snippet": "SOC 2 requires logging of user authentication events, access control changes, and account lifecycle events. Banata covers these automatically:"
      },
      {
        "level": 3,
        "text": "HIPAA",
        "anchor": "hipaa",
        "snippet": "HIPAA requires audit trails for access to electronic health information, login monitoring, and access control audits. Banata provides:"
      },
      {
        "level": 3,
        "text": "GDPR",
        "anchor": "gdpr",
        "snippet": "GDPR requires records of processing activities, account deletion tracking, and consent management. Banata helps with:"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Supplement with custom events. The 30 auto-tracked events cover authentication and authorization. Add custom events for business-critical actions like data exports, billing changes, and approval workf"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Webhooks — Get real-time notifications when audit events occur API Keys — Manage programmatic access to your project Deploy — Take your project to production with audit log monitoring in place"
      }
    ],
    "searchText": "audit logs automatic audit trail for all auth events with custom event support, filtering, and export capabilities. audit event structure every audit event captures five pieces of information: auto-tracked events banata tracks 30 events automatically, grouped into five categories. user events session events email & password events organization events security events --- querying audit logs via the sdk use auditlogs.listevents to search and filter your audit trail programmatically. basic queries pagination audit logs use cursor-based pagination. the listmetadata object returned with each response contains the cursors you need to move forward and backward through results. querying via the dashboard you can also browse your audit trail in the banata dashboard. navigate to audit logs in the sidebar to see a searchable, filterable view of all events. the dashboard lets you filter by action type, ac custom audit events the 30 auto-tracked events cover authentication and authorization. for business-specific actions — like exporting a document, approving a request, or changing a billing plan — you can log custom event via the sdk via the logauditevent helper (server-side) inside convex functions, you can log audit events directly using the logauditevent helper: exporting audit logs you can export audit logs for compliance reporting, external analysis, or long-term archival. change tracking for any update event, banata captures a before-and-after snapshot so you can see exactly what changed. this is especially useful for investigating permission escalations, profile modifications, and co compliance use cases soc 2 soc 2 requires logging of user authentication events, access control changes, and account lifecycle events. banata covers these automatically: hipaa hipaa requires audit trails for access to electronic health information, login monitoring, and access control audits. banata provides: gdpr gdpr requires records of processing activities, account deletion tracking, and consent management. banata helps with: best practices supplement with custom events. the 30 auto-tracked events cover authentication and authorization. add custom events for business-critical actions like data exports, billing changes, and approval workf next steps webhooks — get real-time notifications when audit events occur api keys — manage programmatic access to your project deploy — take your project to production with audit log monitoring in place"
  },
  {
    "slug": "auth-configuration",
    "title": "Auth Configuration",
    "description": "Enable and configure authentication methods for your project — from the dashboard or by code.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Available Auth Methods",
        "anchor": "available-auth-methods",
        "snippet": "You can enable multiple methods at the same time. For example, you might offer email/password as the primary method, social OAuth for convenience, and MFA for added security."
      },
      {
        "level": 2,
        "text": "Enabling Methods from the Dashboard",
        "anchor": "enabling-methods-from-the-dashboard",
        "snippet": "Open the Banata dashboard and select your project. Go to Authentication > Methods. Toggle on the methods you want to enable. For methods that need additional setup (like social OAuth), follow the conf"
      },
      {
        "level": 2,
        "text": "Enabling Methods by Code",
        "anchor": "enabling-methods-by-code",
        "snippet": "Use the SDK to enable or disable auth methods programmatically:"
      },
      {
        "level": 2,
        "text": "Method-Specific Settings",
        "anchor": "method-specific-settings",
        "snippet": "Some methods have additional settings you can configure:"
      },
      {
        "level": 3,
        "text": "Email & Password",
        "anchor": "email-password",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Passkeys (WebAuthn)",
        "anchor": "passkeys-webauthn",
        "snippet": "Passkey configuration requires specifying your app's domain and origin. See the Passkeys guide for details."
      },
      {
        "level": 3,
        "text": "Organizations",
        "anchor": "organizations",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Authorization Configuration",
        "anchor": "authorization-configuration",
        "snippet": "In addition to authentication methods, you can configure authorization behavior:"
      },
      {
        "level": 3,
        "text": "Multiple Roles",
        "anchor": "multiple-roles",
        "snippet": "By default, each user has one role per organization. When multiple roles is enabled, users can hold several roles simultaneously, and permission checks combine all permissions from all assigned roles:"
      },
      {
        "level": 3,
        "text": "Configuring via Dashboard",
        "anchor": "configuring-via-dashboard",
        "snippet": "Navigate to Authorization > Configuration in the dashboard to toggle these settings."
      },
      {
        "level": 3,
        "text": "Configuring via SDK",
        "anchor": "configuring-via-sdk",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Configuration",
        "anchor": "email-configuration",
        "snippet": "If you're using any email-based auth method (email/password, magic links, email OTP), you need to configure email delivery:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Choose the auth methods you want to add to your app:"
      }
    ],
    "searchText": "auth configuration enable and configure authentication methods for your project — from the dashboard or by code. available auth methods you can enable multiple methods at the same time. for example, you might offer email/password as the primary method, social oauth for convenience, and mfa for added security. enabling methods from the dashboard open the banata dashboard and select your project. go to authentication > methods. toggle on the methods you want to enable. for methods that need additional setup (like social oauth), follow the conf enabling methods by code use the sdk to enable or disable auth methods programmatically: method-specific settings some methods have additional settings you can configure: email & password passkeys (webauthn) passkey configuration requires specifying your app's domain and origin. see the passkeys guide for details. organizations authorization configuration in addition to authentication methods, you can configure authorization behavior: multiple roles by default, each user has one role per organization. when multiple roles is enabled, users can hold several roles simultaneously, and permission checks combine all permissions from all assigned roles: configuring via dashboard navigate to authorization > configuration in the dashboard to toggle these settings. configuring via sdk email configuration if you're using any email-based auth method (email/password, magic links, email otp), you need to configure email delivery: next steps choose the auth methods you want to add to your app:"
  },
  {
    "slug": "bot-protection",
    "title": "Bot Protection",
    "description": "Add bot detection to your Next.js auth routes using Vercel BotID, Cloudflare Turnstile, reCAPTCHA, or hCaptcha — all built into @banata-auth/nextjs.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Quick Start",
        "anchor": "quick-start",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Recommended: Config-Aware (Dashboard-Managed)",
        "anchor": "recommended-config-aware-dashboard-managed",
        "snippet": "This approach reads your bot protection settings from the dashboard, so you can change providers or credentials without redeploying:"
      },
      {
        "level": 3,
        "text": "Alternative: Direct Provider (Vercel BotID)",
        "anchor": "alternative-direct-provider-vercel-botid",
        "snippet": "If you already have botid installed and want to skip dashboard configuration, you can wire up the provider directly:"
      },
      {
        "level": 2,
        "text": "API Reference",
        "anchor": "api-reference",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "withBotProtection(handler, config)",
        "anchor": "withbotprotectionhandler-config",
        "snippet": "Wraps a Next.js route handler with bot protection. Only requests whose path matches a protected prefix are verified — everything else passes through untouched."
      },
      {
        "level": 3,
        "text": "createBotIdVerifier(checkBotIdFn)",
        "anchor": "createbotidverifiercheckbotidfn",
        "snippet": "Creates a Vercel BotID verifier function:"
      },
      {
        "level": 3,
        "text": "createConfigAwareVerifier(options)",
        "anchor": "createconfigawareverifieroptions",
        "snippet": "Creates a verifier that reads provider credentials from the Banata Auth config API at runtime:"
      },
      {
        "level": 2,
        "text": "Supported Providers",
        "anchor": "supported-providers",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Vercel BotID",
        "anchor": "vercel-botid",
        "snippet": "Dashboard fields: API Key How it works: An invisible challenge runs automatically on Vercel deployments. The checkBotId() function verifies the challenge server-side."
      },
      {
        "level": 3,
        "text": "Cloudflare Turnstile",
        "anchor": "cloudflare-turnstile",
        "snippet": "Dashboard fields: Site Key, Secret Key How it works: Your client sends a Turnstile token in the cf-turnstile-response or x-turnstile-token header. The server verifies it against Cloudflare's siteverif"
      },
      {
        "level": 3,
        "text": "Google reCAPTCHA",
        "anchor": "google-recaptcha",
        "snippet": "Dashboard fields: Site Key, Secret Key How it works: Your client sends a reCAPTCHA v3 token in the x-recaptcha-token or g-recaptcha-response header. The server verifies it and checks the score (thresh"
      },
      {
        "level": 3,
        "text": "hCaptcha",
        "anchor": "hcaptcha",
        "snippet": "Dashboard fields: Site Key, Secret Key How it works: Your client sends an hCaptcha token in the x-hcaptcha-token or h-captcha-response header. The server verifies it against hCaptcha's siteverify API."
      },
      {
        "level": 2,
        "text": "Architecture",
        "anchor": "architecture",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Fail-open by default — If the bot detection service is unavailable, requests are allowed through so legitimate users are not locked out. Set failOpen: false if you prefer stricter enforcement."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Radar — Enable bot detection and configure your provider credentials in the dashboard."
      }
    ],
    "searchText": "bot protection add bot detection to your next.js auth routes using vercel botid, cloudflare turnstile, recaptcha, or hcaptcha — all built into @banata-auth/nextjs. quick start recommended: config-aware (dashboard-managed) this approach reads your bot protection settings from the dashboard, so you can change providers or credentials without redeploying: alternative: direct provider (vercel botid) if you already have botid installed and want to skip dashboard configuration, you can wire up the provider directly: api reference withbotprotection(handler, config) wraps a next.js route handler with bot protection. only requests whose path matches a protected prefix are verified — everything else passes through untouched. createbotidverifier(checkbotidfn) creates a vercel botid verifier function: createconfigawareverifier(options) creates a verifier that reads provider credentials from the banata auth config api at runtime: supported providers vercel botid dashboard fields: api key how it works: an invisible challenge runs automatically on vercel deployments. the checkbotid() function verifies the challenge server-side. cloudflare turnstile dashboard fields: site key, secret key how it works: your client sends a turnstile token in the cf-turnstile-response or x-turnstile-token header. the server verifies it against cloudflare's siteverif google recaptcha dashboard fields: site key, secret key how it works: your client sends a recaptcha v3 token in the x-recaptcha-token or g-recaptcha-response header. the server verifies it and checks the score (thresh hcaptcha dashboard fields: site key, secret key how it works: your client sends an hcaptcha token in the x-hcaptcha-token or h-captcha-response header. the server verifies it against hcaptcha's siteverify api. architecture security considerations fail-open by default — if the bot detection service is unavailable, requests are allowed through so legitimate users are not locked out. set failopen: false if you prefer stricter enforcement. next steps radar — enable bot detection and configure your provider credentials in the dashboard."
  },
  {
    "slug": "convex",
    "title": "Convex Integration",
    "description": "Platform-runtime reference for self-hosting Banata on Convex.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "Who This Is For",
        "anchor": "who-this-is-for",
        "snippet": "You should read this page if you are:"
      },
      {
        "level": 2,
        "text": "What It Provides",
        "anchor": "what-it-provides",
        "snippet": "Inside a Banata platform deployment, @banata-auth/convex gives you:"
      },
      {
        "level": 2,
        "text": "Minimal Local Files",
        "anchor": "minimal-local-files",
        "snippet": "The platform keeps a thin local convex/banataAuth/ folder for the pieces that cannot live entirely inside the Convex component environment."
      },
      {
        "level": 2,
        "text": "Product Boundary",
        "anchor": "product-boundary",
        "snippet": "There is an important distinction between the platform and customer apps:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Self-Hosting — set up your own Banata instance. Environment Variables — configure secrets and service URLs. Deploying — push your platform to production."
      }
    ],
    "searchText": "convex integration platform-runtime reference for self-hosting banata on convex. who this is for you should read this page if you are: what it provides inside a banata platform deployment, @banata-auth/convex gives you: minimal local files the platform keeps a thin local convex/banataauth/ folder for the pieces that cannot live entirely inside the convex component environment. product boundary there is an important distinction between the platform and customer apps: next steps self-hosting — set up your own banata instance. environment variables — configure secrets and service urls. deploying — push your platform to production."
  },
  {
    "slug": "deploy",
    "title": "Deploy to Production",
    "description": "Step-by-step guide for deploying your self-hosted Banata Auth stack — Convex backend, Next.js frontend, security hardening, and a pre-launch checklist.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "Deployment Architecture",
        "anchor": "deployment-architecture",
        "snippet": "In production, your stack has two main components — a Next.js app (deployed to Vercel, Cloudflare, or your own servers) and a Convex backend that runs the auth engine and database."
      },
      {
        "level": 2,
        "text": "Step 1 — Deploy to Convex",
        "anchor": "step-1-deploy-to-convex",
        "snippet": "Start by pushing your Convex functions and schema to a production deployment."
      },
      {
        "level": 3,
        "text": "Set production environment variables",
        "anchor": "set-production-environment-variables",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 2 — Deploy Next.js",
        "anchor": "step-2-deploy-nextjs",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Vercel (Recommended)",
        "anchor": "vercel-recommended",
        "snippet": "Connect your repository to Vercel. Add these environment variables in the Vercel dashboard:"
      },
      {
        "level": 3,
        "text": "Cloudflare Pages",
        "anchor": "cloudflare-pages",
        "snippet": "Create a Cloudflare Pages project. Set the same environment variables listed above. Build command: next build Output directory: .next"
      },
      {
        "level": 3,
        "text": "Self-Hosted",
        "anchor": "self-hosted",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 3 — Update OAuth Callback URLs",
        "anchor": "step-3-update-oauth-callback-urls",
        "snippet": "Head to each OAuth provider's developer console and update the callback URLs to your production domain."
      },
      {
        "level": 2,
        "text": "Security Hardening",
        "anchor": "security-hardening",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "HTTPS",
        "anchor": "https",
        "snippet": "Production requires HTTPS. The Secure cookie flag is set automatically, so session cookies are only sent over encrypted connections. Vercel and Cloudflare provide HTTPS out of the box. If you are self"
      },
      {
        "level": 3,
        "text": "Auth Secret",
        "anchor": "auth-secret",
        "snippet": "Generate with openssl rand -base64 32 (minimum 32 bytes). Never share between environments. Never commit to source control. Rotating the secret invalidates all active sessions — plan rotations during "
      },
      {
        "level": 3,
        "text": "Session Security",
        "anchor": "session-security",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "Built-in rate limits protect against brute-force attacks by default:"
      },
      {
        "level": 3,
        "text": "Trusted Origins",
        "anchor": "trusted-origins",
        "snippet": "Configure trusted origins to restrict which domains can make authenticated requests. Only list the origins your app actually runs on — for example, https://myapp.com and https://admin.myapp.com."
      },
      {
        "level": 2,
        "text": "Monitoring",
        "anchor": "monitoring",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Convex Dashboard",
        "anchor": "convex-dashboard",
        "snippet": "The Convex Dashboard gives you real-time visibility into your auth backend:"
      },
      {
        "level": 3,
        "text": "Audit Logs",
        "anchor": "audit-logs",
        "snippet": "Banata Auth automatically records 30 auth event types. Query them through the SDK to spot suspicious activity:"
      },
      {
        "level": 3,
        "text": "Webhooks",
        "anchor": "webhooks",
        "snippet": "Set up webhook endpoints to pipe auth events into your monitoring stack (Datadog, PagerDuty, Slack, etc.). Monitor delivery success rates and retry counts through the admin dashboard."
      },
      {
        "level": 2,
        "text": "Scaling",
        "anchor": "scaling",
        "snippet": "Convex handles backend scaling automatically — serverless functions scale from zero to thousands of concurrent executions, the database is sharded and replicated, and there are no cold starts. You do "
      },
      {
        "level": 2,
        "text": "Pre-Launch Checklist",
        "anchor": "pre-launch-checklist",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Environment",
        "anchor": "environment",
        "snippet": "[ ] BETTER_AUTH_SECRET is set to a unique production value [ ] SITE_URL matches your production domain (with https://) [ ] All NEXT_PUBLIC_* variables point to the production Convex deployment"
      },
      {
        "level": 3,
        "text": "Security",
        "anchor": "security",
        "snippet": "[ ] HTTPS is enabled (required for secure cookies) [ ] BETTER_AUTH_SECRET is different from development [ ] No development or test credentials in production"
      },
      {
        "level": 3,
        "text": "Auth Flows",
        "anchor": "auth-flows",
        "snippet": "[ ] Email/password sign-up works end-to-end [ ] Verification and password-reset emails are received [ ] Social OAuth flows complete successfully [ ] MFA setup and verification works (if enabled)"
      },
      {
        "level": 3,
        "text": "Monitoring",
        "anchor": "monitoring",
        "snippet": "[ ] Convex dashboard is accessible [ ] Audit logs are recording events [ ] Webhook endpoints are registered and receiving events [ ] Error alerting is configured"
      },
      {
        "level": 3,
        "text": "Compliance",
        "anchor": "compliance",
        "snippet": "[ ] Audit logging is active (always-on by default) [ ] Data retention policy is defined [ ] Privacy policy reflects auth data collection [ ] Cookie consent banner is added (if required by jurisdiction"
      },
      {
        "level": 2,
        "text": "Post-Launch",
        "anchor": "post-launch",
        "snippet": "Once you are live:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Environment Variables — Full reference for every variable your deployment uses. Webhooks — Set up real-time event delivery to your systems. Audit Logs — Configure compliance and security logging."
      }
    ],
    "searchText": "deploy to production step-by-step guide for deploying your self-hosted banata auth stack — convex backend, next.js frontend, security hardening, and a pre-launch checklist. deployment architecture in production, your stack has two main components — a next.js app (deployed to vercel, cloudflare, or your own servers) and a convex backend that runs the auth engine and database. step 1 — deploy to convex start by pushing your convex functions and schema to a production deployment. set production environment variables step 2 — deploy next.js vercel (recommended) connect your repository to vercel. add these environment variables in the vercel dashboard: cloudflare pages create a cloudflare pages project. set the same environment variables listed above. build command: next build output directory: .next self-hosted step 3 — update oauth callback urls head to each oauth provider's developer console and update the callback urls to your production domain. security hardening https production requires https. the secure cookie flag is set automatically, so session cookies are only sent over encrypted connections. vercel and cloudflare provide https out of the box. if you are self auth secret generate with openssl rand -base64 32 (minimum 32 bytes). never share between environments. never commit to source control. rotating the secret invalidates all active sessions — plan rotations during  session security rate limiting built-in rate limits protect against brute-force attacks by default: trusted origins configure trusted origins to restrict which domains can make authenticated requests. only list the origins your app actually runs on — for example, https://myapp.com and https://admin.myapp.com. monitoring convex dashboard the convex dashboard gives you real-time visibility into your auth backend: audit logs banata auth automatically records 30 auth event types. query them through the sdk to spot suspicious activity: webhooks set up webhook endpoints to pipe auth events into your monitoring stack (datadog, pagerduty, slack, etc.). monitor delivery success rates and retry counts through the admin dashboard. scaling convex handles backend scaling automatically — serverless functions scale from zero to thousands of concurrent executions, the database is sharded and replicated, and there are no cold starts. you do  pre-launch checklist environment [ ] better_auth_secret is set to a unique production value [ ] site_url matches your production domain (with https://) [ ] all next_public_* variables point to the production convex deployment security [ ] https is enabled (required for secure cookies) [ ] better_auth_secret is different from development [ ] no development or test credentials in production auth flows [ ] email/password sign-up works end-to-end [ ] verification and password-reset emails are received [ ] social oauth flows complete successfully [ ] mfa setup and verification works (if enabled) monitoring [ ] convex dashboard is accessible [ ] audit logs are recording events [ ] webhook endpoints are registered and receiving events [ ] error alerting is configured compliance [ ] audit logging is active (always-on by default) [ ] data retention policy is defined [ ] privacy policy reflects auth data collection [ ] cookie consent banner is added (if required by jurisdiction post-launch once you are live: next steps environment variables — full reference for every variable your deployment uses. webhooks — set up real-time event delivery to your systems. audit logs — configure compliance and security logging."
  },
  {
    "slug": "domains",
    "title": "Domains",
    "description": "Configure the base URLs for your authentication services, email delivery, admin portal, and hosted UI.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Default Domains",
        "anchor": "default-domains",
        "snippet": "Every project ships with four default domains. These are created automatically the first time you visit the Domains page in your dashboard."
      },
      {
        "level": 2,
        "text": "Editing Domains in the Dashboard",
        "anchor": "editing-domains-in-the-dashboard",
        "snippet": "Open your project in the dashboard and navigate to Domains in the sidebar. Click the pencil icon next to any domain to edit its value inline. Press Enter to save your change or Escape to cancel."
      },
      {
        "level": 2,
        "text": "Adding Custom Domains",
        "anchor": "adding-custom-domains",
        "snippet": "In addition to the four defaults, you can create custom domains for any additional services your project needs."
      },
      {
        "level": 2,
        "text": "Custom Domains",
        "anchor": "custom-domains",
        "snippet": "When you change a domain value to your own domain (for example, switching from auth.banata.dev to auth.mycompany.com), you need to configure DNS and SSL so traffic reaches your Banata Auth deployment."
      },
      {
        "level": 3,
        "text": "DNS Setup",
        "anchor": "dns-setup",
        "snippet": "Create a CNAME record with your DNS provider that points your custom domain to your Banata Auth service host."
      },
      {
        "level": 3,
        "text": "SSL Certificates",
        "anchor": "ssl-certificates",
        "snippet": "All production domains must serve traffic over HTTPS. If you deploy to Vercel, SSL certificates are provisioned automatically for custom domains. For other hosting providers, make sure you provision a"
      },
      {
        "level": 2,
        "text": "Security",
        "anchor": "security",
        "snippet": "Admin-only access — Only users with an admin role can view or modify domain configuration. Default domains are protected — The four built-in domains cannot be deleted, only edited."
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": "\"Authentication required\" — You must be signed in as an admin to manage domains. Verify that your session is active and your user has an admin role."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Redirects — Configure redirect URIs for your authentication flows. Environment Variables — Set the environment variables your project needs. Deploying to Production — Walk through a full production de"
      }
    ],
    "searchText": "domains configure the base urls for your authentication services, email delivery, admin portal, and hosted ui. default domains every project ships with four default domains. these are created automatically the first time you visit the domains page in your dashboard. editing domains in the dashboard open your project in the dashboard and navigate to domains in the sidebar. click the pencil icon next to any domain to edit its value inline. press enter to save your change or escape to cancel. adding custom domains in addition to the four defaults, you can create custom domains for any additional services your project needs. custom domains when you change a domain value to your own domain (for example, switching from auth.banata.dev to auth.mycompany.com), you need to configure dns and ssl so traffic reaches your banata auth deployment. dns setup create a cname record with your dns provider that points your custom domain to your banata auth service host. ssl certificates all production domains must serve traffic over https. if you deploy to vercel, ssl certificates are provisioned automatically for custom domains. for other hosting providers, make sure you provision a security admin-only access — only users with an admin role can view or modify domain configuration. default domains are protected — the four built-in domains cannot be deleted, only edited. troubleshooting \"authentication required\" — you must be signed in as an admin to manage domains. verify that your session is active and your user has an admin role. next steps redirects — configure redirect uris for your authentication flows. environment variables — set the environment variables your project needs. deploying to production — walk through a full production de"
  },
  {
    "slug": "email-otp",
    "title": "Email OTP",
    "description": "Passwordless authentication using a 6-digit code sent to the user's email.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Enable Email OTP",
        "anchor": "enable-email-otp",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "From the Dashboard",
        "anchor": "from-the-dashboard",
        "snippet": "Open the Banata dashboard and select your project. Go to Authentication > Methods. Toggle Email OTP on. Make sure you have an active email provider configured under Emails > Providers (Resend, SendGri"
      },
      {
        "level": 3,
        "text": "From the SDK",
        "anchor": "from-the-sdk",
        "snippet": "You can also enable Email OTP programmatically:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": "Email OTP uses a two-step flow through a single method. The presence or absence of the otp parameter determines which step you are on."
      },
      {
        "level": 3,
        "text": "Step 1 -- Send the Code",
        "anchor": "step-1-send-the-code",
        "snippet": "Call authClient.signIn.emailOtp with just the user's email. Banata generates a 6-digit code and emails it to the user."
      },
      {
        "level": 3,
        "text": "Step 2 -- Verify the Code",
        "anchor": "step-2-verify-the-code",
        "snippet": "Call the same method again, this time including the otp the user entered. If the code is valid, Banata creates a session and returns the user."
      },
      {
        "level": 2,
        "text": "Complete Form Example",
        "anchor": "complete-form-example",
        "snippet": "Here is a full React component that walks the user through both steps: entering their email, then entering the code."
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "Here is the full flow from start to finish:"
      },
      {
        "level": 2,
        "text": "OTP Properties",
        "anchor": "otp-properties",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "New Users vs. Existing Users",
        "anchor": "new-users-vs-existing-users",
        "snippet": "Email OTP handles both sign-in and sign-up in a single flow:"
      },
      {
        "level": 2,
        "text": "Combining with Other Methods",
        "anchor": "combining-with-other-methods",
        "snippet": "Email OTP works alongside any other authentication method. You can enable multiple methods in Authentication > Methods and let users choose."
      },
      {
        "level": 2,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "OTP endpoints are rate-limited to prevent abuse:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Short expiry window -- Codes expire after 10 minutes, limiting the window for interception. Single-use codes -- Each code is consumed on verification and cannot be reused."
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Invalid or expired OTP\"",
        "anchor": "invalid-or-expired-otp",
        "snippet": "The code does not match or has expired. Common causes:"
      },
      {
        "level": 3,
        "text": "OTP email not received",
        "anchor": "otp-email-not-received",
        "snippet": "Verify you have an active email provider in Emails > Providers. Check that Magic Auth is enabled under Emails > Configuration (this controls OTP email delivery)."
      },
      {
        "level": 3,
        "text": "\"Rate limit exceeded\"",
        "anchor": "rate-limit-exceeded",
        "snippet": "The user has sent too many requests in a short period. Wait one minute before retrying. If this happens frequently for legitimate users, consider adding a visible cooldown timer after sending a code."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Magic Links -- Link-based passwordless authentication as an alternative to OTP. Email & Password -- Traditional authentication with email verification."
      }
    ],
    "searchText": "email otp passwordless authentication using a 6-digit code sent to the user's email. enable email otp from the dashboard open the banata dashboard and select your project. go to authentication > methods. toggle email otp on. make sure you have an active email provider configured under emails > providers (resend, sendgri from the sdk you can also enable email otp programmatically: client-side api email otp uses a two-step flow through a single method. the presence or absence of the otp parameter determines which step you are on. step 1 -- send the code call authclient.signin.emailotp with just the user's email. banata generates a 6-digit code and emails it to the user. step 2 -- verify the code call the same method again, this time including the otp the user entered. if the code is valid, banata creates a session and returns the user. complete form example here is a full react component that walks the user through both steps: entering their email, then entering the code. how it works here is the full flow from start to finish: otp properties --- new users vs. existing users email otp handles both sign-in and sign-up in a single flow: combining with other methods email otp works alongside any other authentication method. you can enable multiple methods in authentication > methods and let users choose. rate limits otp endpoints are rate-limited to prevent abuse: security considerations short expiry window -- codes expire after 10 minutes, limiting the window for interception. single-use codes -- each code is consumed on verification and cannot be reused. troubleshooting \"invalid or expired otp\" the code does not match or has expired. common causes: otp email not received verify you have an active email provider in emails > providers. check that magic auth is enabled under emails > configuration (this controls otp email delivery). \"rate limit exceeded\" the user has sent too many requests in a short period. wait one minute before retrying. if this happens frequently for legitimate users, consider adding a visible cooldown timer after sending a code. next steps magic links -- link-based passwordless authentication as an alternative to otp. email & password -- traditional authentication with email verification."
  },
  {
    "slug": "email-password",
    "title": "Email & Password",
    "description": "Set up email and password authentication with email verification, password reset, and customizable validation.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Enabling Email & Password",
        "anchor": "enabling-email-password",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "From the Dashboard",
        "anchor": "from-the-dashboard",
        "snippet": "Go to Authentication > Methods in your project. Toggle on Email & Password. Configure an email provider under Emails > Providers (required for verification and password reset emails)."
      },
      {
        "level": 3,
        "text": "From the SDK",
        "anchor": "from-the-sdk",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Configuration Options",
        "anchor": "configuration-options",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Sign Up",
        "anchor": "sign-up",
        "snippet": "Use the auth client to create a new account:"
      },
      {
        "level": 3,
        "text": "Using the Pre-Built Form",
        "anchor": "using-the-pre-built-form",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Sign In",
        "anchor": "sign-in",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using the Pre-Built Form",
        "anchor": "using-the-pre-built-form",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Sign Out",
        "anchor": "sign-out",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Password Reset",
        "anchor": "password-reset",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 1: Request a Reset Link",
        "anchor": "step-1-request-a-reset-link",
        "snippet": "The user enters their email address and Banata sends a password reset email:"
      },
      {
        "level": 3,
        "text": "Step 2: Reset the Password",
        "anchor": "step-2-reset-the-password",
        "snippet": "On the /reset-password page, extract the token from the URL and submit the new password:"
      },
      {
        "level": 2,
        "text": "Email Verification",
        "anchor": "email-verification",
        "snippet": "Email verification happens automatically when the user clicks the link in the verification email. The link hits /api/auth/verify-email with the token, and Banata handles the rest."
      },
      {
        "level": 2,
        "text": "Server-Side User Management",
        "anchor": "server-side-user-management",
        "snippet": "Use the admin SDK to manage users from your backend:"
      },
      {
        "level": 2,
        "text": "Password Validation",
        "anchor": "password-validation",
        "snippet": "Passwords are validated on both sign-up and password reset:"
      },
      {
        "level": 2,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "Rate limits are project-scoped and identifier-aware for email-based endpoints."
      },
      {
        "level": 2,
        "text": "Error Reference",
        "anchor": "error-reference",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "Enable email verification — prevents sign-up with someone else's email address. Use HTTPS in production — session cookies are Secure-flagged. Set a strong BETTER_AUTH_SECRET — use openssl rand -base64"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Social OAuth — Add Google, GitHub, and more alongside email/password Magic Links — Offer passwordless sign-in via email Multi-Factor Auth — Add TOTP-based two-factor authentication"
      }
    ],
    "searchText": "email & password set up email and password authentication with email verification, password reset, and customizable validation. enabling email & password from the dashboard go to authentication > methods in your project. toggle on email & password. configure an email provider under emails > providers (required for verification and password reset emails). from the sdk configuration options --- sign up use the auth client to create a new account: using the pre-built form sign in using the pre-built form sign out password reset step 1: request a reset link the user enters their email address and banata sends a password reset email: step 2: reset the password on the /reset-password page, extract the token from the url and submit the new password: email verification email verification happens automatically when the user clicks the link in the verification email. the link hits /api/auth/verify-email with the token, and banata handles the rest. server-side user management use the admin sdk to manage users from your backend: password validation passwords are validated on both sign-up and password reset: rate limits rate limits are project-scoped and identifier-aware for email-based endpoints. error reference --- security best practices enable email verification — prevents sign-up with someone else's email address. use https in production — session cookies are secure-flagged. set a strong better_auth_secret — use openssl rand -base64 next steps social oauth — add google, github, and more alongside email/password magic links — offer passwordless sign-in via email multi-factor auth — add totp-based two-factor authentication"
  },
  {
    "slug": "email-templates",
    "title": "Email Templates",
    "description": "Customize the emails Banata sends with a block-based template editor, variable interpolation, and project branding.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "System Templates",
        "anchor": "system-templates",
        "snippet": "Banata ships with six system templates that power built-in authentication flows. These are created automatically when you set up your project. You can customize their content and styling in the editor"
      },
      {
        "level": 3,
        "text": "verification",
        "anchor": "verification",
        "snippet": "Sent when a user signs up and needs to confirm their email address."
      },
      {
        "level": 3,
        "text": "password-reset",
        "anchor": "password-reset",
        "snippet": "Sent when a user requests a password reset."
      },
      {
        "level": 3,
        "text": "magic-link",
        "anchor": "magic-link",
        "snippet": "Sent for passwordless sign-in via a magic link."
      },
      {
        "level": 3,
        "text": "email-otp",
        "anchor": "email-otp",
        "snippet": "Sent for email-based one-time password verification."
      },
      {
        "level": 3,
        "text": "invitation",
        "anchor": "invitation",
        "snippet": "Sent when a user is invited to join an organization. Organization invitations are now sent through the branded template system automatically — no custom email-sending code is required."
      },
      {
        "level": 3,
        "text": "welcome",
        "anchor": "welcome",
        "snippet": "Sent after successful account creation."
      },
      {
        "level": 2,
        "text": "Custom Templates",
        "anchor": "custom-templates",
        "snippet": "Custom templates are templates you create for your own use cases — marketing emails, onboarding sequences, notifications, or anything else. You have full control over custom templates: create, edit, r"
      },
      {
        "level": 3,
        "text": "Creating a Custom Template",
        "anchor": "creating-a-custom-template",
        "snippet": "Go to Email Templates in the dashboard sidebar. Click Create Template. A new template named \"Untitled Template\" is created with a blank heading and text block."
      },
      {
        "level": 3,
        "text": "Variables in Custom Templates",
        "anchor": "variables-in-custom-templates",
        "snippet": "When you use {{variableName}} placeholders in your custom template blocks, the dashboard auto-detects them and displays them in the Variables panel. You can add descriptions and default values for eac"
      },
      {
        "level": 2,
        "text": "Block Types",
        "anchor": "block-types",
        "snippet": "Every template is an ordered list of blocks. You can mix and match these nine types to build any layout you need."
      },
      {
        "level": 3,
        "text": "Block Styling",
        "anchor": "block-styling",
        "snippet": "All blocks that support styling accept optional properties:"
      },
      {
        "level": 2,
        "text": "Variable Interpolation",
        "anchor": "variable-interpolation",
        "snippet": "Templates support {{variableName}} placeholders in text, URLs, and subject lines. At send time, Banata replaces each placeholder with the value you pass in."
      },
      {
        "level": 3,
        "text": "Variable Quick-Insert",
        "anchor": "variable-quick-insert",
        "snippet": "In the email editor, text and heading blocks have a Variable button in their inspector panel. Click it to see a dropdown of available variables and insert {{variableName}} directly into the block cont"
      },
      {
        "level": 2,
        "text": "Dashboard Editor",
        "anchor": "dashboard-editor",
        "snippet": "The easiest way to work with templates is through the visual editor in your dashboard. Navigate to Email Templates in the sidebar to get started."
      },
      {
        "level": 2,
        "text": "Branding Integration",
        "anchor": "branding-integration",
        "snippet": "Your email templates automatically inherit your project's branding configuration when rendered. You configure branding once in the dashboard under Branding, and every email -- system and custom -- pic"
      },
      {
        "level": 2,
        "text": "Modifying Templates from Code",
        "anchor": "modifying-templates-from-code",
        "snippet": "You can manage templates entirely from code without using the dashboard. All template operations use the HTTP API, so they work from any backend — Node.js, Bun, Deno, Hono, Express, or any runtime."
      },
      {
        "level": 3,
        "text": "Create a Template",
        "anchor": "create-a-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Update a Template",
        "anchor": "update-a-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List and Get Templates",
        "anchor": "list-and-get-templates",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Template",
        "anchor": "delete-a-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Send an Email",
        "anchor": "send-an-email",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Preview a Template",
        "anchor": "preview-a-template",
        "snippet": "Render to HTML without sending — useful for testing or custom delivery:"
      },
      {
        "level": 2,
        "text": "System Template Variable Reference",
        "anchor": "system-template-variable-reference",
        "snippet": "Each system template has a fixed set of variables. Here's the complete reference:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Emails — Configure email providers and send branded emails from code SDK Reference — Complete API reference for the Emails resource Branding — Configure project branding used by email templates"
      }
    ],
    "searchText": "email templates customize the emails banata sends with a block-based template editor, variable interpolation, and project branding. system templates banata ships with six system templates that power built-in authentication flows. these are created automatically when you set up your project. you can customize their content and styling in the editor verification sent when a user signs up and needs to confirm their email address. password-reset sent when a user requests a password reset. magic-link sent for passwordless sign-in via a magic link. email-otp sent for email-based one-time password verification. invitation sent when a user is invited to join an organization. organization invitations are now sent through the branded template system automatically — no custom email-sending code is required. welcome sent after successful account creation. custom templates custom templates are templates you create for your own use cases — marketing emails, onboarding sequences, notifications, or anything else. you have full control over custom templates: create, edit, r creating a custom template go to email templates in the dashboard sidebar. click create template. a new template named \"untitled template\" is created with a blank heading and text block. variables in custom templates when you use {{variablename}} placeholders in your custom template blocks, the dashboard auto-detects them and displays them in the variables panel. you can add descriptions and default values for eac block types every template is an ordered list of blocks. you can mix and match these nine types to build any layout you need. block styling all blocks that support styling accept optional properties: variable interpolation templates support {{variablename}} placeholders in text, urls, and subject lines. at send time, banata replaces each placeholder with the value you pass in. variable quick-insert in the email editor, text and heading blocks have a variable button in their inspector panel. click it to see a dropdown of available variables and insert {{variablename}} directly into the block cont dashboard editor the easiest way to work with templates is through the visual editor in your dashboard. navigate to email templates in the sidebar to get started. branding integration your email templates automatically inherit your project's branding configuration when rendered. you configure branding once in the dashboard under branding, and every email -- system and custom -- pic modifying templates from code you can manage templates entirely from code without using the dashboard. all template operations use the http api, so they work from any backend — node.js, bun, deno, hono, express, or any runtime. create a template update a template list and get templates delete a template send an email preview a template render to html without sending — useful for testing or custom delivery: system template variable reference each system template has a fixed set of variables. here's the complete reference: next steps emails — configure email providers and send branded emails from code sdk reference — complete api reference for the emails resource branding — configure project branding used by email templates"
  },
  {
    "slug": "emails",
    "title": "Emails",
    "description": "Configure email providers, control transactional emails, and send branded emails programmatically.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Email Providers",
        "anchor": "email-providers",
        "snippet": "Banata supports five email delivery providers out of the box:"
      },
      {
        "level": 3,
        "text": "Setting Up a Provider",
        "anchor": "setting-up-a-provider",
        "snippet": "Go to Emails > Providers in the dashboard. Click Enable on your preferred provider. Enter your API key in the field that appears. Click Save Key."
      },
      {
        "level": 3,
        "text": "Send a Test Email",
        "anchor": "send-a-test-email",
        "snippet": "Once your provider is active, click the Send test email button at the top of the Providers page. Enter a recipient address and click Send. This dispatches a real email through your active provider so "
      },
      {
        "level": 2,
        "text": "Email Configuration",
        "anchor": "email-configuration",
        "snippet": "You control which types of transactional emails Banata sends. Each type can be toggled on or off independently from Emails > Configuration in the dashboard."
      },
      {
        "level": 3,
        "text": "Authentication Emails",
        "anchor": "authentication-emails",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization Emails",
        "anchor": "organization-emails",
        "snippet": "Changes take effect immediately when you toggle an email type. If you disable a type, Banata will not send those emails even when your application triggers the corresponding auth flow."
      },
      {
        "level": 2,
        "text": "Branded Email Delivery",
        "anchor": "branded-email-delivery",
        "snippet": "All transactional emails — including organization invitation emails — are rendered using your project's branded template system. This means every email your users receive reflects your branding automa"
      },
      {
        "level": 2,
        "text": "Sending Branded Emails from Code",
        "anchor": "sending-branded-emails-from-code",
        "snippet": "In addition to the automatic emails Banata sends during auth flows, you can send branded emails programmatically. This works from any backend — Node.js, Bun, Hono, Express, Next.js, or any runtime tha"
      },
      {
        "level": 3,
        "text": "Using the API",
        "anchor": "using-the-api",
        "snippet": "Send a branded email with a single HTTP request. The email uses your configured provider and branding automatically:"
      },
      {
        "level": 3,
        "text": "Previewing Without Sending",
        "anchor": "previewing-without-sending",
        "snippet": "Render a template to HTML without actually sending it — useful for testing or generating email content for your own delivery pipeline:"
      },
      {
        "level": 3,
        "text": "Overriding Email Callbacks",
        "anchor": "overriding-email-callbacks",
        "snippet": "If you need complete control over how specific email types are delivered (e.g., using your own email service instead of Banata's), you can provide callbacks in your auth configuration:"
      },
      {
        "level": 2,
        "text": "Email Events",
        "anchor": "email-events",
        "snippet": "You can monitor email delivery from the dashboard under Emails > Events. This page shows a real-time feed of email activity including deliveries, verification sends, magic link dispatches, password re"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": "You can also manage email provider configuration programmatically through the Banata SDK:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Email Templates — Customize the content and branding of the emails Banata sends Invitations — Invitation lifecycle and email delivery"
      }
    ],
    "searchText": "emails configure email providers, control transactional emails, and send branded emails programmatically. email providers banata supports five email delivery providers out of the box: setting up a provider go to emails > providers in the dashboard. click enable on your preferred provider. enter your api key in the field that appears. click save key. send a test email once your provider is active, click the send test email button at the top of the providers page. enter a recipient address and click send. this dispatches a real email through your active provider so  email configuration you control which types of transactional emails banata sends. each type can be toggled on or off independently from emails > configuration in the dashboard. authentication emails organization emails changes take effect immediately when you toggle an email type. if you disable a type, banata will not send those emails even when your application triggers the corresponding auth flow. branded email delivery all transactional emails — including organization invitation emails — are rendered using your project's branded template system. this means every email your users receive reflects your branding automa sending branded emails from code in addition to the automatic emails banata sends during auth flows, you can send branded emails programmatically. this works from any backend — node.js, bun, hono, express, next.js, or any runtime tha using the api send a branded email with a single http request. the email uses your configured provider and branding automatically: previewing without sending render a template to html without actually sending it — useful for testing or generating email content for your own delivery pipeline: overriding email callbacks if you need complete control over how specific email types are delivered (e.g., using your own email service instead of banata's), you can provide callbacks in your auth configuration: email events you can monitor email delivery from the dashboard under emails > events. this page shows a real-time feed of email activity including deliveries, verification sends, magic link dispatches, password re sdk usage you can also manage email provider configuration programmatically through the banata sdk: what's next email templates — customize the content and branding of the emails banata sends invitations — invitation lifecycle and email delivery"
  },
  {
    "slug": "env-vars",
    "title": "Environment Variables",
    "description": "Complete reference for every environment variable you need when self-hosting Banata Auth with Convex and Next.js.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "Quick Reference",
        "anchor": "quick-reference",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Convex Environment Variables",
        "anchor": "convex-environment-variables",
        "snippet": "You set these on your Convex deployment with npx convex env set. They're available to your Convex functions via process.env."
      },
      {
        "level": 3,
        "text": "Core",
        "anchor": "core",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Social OAuth Providers",
        "anchor": "social-oauth-providers",
        "snippet": "You only need to set credentials for the providers you've enabled in your socialProviders configuration."
      },
      {
        "level": 3,
        "text": "Email Provider",
        "anchor": "email-provider",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Passkeys (WebAuthn)",
        "anchor": "passkeys-webauthn",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Managing Convex Variables",
        "anchor": "managing-convex-variables",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Next.js Environment Variables (.env.local)",
        "anchor": "nextjs-environment-variables-envlocal",
        "snippet": "These live in your .env.local file and are available to your Next.js application at build and runtime."
      },
      {
        "level": 3,
        "text": "Example .env.local",
        "anchor": "example-envlocal",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Local Development",
        "anchor": "local-development",
        "snippet": "When you run Convex locally with npx convex dev, your .env.local should point to the local endpoints:"
      },
      {
        "level": 2,
        "text": "NEXT_PUBLIC_ Safety Reminder",
        "anchor": "nextpublic-safety-reminder",
        "snippet": "Any variable prefixed with NEXT_PUBLIC_ gets embedded in your client-side JavaScript bundle and is visible to every user. Never put secrets in NEXT_PUBLIC_ variables."
      },
      {
        "level": 2,
        "text": "Production Checklist",
        "anchor": "production-checklist",
        "snippet": "Before you go live, walk through each item:"
      },
      {
        "level": 2,
        "text": "Template .env.local",
        "anchor": "template-envlocal",
        "snippet": "Copy this into your project as a starting point:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Convex Integration — Deep dive into the Convex backend configuration Deploy — Ship your self-hosted instance to production Quick Start — Set up a new project from scratch"
      }
    ],
    "searchText": "environment variables complete reference for every environment variable you need when self-hosting banata auth with convex and next.js. quick reference --- convex environment variables you set these on your convex deployment with npx convex env set. they're available to your convex functions via process.env. core social oauth providers you only need to set credentials for the providers you've enabled in your socialproviders configuration. email provider passkeys (webauthn) managing convex variables next.js environment variables (.env.local) these live in your .env.local file and are available to your next.js application at build and runtime. example .env.local local development when you run convex locally with npx convex dev, your .env.local should point to the local endpoints: next_public_ safety reminder any variable prefixed with next_public_ gets embedded in your client-side javascript bundle and is visible to every user. never put secrets in next_public_ variables. production checklist before you go live, walk through each item: template .env.local copy this into your project as a starting point: next steps convex integration — deep dive into the convex backend configuration deploy — ship your self-hosted instance to production quick start — set up a new project from scratch"
  },
  {
    "slug": "hosted-ui",
    "title": "Hosted Sign-In",
    "description": "Let Banata render the auth UI for you. Your app links to a hosted sign-in page, the user authenticates, and Banata redirects them back.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "Your app links the user to Banata's hosted sign-in page, passing your project's client_id as a query parameter. Banata renders the sign-in UI with the auth methods and providers you've configured for "
      },
      {
        "level": 2,
        "text": "Prerequisites",
        "anchor": "prerequisites",
        "snippet": "The hosted UI reflects the configuration already saved for your project. Before you test it, make sure you've completed the following in the Banata dashboard:"
      },
      {
        "level": 2,
        "text": "App Requirements",
        "anchor": "app-requirements",
        "snippet": "Even though Banata handles the UI, your app still needs a few things in place:"
      },
      {
        "level": 3,
        "text": "Proxy Route",
        "anchor": "proxy-route",
        "snippet": "Set up the /api/auth/[...all] proxy route in your app. This is the same route used by the primary SDK integration and is required for session management."
      },
      {
        "level": 3,
        "text": "API Key",
        "anchor": "api-key",
        "snippet": "Your server must have a valid project-scoped API key. Create one in the dashboard under API Keys and store it as an environment variable. See the API Keys guide for details."
      },
      {
        "level": 3,
        "text": "Callback Handling",
        "anchor": "callback-handling",
        "snippet": "Your app needs a /auth/callback route that receives the redirect from Banata after the user authenticates. If this route is missing or misconfigured, the hosted flow will complete successfully on the "
      },
      {
        "level": 2,
        "text": "Branding",
        "anchor": "branding",
        "snippet": "The hosted UI uses the same project configuration as the dashboard and the SDK. That means:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "The hosted page loads but shows no sign-in options",
        "anchor": "the-hosted-page-loads-but-shows-no-sign-in-options",
        "snippet": "Your project is missing auth configuration. Check Authentication > Methods to confirm at least one method is enabled, and check Authentication > Providers to confirm credentials are configured for any"
      },
      {
        "level": 3,
        "text": "The hosted flow completes but the user is still unauthenticated",
        "anchor": "the-hosted-flow-completes-but-the-user-is-still-unauthenticated",
        "snippet": "Check the following:"
      },
      {
        "level": 3,
        "text": "Rate limit exceeded",
        "anchor": "rate-limit-exceeded",
        "snippet": "Banata rate-limits sensitive auth endpoints per project, IP, path, and (for email-based flows) the submitted identifier. If you're hitting rate limits during development:"
      },
      {
        "level": 3,
        "text": "The hosted page returns the wrong project",
        "anchor": "the-hosted-page-returns-the-wrong-project",
        "snippet": "Verify that the client_id parameter is set to the project's client ID from the Banata dashboard. This is not the workspace slug or workspace name — it's the ID shown on the project's settings page."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Quick Start — set up the primary app-owned auth integration with @banata-auth/nextjs API Keys — create and manage the keys that connect your app to a project"
      }
    ],
    "searchText": "hosted sign-in let banata render the auth ui for you. your app links to a hosted sign-in page, the user authenticates, and banata redirects them back. how it works your app links the user to banata's hosted sign-in page, passing your project's client_id as a query parameter. banata renders the sign-in ui with the auth methods and providers you've configured for  prerequisites the hosted ui reflects the configuration already saved for your project. before you test it, make sure you've completed the following in the banata dashboard: app requirements even though banata handles the ui, your app still needs a few things in place: proxy route set up the /api/auth/[...all] proxy route in your app. this is the same route used by the primary sdk integration and is required for session management. api key your server must have a valid project-scoped api key. create one in the dashboard under api keys and store it as an environment variable. see the api keys guide for details. callback handling your app needs a /auth/callback route that receives the redirect from banata after the user authenticates. if this route is missing or misconfigured, the hosted flow will complete successfully on the  branding the hosted ui uses the same project configuration as the dashboard and the sdk. that means: troubleshooting the hosted page loads but shows no sign-in options your project is missing auth configuration. check authentication > methods to confirm at least one method is enabled, and check authentication > providers to confirm credentials are configured for any the hosted flow completes but the user is still unauthenticated check the following: rate limit exceeded banata rate-limits sensitive auth endpoints per project, ip, path, and (for email-based flows) the submitted identifier. if you're hitting rate limits during development: the hosted page returns the wrong project verify that the client_id parameter is set to the project's client id from the banata dashboard. this is not the workspace slug or workspace name — it's the id shown on the project's settings page. next steps quick start — set up the primary app-owned auth integration with @banata-auth/nextjs api keys — create and manage the keys that connect your app to a project"
  },
  {
    "slug": "introduction",
    "title": "Introduction",
    "description": "Banata Auth is a complete authentication and user management platform for web applications. Add sign-in, organizations, roles, SSO, and more to your app.",
    "section": "Start Here",
    "headings": [
      {
        "level": 2,
        "text": "What is Banata Auth?",
        "anchor": "what-is-banata-auth",
        "snippet": "Banata Auth is an authentication and user management platform that gives your application everything it needs to handle users securely:"
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "Banata Auth runs as a separate service from your application. Your app doesn't store user data or manage sessions directly — Banata handles that for you."
      },
      {
        "level": 2,
        "text": "Key Concepts",
        "anchor": "key-concepts",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Projects",
        "anchor": "projects",
        "snippet": "A project is the top-level isolation boundary in Banata. Each project has its own users, organizations, roles, providers, and configuration. When you create an API key, it's scoped to a single project"
      },
      {
        "level": 3,
        "text": "API Keys",
        "anchor": "api-keys",
        "snippet": "An API key is how your app authenticates with Banata and identifies which project it belongs to. You store it as a server-side environment variable (BANATA_API_KEY). The API key does two things: it au"
      },
      {
        "level": 3,
        "text": "Dashboard",
        "anchor": "dashboard",
        "snippet": "The Banata dashboard is where you manage your projects. From the dashboard you can configure auth methods, set up OAuth providers, manage users and organizations, customize email templates, create API"
      },
      {
        "level": 2,
        "text": "Packages",
        "anchor": "packages",
        "snippet": "Banata Auth provides several packages for different parts of your integration:"
      },
      {
        "level": 2,
        "text": "Hosted vs. Self-Hosted",
        "anchor": "hosted-vs-self-hosted",
        "snippet": "Banata Auth can run in two modes:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Ready to get started? Head to the Quick Start guide to connect your first app to Banata in a few minutes."
      }
    ],
    "searchText": "introduction banata auth is a complete authentication and user management platform for web applications. add sign-in, organizations, roles, sso, and more to your app. what is banata auth? banata auth is an authentication and user management platform that gives your application everything it needs to handle users securely: how it works banata auth runs as a separate service from your application. your app doesn't store user data or manage sessions directly — banata handles that for you. key concepts projects a project is the top-level isolation boundary in banata. each project has its own users, organizations, roles, providers, and configuration. when you create an api key, it's scoped to a single project api keys an api key is how your app authenticates with banata and identifies which project it belongs to. you store it as a server-side environment variable (banata_api_key). the api key does two things: it au dashboard the banata dashboard is where you manage your projects. from the dashboard you can configure auth methods, set up oauth providers, manage users and organizations, customize email templates, create api packages banata auth provides several packages for different parts of your integration: hosted vs. self-hosted banata auth can run in two modes: what's next ready to get started? head to the quick start guide to connect your first app to banata in a few minutes."
  },
  {
    "slug": "invitations",
    "title": "Invitations",
    "description": "Invite members to organizations by email — create, accept, expire, and revoke invitations.",
    "section": "Organizations & RBAC",
    "headings": [
      {
        "level": 2,
        "text": "How Invitations Work",
        "anchor": "how-invitations-work",
        "snippet": "When you send an invitation, here's what happens:"
      },
      {
        "level": 2,
        "text": "Invitation Data Model",
        "anchor": "invitation-data-model",
        "snippet": "Each invitation contains the following fields:"
      },
      {
        "level": 3,
        "text": "Status Lifecycle",
        "anchor": "status-lifecycle",
        "snippet": "An invitation starts as pending and moves to one of three terminal states:"
      },
      {
        "level": 2,
        "text": "Email Delivery",
        "anchor": "email-delivery",
        "snippet": "Banata sends invitation emails automatically using the branded template system. Invitation emails use the invitation system template and inherit your project's branding (logo, colors, fonts) — no cust"
      },
      {
        "level": 3,
        "text": "Setting Up Email Delivery",
        "anchor": "setting-up-email-delivery",
        "snippet": "Configure an email provider — Go to Emails > Providers in the dashboard and add an active provider (e.g. Resend, SendGrid, or Postmark). Enable invitation emails — In Emails > Configuration, make sure"
      },
      {
        "level": 3,
        "text": "Overriding Invitation Emails",
        "anchor": "overriding-invitation-emails",
        "snippet": "If you need full control over invitation email delivery, you can provide a custom callback:"
      },
      {
        "level": 2,
        "text": "Client API",
        "anchor": "client-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Send an Invitation",
        "anchor": "send-an-invitation",
        "snippet": "Use authClient.organization.inviteMember to invite a user by email:"
      },
      {
        "level": 3,
        "text": "List Invitations",
        "anchor": "list-invitations",
        "snippet": "Fetch all invitations for an organization:"
      },
      {
        "level": 3,
        "text": "Accept an Invitation",
        "anchor": "accept-an-invitation",
        "snippet": "Accept an invitation on behalf of the currently signed-in user:"
      },
      {
        "level": 3,
        "text": "Revoke an Invitation",
        "anchor": "revoke-an-invitation",
        "snippet": "Cancel a pending invitation so it can no longer be accepted:"
      },
      {
        "level": 2,
        "text": "Invitation Acceptance Page",
        "anchor": "invitation-acceptance-page",
        "snippet": "You need a page in your app that handles the invite link. Create a route at /invite/[id]:"
      },
      {
        "level": 2,
        "text": "Server-Side Management",
        "anchor": "server-side-management",
        "snippet": "Use the Banata SDK to manage invitations from your server or backend scripts:"
      },
      {
        "level": 2,
        "text": "Expiration",
        "anchor": "expiration",
        "snippet": "Invitations expire after 7 days. Once expired, the status changes to \"expired\" and the link can no longer be used. To re-invite someone whose invitation expired, send a new invitation."
      },
      {
        "level": 2,
        "text": "Bulk Invitations",
        "anchor": "bulk-invitations",
        "snippet": "To invite multiple people at once, use Promise.allSettled to send invitations in parallel:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Invitation email not sent",
        "anchor": "invitation-email-not-sent",
        "snippet": "Verify you have an active email provider in Emails > Providers in the dashboard. Check that invitation emails are enabled in Emails > Configuration. Review your invitation template in Email Templates "
      },
      {
        "level": 3,
        "text": "\"Invitation already pending\"",
        "anchor": "invitation-already-pending",
        "snippet": "An invitation with the same email already exists for this organization. You have two options:"
      },
      {
        "level": 3,
        "text": "\"Organization membership limit reached\"",
        "anchor": "organization-membership-limit-reached",
        "snippet": "Your organization has hit its membership cap (default: 100). You can increase the limit in your organization settings in the dashboard."
      },
      {
        "level": 3,
        "text": "Invitation link not working",
        "anchor": "invitation-link-not-working",
        "snippet": "The invitation may have expired (older than 7 days). Send a new one. The invitation may have been revoked by an admin. Make sure you have an /invite/[id] route in your app that handles acceptance."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Organizations — Learn how to create and manage organizations. Roles & Permissions — Control what members can do within an organization. Webhooks — Get notified when invitations are created, accepted, "
      }
    ],
    "searchText": "invitations invite members to organizations by email — create, accept, expire, and revoke invitations. how invitations work when you send an invitation, here's what happens: invitation data model each invitation contains the following fields: status lifecycle an invitation starts as pending and moves to one of three terminal states: email delivery banata sends invitation emails automatically using the branded template system. invitation emails use the invitation system template and inherit your project's branding (logo, colors, fonts) — no cust setting up email delivery configure an email provider — go to emails > providers in the dashboard and add an active provider (e.g. resend, sendgrid, or postmark). enable invitation emails — in emails > configuration, make sure overriding invitation emails if you need full control over invitation email delivery, you can provide a custom callback: client api send an invitation use authclient.organization.invitemember to invite a user by email: list invitations fetch all invitations for an organization: accept an invitation accept an invitation on behalf of the currently signed-in user: revoke an invitation cancel a pending invitation so it can no longer be accepted: invitation acceptance page you need a page in your app that handles the invite link. create a route at /invite/[id]: server-side management use the banata sdk to manage invitations from your server or backend scripts: expiration invitations expire after 7 days. once expired, the status changes to \"expired\" and the link can no longer be used. to re-invite someone whose invitation expired, send a new invitation. bulk invitations to invite multiple people at once, use promise.allsettled to send invitations in parallel: troubleshooting invitation email not sent verify you have an active email provider in emails > providers in the dashboard. check that invitation emails are enabled in emails > configuration. review your invitation template in email templates  \"invitation already pending\" an invitation with the same email already exists for this organization. you have two options: \"organization membership limit reached\" your organization has hit its membership cap (default: 100). you can increase the limit in your organization settings in the dashboard. invitation link not working the invitation may have expired (older than 7 days). send a new one. the invitation may have been revoked by an admin. make sure you have an /invite/[id] route in your app that handles acceptance. next steps organizations — learn how to create and manage organizations. roles & permissions — control what members can do within an organization. webhooks — get notified when invitations are created, accepted, "
  },
  {
    "slug": "magic-links",
    "title": "Magic Links",
    "description": "Passwordless sign-in via email — users click a link to authenticate without a password.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Enable Magic Links",
        "anchor": "enable-magic-links",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard",
        "anchor": "via-the-dashboard",
        "snippet": "The quickest way to turn on magic links is through your Banata dashboard:"
      },
      {
        "level": 3,
        "text": "Via the SDK",
        "anchor": "via-the-sdk",
        "snippet": "You can also enable magic links programmatically:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": "Once magic links are enabled, you can trigger them from your frontend using authClient.signIn.magicLink:"
      },
      {
        "level": 3,
        "text": "Parameters",
        "anchor": "parameters",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Complete Form Example",
        "anchor": "complete-form-example",
        "snippet": "Here is a full React component that handles the magic link sign-in flow, including loading state, error handling, and a confirmation screen:"
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "When a user requests a magic link, here is what happens behind the scenes:"
      },
      {
        "level": 3,
        "text": "New Users vs. Existing Users",
        "anchor": "new-users-vs-existing-users",
        "snippet": "Magic links handle both cases automatically:"
      },
      {
        "level": 2,
        "text": "Token Lifetime",
        "anchor": "token-lifetime",
        "snippet": "Magic link tokens expire after 10 minutes. After that, the link becomes invalid and the user needs to request a new one. This short window keeps the authentication flow secure while giving users enoug"
      },
      {
        "level": 2,
        "text": "Combining with Other Methods",
        "anchor": "combining-with-other-methods",
        "snippet": "Magic links work well alongside other authentication methods. A common pattern is to offer magic links as the primary sign-in method with email/password as a fallback:"
      },
      {
        "level": 2,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "Magic link requests are rate-limited to prevent abuse:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Cryptographically signed — Each magic link token is signed so it cannot be forged or tampered with. Single-use — Once a magic link has been used to sign in, the token is invalidated and cannot be reus"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Magic link expired\"",
        "anchor": "magic-link-expired",
        "snippet": "The token is only valid for 10 minutes. Ask the user to request a new one. Common causes:"
      },
      {
        "level": 3,
        "text": "\"Invalid magic link\"",
        "anchor": "invalid-magic-link",
        "snippet": "The token signature could not be verified. This can happen if:"
      },
      {
        "level": 3,
        "text": "Email not received",
        "anchor": "email-not-received",
        "snippet": "If the magic link email is not arriving:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Email & Password — Add traditional sign-in as a fallback Social OAuth — Let users sign in with Google, GitHub, and more Multi-Factor Auth — Add TOTP as a second factor for extra security"
      }
    ],
    "searchText": "magic links passwordless sign-in via email — users click a link to authenticate without a password. enable magic links via the dashboard the quickest way to turn on magic links is through your banata dashboard: via the sdk you can also enable magic links programmatically: client-side api once magic links are enabled, you can trigger them from your frontend using authclient.signin.magiclink: parameters --- complete form example here is a full react component that handles the magic link sign-in flow, including loading state, error handling, and a confirmation screen: how it works when a user requests a magic link, here is what happens behind the scenes: new users vs. existing users magic links handle both cases automatically: token lifetime magic link tokens expire after 10 minutes. after that, the link becomes invalid and the user needs to request a new one. this short window keeps the authentication flow secure while giving users enoug combining with other methods magic links work well alongside other authentication methods. a common pattern is to offer magic links as the primary sign-in method with email/password as a fallback: rate limiting magic link requests are rate-limited to prevent abuse: security considerations cryptographically signed — each magic link token is signed so it cannot be forged or tampered with. single-use — once a magic link has been used to sign in, the token is invalidated and cannot be reus troubleshooting \"magic link expired\" the token is only valid for 10 minutes. ask the user to request a new one. common causes: \"invalid magic link\" the token signature could not be verified. this can happen if: email not received if the magic link email is not arriving: next steps email & password — add traditional sign-in as a fallback social oauth — let users sign in with google, github, and more multi-factor auth — add totp as a second factor for extra security"
  },
  {
    "slug": "mfa",
    "title": "Multi-Factor Authentication",
    "description": "Add TOTP-based two-factor authentication with authenticator apps and backup codes.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "What is TOTP-Based MFA?",
        "anchor": "what-is-totp-based-mfa",
        "snippet": "TOTP (Time-based One-Time Password) is the industry-standard algorithm behind most authenticator apps. Here is how it works:"
      },
      {
        "level": 2,
        "text": "Enabling MFA",
        "anchor": "enabling-mfa",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 1: Turn It On in the Dashboard",
        "anchor": "step-1-turn-it-on-in-the-dashboard",
        "snippet": "Open your project in the Banata Auth Dashboard. Navigate to Authentication > Methods. Find Two-Factor Authentication (TOTP) and toggle it on. Save your changes."
      },
      {
        "level": 3,
        "text": "Step 2: Add It to Your Client",
        "anchor": "step-2-add-it-to-your-client",
        "snippet": "Once MFA is enabled in the dashboard, you can use the twoFactor methods on your auth client. No additional SDK configuration is required beyond your standard auth client setup:"
      },
      {
        "level": 2,
        "text": "How the Setup Flow Works",
        "anchor": "how-the-setup-flow-works",
        "snippet": "When a user decides to enable MFA on their account, the flow looks like this:"
      },
      {
        "level": 2,
        "text": "Client API",
        "anchor": "client-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Enable Two-Factor Authentication",
        "anchor": "enable-two-factor-authentication",
        "snippet": "Call authClient.twoFactor.enable() to start MFA setup. You must pass the user's current password for re-authentication:"
      },
      {
        "level": 3,
        "text": "Verify a TOTP Code",
        "anchor": "verify-a-totp-code",
        "snippet": "After the user scans the QR code, have them enter a 6-digit code from their authenticator app to confirm everything is working:"
      },
      {
        "level": 3,
        "text": "Disable Two-Factor Authentication",
        "anchor": "disable-two-factor-authentication",
        "snippet": "To let users turn off MFA, call authClient.twoFactor.disable() with their current password:"
      },
      {
        "level": 2,
        "text": "Generating a QR Code",
        "anchor": "generating-a-qr-code",
        "snippet": "The totpURI returned by authClient.twoFactor.enable() is a standard otpauth:// URI. You can render it as a QR code using any QR library. Here is an example with qrcode.react:"
      },
      {
        "level": 2,
        "text": "Backup Codes",
        "anchor": "backup-codes",
        "snippet": "When MFA is enabled, backup codes are generated automatically. These are emergency recovery codes your users can use if they lose access to their authenticator app."
      },
      {
        "level": 3,
        "text": "Backup Code Format",
        "anchor": "backup-code-format",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Displaying Backup Codes",
        "anchor": "displaying-backup-codes",
        "snippet": "Show backup codes exactly once, immediately after MFA setup. Give your users a clear way to copy or save them:"
      },
      {
        "level": 3,
        "text": "Signing In with a Backup Code",
        "anchor": "signing-in-with-a-backup-code",
        "snippet": "During an MFA challenge, if the user cannot access their authenticator app, they can use a backup code instead:"
      },
      {
        "level": 2,
        "text": "Complete MFA Setup Component",
        "anchor": "complete-mfa-setup-component",
        "snippet": "Here is a full React component that walks users through the entire MFA setup process in four steps: enter password, scan QR code, verify code, and save backup codes."
      },
      {
        "level": 2,
        "text": "MFA Challenge During Sign-In",
        "anchor": "mfa-challenge-during-sign-in",
        "snippet": "When a user with MFA enabled signs in, the server returns a response indicating that a TOTP code is required before the session can be created. You need to detect this and show a second input step."
      },
      {
        "level": 3,
        "text": "Detecting the MFA Challenge",
        "anchor": "detecting-the-mfa-challenge",
        "snippet": "After calling authClient.signIn.email(), check whether the response indicates an MFA challenge:"
      },
      {
        "level": 3,
        "text": "Full Sign-In Component with MFA Support",
        "anchor": "full-sign-in-component-with-mfa-support",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Keep these best practices in mind when implementing MFA:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Invalid code\" errors during setup",
        "anchor": "invalid-code-errors-during-setup",
        "snippet": "If the user scans the QR code but the verification code is rejected, check the following:"
      },
      {
        "level": 3,
        "text": "Users locked out after losing their device",
        "anchor": "users-locked-out-after-losing-their-device",
        "snippet": "If a user loses access to their authenticator app and has no backup codes:"
      },
      {
        "level": 3,
        "text": "MFA challenge not appearing during sign-in",
        "anchor": "mfa-challenge-not-appearing-during-sign-in",
        "snippet": "If MFA-enabled users can sign in without being prompted for a code:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Organizations — Set up multi-tenant workspaces for your users. Roles & Permissions — Add fine-grained access control to your app. Webhooks — Get notified about authentication events including MFA chan"
      }
    ],
    "searchText": "multi-factor authentication add totp-based two-factor authentication with authenticator apps and backup codes. what is totp-based mfa? totp (time-based one-time password) is the industry-standard algorithm behind most authenticator apps. here is how it works: enabling mfa step 1: turn it on in the dashboard open your project in the banata auth dashboard. navigate to authentication > methods. find two-factor authentication (totp) and toggle it on. save your changes. step 2: add it to your client once mfa is enabled in the dashboard, you can use the twofactor methods on your auth client. no additional sdk configuration is required beyond your standard auth client setup: how the setup flow works when a user decides to enable mfa on their account, the flow looks like this: client api enable two-factor authentication call authclient.twofactor.enable() to start mfa setup. you must pass the user's current password for re-authentication: verify a totp code after the user scans the qr code, have them enter a 6-digit code from their authenticator app to confirm everything is working: disable two-factor authentication to let users turn off mfa, call authclient.twofactor.disable() with their current password: generating a qr code the totpuri returned by authclient.twofactor.enable() is a standard otpauth:// uri. you can render it as a qr code using any qr library. here is an example with qrcode.react: backup codes when mfa is enabled, backup codes are generated automatically. these are emergency recovery codes your users can use if they lose access to their authenticator app. backup code format displaying backup codes show backup codes exactly once, immediately after mfa setup. give your users a clear way to copy or save them: signing in with a backup code during an mfa challenge, if the user cannot access their authenticator app, they can use a backup code instead: complete mfa setup component here is a full react component that walks users through the entire mfa setup process in four steps: enter password, scan qr code, verify code, and save backup codes. mfa challenge during sign-in when a user with mfa enabled signs in, the server returns a response indicating that a totp code is required before the session can be created. you need to detect this and show a second input step. detecting the mfa challenge after calling authclient.signin.email(), check whether the response indicates an mfa challenge: full sign-in component with mfa support security considerations keep these best practices in mind when implementing mfa: troubleshooting \"invalid code\" errors during setup if the user scans the qr code but the verification code is rejected, check the following: users locked out after losing their device if a user loses access to their authenticator app and has no backup codes: mfa challenge not appearing during sign-in if mfa-enabled users can sign in without being prompted for a code: next steps organizations — set up multi-tenant workspaces for your users. roles & permissions — add fine-grained access control to your app. webhooks — get notified about authentication events including mfa chan"
  },
  {
    "slug": "nextjs",
    "title": "Next.js",
    "description": "Integrate Banata Auth into your Next.js app with server-side auth helpers, route proxying, and session management.",
    "section": "Build Your App",
    "headings": [
      {
        "level": 2,
        "text": "Setup",
        "anchor": "setup",
        "snippet": "If you haven't set up the basics yet, follow the Quick Start guide first. Here's a summary of what you need:"
      },
      {
        "level": 3,
        "text": "1. Environment Variables",
        "anchor": "1-environment-variables",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "2. Server Auth Helpers",
        "anchor": "2-server-auth-helpers",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "3. Auth Route",
        "anchor": "3-auth-route",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "4. OAuth Provider Callback URLs",
        "anchor": "4-oauth-provider-callback-urls",
        "snippet": "When you configure GitHub, Google, or another OAuth provider for a customer app, register your app callback URL, not a Banata-hosted page:"
      },
      {
        "level": 2,
        "text": "Server-Side Auth Helpers",
        "anchor": "server-side-auth-helpers",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Checking Authentication",
        "anchor": "checking-authentication",
        "snippet": "Use isAuthenticated in server components and route handlers to check if the current request has a valid session:"
      },
      {
        "level": 3,
        "text": "Getting the Auth Token",
        "anchor": "getting-the-auth-token",
        "snippet": "Use getToken when you need the raw auth token for server-side API calls:"
      },
      {
        "level": 3,
        "text": "Fetching Data with Auth Context",
        "anchor": "fetching-data-with-auth-context",
        "snippet": "If your app also uses Convex, the auth helpers let you run authenticated Convex queries and mutations from the server:"
      },
      {
        "level": 2,
        "text": "How the Proxy Works",
        "anchor": "how-the-proxy-works",
        "snippet": "When your browser calls /api/auth/sign-in/email, the Next.js route handler proxies that request to the Banata backend. The response (including session cookies) is passed back to the browser on your ap"
      },
      {
        "level": 2,
        "text": "Programmatic Configuration",
        "anchor": "programmatic-configuration",
        "snippet": "The @banata-auth/nextjs package handles transport and authentication. To change your project's configuration by code (auth methods, branding, providers), use the SDK:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Auth calls fail with a network error",
        "anchor": "auth-calls-fail-with-a-network-error",
        "snippet": "Check that BANATA_AUTH_URL is correct if you overrode it. Verify BANATA_API_KEY is set in your environment."
      },
      {
        "level": 3,
        "text": "No session after sign-in",
        "anchor": "no-session-after-sign-in",
        "snippet": "Make sure the auth route exists at src/app/api/auth/[...all]/route.ts. Verify /api/auth/get-session returns session data in your browser. Ensure your app and the auth route are on the same origin."
      },
      {
        "level": 3,
        "text": "\"Do I need a projectId or clientId?\"",
        "anchor": "do-i-need-a-projectid-or-clientid",
        "snippet": "No. The API key handles project binding automatically."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "React Components — Add pre-built UI and auth hooks SDK Reference — Manage Banata resources by code Email & Password — Configure email/password sign-in"
      }
    ],
    "searchText": "next.js integrate banata auth into your next.js app with server-side auth helpers, route proxying, and session management. setup if you haven't set up the basics yet, follow the quick start guide first. here's a summary of what you need: 1. environment variables 2. server auth helpers 3. auth route 4. oauth provider callback urls when you configure github, google, or another oauth provider for a customer app, register your app callback url, not a banata-hosted page: server-side auth helpers checking authentication use isauthenticated in server components and route handlers to check if the current request has a valid session: getting the auth token use gettoken when you need the raw auth token for server-side api calls: fetching data with auth context if your app also uses convex, the auth helpers let you run authenticated convex queries and mutations from the server: how the proxy works when your browser calls /api/auth/sign-in/email, the next.js route handler proxies that request to the banata backend. the response (including session cookies) is passed back to the browser on your ap programmatic configuration the @banata-auth/nextjs package handles transport and authentication. to change your project's configuration by code (auth methods, branding, providers), use the sdk: troubleshooting auth calls fail with a network error check that banata_auth_url is correct if you overrode it. verify banata_api_key is set in your environment. no session after sign-in make sure the auth route exists at src/app/api/auth/[...all]/route.ts. verify /api/auth/get-session returns session data in your browser. ensure your app and the auth route are on the same origin. \"do i need a projectid or clientid?\" no. the api key handles project binding automatically. next steps react components — add pre-built ui and auth hooks sdk reference — manage banata resources by code email & password — configure email/password sign-in"
  },
  {
    "slug": "notifications",
    "title": "Notifications",
    "description": "A focused view of the auth events that matter most — new users, security changes, organization activity, and key management.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Tracked Events",
        "anchor": "tracked-events",
        "snippet": "Notifications surface these high-signal event types:"
      },
      {
        "level": 2,
        "text": "Viewing Notifications in the Dashboard",
        "anchor": "viewing-notifications-in-the-dashboard",
        "snippet": "Open your project in the Banata dashboard. Click Notifications in the sidebar."
      },
      {
        "level": 2,
        "text": "Building Custom Notification Logic",
        "anchor": "building-custom-notification-logic",
        "snippet": "If you want to surface notifications in your own application or build custom alerting, use the SDK's audit log methods to fetch and filter events programmatically."
      },
      {
        "level": 2,
        "text": "Webhook-Based Notifications",
        "anchor": "webhook-based-notifications",
        "snippet": "For real-time push notifications — sending alerts to Slack, email, PagerDuty, or any other external service — use Webhooks instead of polling. Webhooks push events to your endpoint the moment they hap"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": "No notifications showing, but events are happening. Check the full Audit Logs page to confirm events are being recorded. Common high-frequency events like session.created are intentionally excluded fr"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Audit Logs — Search, filter, and export your full event history Webhooks — Push real-time event notifications to external services Radar & Bot Protection — Monitor and block suspicious authentication "
      }
    ],
    "searchText": "notifications a focused view of the auth events that matter most — new users, security changes, organization activity, and key management. tracked events notifications surface these high-signal event types: viewing notifications in the dashboard open your project in the banata dashboard. click notifications in the sidebar. building custom notification logic if you want to surface notifications in your own application or build custom alerting, use the sdk's audit log methods to fetch and filter events programmatically. webhook-based notifications for real-time push notifications — sending alerts to slack, email, pagerduty, or any other external service — use webhooks instead of polling. webhooks push events to your endpoint the moment they hap troubleshooting no notifications showing, but events are happening. check the full audit logs page to confirm events are being recorded. common high-frequency events like session.created are intentionally excluded fr next steps audit logs — search, filter, and export your full event history webhooks — push real-time event notifications to external services radar & bot protection — monitor and block suspicious authentication "
  },
  {
    "slug": "organizations-overview",
    "title": "Organizations",
    "description": "Multi-tenant workspaces with members, roles, and invitations — the foundation for B2B applications.",
    "section": "Organizations & RBAC",
    "headings": [
      {
        "level": 2,
        "text": "Enabling Organizations",
        "anchor": "enabling-organizations",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "1. Turn it on in the dashboard",
        "anchor": "1-turn-it-on-in-the-dashboard",
        "snippet": "Open your project in the Banata dashboard and navigate to Authentication > Methods. Toggle Organization to enabled."
      },
      {
        "level": 3,
        "text": "2. Configure options in your SDK client",
        "anchor": "2-configure-options-in-your-sdk-client",
        "snippet": "Once organizations are enabled in the dashboard, you can fine-tune behavior through the SDK configuration:"
      },
      {
        "level": 3,
        "text": "Configuration Options",
        "anchor": "configuration-options",
        "snippet": "These options are available in the dashboard under Authentication > Methods > Organization:"
      },
      {
        "level": 2,
        "text": "Data Model",
        "anchor": "data-model",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization",
        "anchor": "organization",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Member",
        "anchor": "member",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Invitation",
        "anchor": "invitation",
        "snippet": "Invitations track pending membership offers. For the full invitation lifecycle, see the Invitations guide."
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": "All client-side operations use the authClient you set up during installation."
      },
      {
        "level": 3,
        "text": "Create an Organization",
        "anchor": "create-an-organization",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List User's Organizations",
        "anchor": "list-users-organizations",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Set Active Organization",
        "anchor": "set-active-organization",
        "snippet": "When a user belongs to multiple organizations, they switch between them. The active organization is stored in the session:"
      },
      {
        "level": 3,
        "text": "Update an Organization",
        "anchor": "update-an-organization",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete an Organization",
        "anchor": "delete-an-organization",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "React Hooks",
        "anchor": "react-hooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "useOrganization()",
        "anchor": "useorganization",
        "snippet": "Returns the current active organization and loading state:"
      },
      {
        "level": 3,
        "text": "useBanataAuth()",
        "anchor": "usebanataauth",
        "snippet": "The full auth context includes organization data alongside user and session:"
      },
      {
        "level": 2,
        "text": "Member Management",
        "anchor": "member-management",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List Members",
        "anchor": "list-members",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Add a Member",
        "anchor": "add-a-member",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Update Member Role",
        "anchor": "update-member-role",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Remove a Member",
        "anchor": "remove-a-member",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Organization Switcher Component",
        "anchor": "organization-switcher-component",
        "snippet": "A common UI pattern is an organization switcher in your navigation. Here is a minimal example:"
      },
      {
        "level": 2,
        "text": "Server-Side Management (Admin SDK)",
        "anchor": "server-side-management-admin-sdk",
        "snippet": "You can manage organizations from your backend using the admin SDK. This is useful for admin panels, automated provisioning, or server-side workflows:"
      },
      {
        "level": 2,
        "text": "Invitation Management",
        "anchor": "invitation-management",
        "snippet": "You can send, accept, and revoke invitations from the client SDK. For the complete invitation lifecycle, email template configuration, and advanced flows, see the dedicated Invitations guide."
      },
      {
        "level": 3,
        "text": "Send an Invitation",
        "anchor": "send-an-invitation",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Accept an Invitation",
        "anchor": "accept-an-invitation",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Revoke an Invitation",
        "anchor": "revoke-an-invitation",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Invitations — Complete invitation lifecycle and email configuration Roles & Permissions — Fine-grained access control within organizations Webhooks — Get notified about organization events"
      }
    ],
    "searchText": "organizations multi-tenant workspaces with members, roles, and invitations — the foundation for b2b applications. enabling organizations 1. turn it on in the dashboard open your project in the banata dashboard and navigate to authentication > methods. toggle organization to enabled. 2. configure options in your sdk client once organizations are enabled in the dashboard, you can fine-tune behavior through the sdk configuration: configuration options these options are available in the dashboard under authentication > methods > organization: data model organization member invitation invitations track pending membership offers. for the full invitation lifecycle, see the invitations guide. client-side api all client-side operations use the authclient you set up during installation. create an organization list user's organizations set active organization when a user belongs to multiple organizations, they switch between them. the active organization is stored in the session: update an organization delete an organization react hooks useorganization() returns the current active organization and loading state: usebanataauth() the full auth context includes organization data alongside user and session: member management list members add a member update member role remove a member organization switcher component a common ui pattern is an organization switcher in your navigation. here is a minimal example: server-side management (admin sdk) you can manage organizations from your backend using the admin sdk. this is useful for admin panels, automated provisioning, or server-side workflows: invitation management you can send, accept, and revoke invitations from the client sdk. for the complete invitation lifecycle, email template configuration, and advanced flows, see the dedicated invitations guide. send an invitation accept an invitation revoke an invitation next steps invitations — complete invitation lifecycle and email configuration roles & permissions — fine-grained access control within organizations webhooks — get notified about organization events"
  },
  {
    "slug": "passkeys",
    "title": "Passkeys",
    "description": "WebAuthn-based passwordless authentication using biometrics, security keys, or device credentials.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Enabling Passkeys",
        "anchor": "enabling-passkeys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "From the Dashboard",
        "anchor": "from-the-dashboard",
        "snippet": "Go to Authentication > Methods in your project. Toggle on Passkeys. Configure the Passkey Settings panel that appears (see below)."
      },
      {
        "level": 3,
        "text": "From the SDK",
        "anchor": "from-the-sdk",
        "snippet": "If you prefer to configure passkeys programmatically, use saveDashboardConfig:"
      },
      {
        "level": 2,
        "text": "Configuration Options",
        "anchor": "configuration-options",
        "snippet": "> Important: The rpId must be a valid domain that matches or is a registrable suffix of the page origin. For example, if your app is at https://app.mycompany.com, the rpId can be \"app.mycompany.com\" o"
      },
      {
        "level": 3,
        "text": "Environment-Specific Values",
        "anchor": "environment-specific-values",
        "snippet": "In most setups, your RP ID and origin differ between development and production. A common pattern is to pass environment-specific values when calling saveDashboardConfig, or simply configure them sepa"
      },
      {
        "level": 2,
        "text": "Browser and Platform Support",
        "anchor": "browser-and-platform-support",
        "snippet": "Passkeys are supported on all modern browsers and platforms:"
      },
      {
        "level": 3,
        "text": "Cross-Device Authentication",
        "anchor": "cross-device-authentication",
        "snippet": "Modern passkey implementations support cross-device authentication -- a user can use their phone to authenticate on a desktop browser via Bluetooth proximity. This is handled natively by the browser a"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": "Banata Auth provides four passkey methods on the auth client."
      },
      {
        "level": 3,
        "text": "Register a Passkey",
        "anchor": "register-a-passkey",
        "snippet": "Users must be signed in to register a passkey. This is typically called from a security settings page:"
      },
      {
        "level": 3,
        "text": "Sign In with a Passkey",
        "anchor": "sign-in-with-a-passkey",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List Registered Passkeys",
        "anchor": "list-registered-passkeys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Passkey",
        "anchor": "delete-a-passkey",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Registration Component Example",
        "anchor": "registration-component-example",
        "snippet": "Here is a complete React component that lets users manage their passkeys from a settings page:"
      },
      {
        "level": 2,
        "text": "Sign-In with Passkey Example",
        "anchor": "sign-in-with-passkey-example",
        "snippet": "You can add a passkey sign-in button alongside your existing sign-in form:"
      },
      {
        "level": 2,
        "text": "Resident vs. Non-Resident Credentials",
        "anchor": "resident-vs-non-resident-credentials",
        "snippet": "WebAuthn defines two types of credentials:"
      },
      {
        "level": 2,
        "text": "Combining with Other Methods",
        "anchor": "combining-with-other-methods",
        "snippet": "Passkeys work well alongside other authentication methods. A common pattern is to let users sign up with email and password, then register a passkey from their account settings for faster future sign-"
      },
      {
        "level": 2,
        "text": "Security Advantages Over Passwords",
        "anchor": "security-advantages-over-passwords",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"WebAuthn not supported\"",
        "anchor": "webauthn-not-supported",
        "snippet": "The user's browser does not support the WebAuthn API. This is rare on modern browsers but can occur in older versions or embedded browser views (e.g., in-app browsers). You can check for support befor"
      },
      {
        "level": 3,
        "text": "\"Registration cancelled\"",
        "anchor": "registration-cancelled",
        "snippet": "The user dismissed the browser's passkey prompt. This is not an error -- simply allow the user to try again."
      },
      {
        "level": 3,
        "text": "\"Origin mismatch\"",
        "anchor": "origin-mismatch",
        "snippet": "The origin in your passkey configuration does not match the actual page origin. Make sure it matches exactly, including protocol and port. For example, http://localhost:3000 is not the same as http://"
      },
      {
        "level": 3,
        "text": "\"Passkey not found\"",
        "anchor": "passkey-not-found",
        "snippet": "No registered credentials match the rpId. This can happen if:"
      },
      {
        "level": 3,
        "text": "Users locked out after losing a device",
        "anchor": "users-locked-out-after-losing-a-device",
        "snippet": "If a user's only passkey was on a lost device, they need a fallback sign-in method. Always enable at least one alternative method (email/password, magic link, or social OAuth) so users can recover acc"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Email OTP -- Passwordless authentication via email codes Multi-Factor Auth -- Add TOTP as a second factor alongside passkeys Email & Password -- Traditional authentication as a fallback"
      }
    ],
    "searchText": "passkeys webauthn-based passwordless authentication using biometrics, security keys, or device credentials. enabling passkeys from the dashboard go to authentication > methods in your project. toggle on passkeys. configure the passkey settings panel that appears (see below). from the sdk if you prefer to configure passkeys programmatically, use savedashboardconfig: configuration options > important: the rpid must be a valid domain that matches or is a registrable suffix of the page origin. for example, if your app is at https://app.mycompany.com, the rpid can be \"app.mycompany.com\" o environment-specific values in most setups, your rp id and origin differ between development and production. a common pattern is to pass environment-specific values when calling savedashboardconfig, or simply configure them sepa browser and platform support passkeys are supported on all modern browsers and platforms: cross-device authentication modern passkey implementations support cross-device authentication -- a user can use their phone to authenticate on a desktop browser via bluetooth proximity. this is handled natively by the browser a client-side api banata auth provides four passkey methods on the auth client. register a passkey users must be signed in to register a passkey. this is typically called from a security settings page: sign in with a passkey list registered passkeys delete a passkey registration component example here is a complete react component that lets users manage their passkeys from a settings page: sign-in with passkey example you can add a passkey sign-in button alongside your existing sign-in form: resident vs. non-resident credentials webauthn defines two types of credentials: combining with other methods passkeys work well alongside other authentication methods. a common pattern is to let users sign up with email and password, then register a passkey from their account settings for faster future sign- security advantages over passwords --- troubleshooting \"webauthn not supported\" the user's browser does not support the webauthn api. this is rare on modern browsers but can occur in older versions or embedded browser views (e.g., in-app browsers). you can check for support befor \"registration cancelled\" the user dismissed the browser's passkey prompt. this is not an error -- simply allow the user to try again. \"origin mismatch\" the origin in your passkey configuration does not match the actual page origin. make sure it matches exactly, including protocol and port. for example, http://localhost:3000 is not the same as http:// \"passkey not found\" no registered credentials match the rpid. this can happen if: users locked out after losing a device if a user's only passkey was on a lost device, they need a fallback sign-in method. always enable at least one alternative method (email/password, magic link, or social oauth) so users can recover acc next steps email otp -- passwordless authentication via email codes multi-factor auth -- add totp as a second factor alongside passkeys email & password -- traditional authentication as a fallback"
  },
  {
    "slug": "project-structure",
    "title": "Project Structure",
    "description": "The files and packages you add to your app to integrate with Banata Auth, and what Banata manages for you.",
    "section": "Start Here",
    "headings": [
      {
        "level": 2,
        "text": "What You Add to Your App",
        "anchor": "what-you-add-to-your-app",
        "snippet": "A typical Banata integration adds these files to your Next.js project:"
      },
      {
        "level": 2,
        "text": "What Banata Manages",
        "anchor": "what-banata-manages",
        "snippet": "Banata owns the auth backend and all the data associated with it. Per project, Banata manages:"
      },
      {
        "level": 2,
        "text": "What You Don't Need",
        "anchor": "what-you-dont-need",
        "snippet": "When using Banata Auth (hosted or self-hosted), your app does not need:"
      },
      {
        "level": 2,
        "text": "File Reference",
        "anchor": "file-reference",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "src/lib/auth-server.ts",
        "anchor": "srclibauth-serverts",
        "snippet": "Initializes the server-side connection to Banata. This is where you pass your API key."
      },
      {
        "level": 3,
        "text": "src/lib/auth-client.ts",
        "anchor": "srclibauth-clientts",
        "snippet": "Creates the browser-side auth client that your React components use."
      },
      {
        "level": 3,
        "text": "src/app/api/auth/[...all]/route.ts",
        "anchor": "srcappapiauthallroutets",
        "snippet": "Catch-all route that proxies auth requests from your app to Banata."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Quick Start — Step-by-step setup guide Next.js Integration — Deep dive into the Next.js package React Components — UI components and hooks"
      }
    ],
    "searchText": "project structure the files and packages you add to your app to integrate with banata auth, and what banata manages for you. what you add to your app a typical banata integration adds these files to your next.js project: what banata manages banata owns the auth backend and all the data associated with it. per project, banata manages: what you don't need when using banata auth (hosted or self-hosted), your app does not need: file reference src/lib/auth-server.ts initializes the server-side connection to banata. this is where you pass your api key. src/lib/auth-client.ts creates the browser-side auth client that your react components use. src/app/api/auth/[...all]/route.ts catch-all route that proxies auth requests from your app to banata. next steps quick start — step-by-step setup guide next.js integration — deep dive into the next.js package react components — ui components and hooks"
  },
  {
    "slug": "projects-environments",
    "title": "Projects",
    "description": "Projects are the isolation boundary in Banata Auth. Each project has its own users, organizations, roles, and configuration.",
    "section": "Start Here",
    "headings": [
      {
        "level": 2,
        "text": "What a Project Contains",
        "anchor": "what-a-project-contains",
        "snippet": "Each project is a completely independent auth environment with its own:"
      },
      {
        "level": 2,
        "text": "When to Use Multiple Projects",
        "anchor": "when-to-use-multiple-projects",
        "snippet": "One project per application is the most common setup. But there are good reasons to use multiple projects:"
      },
      {
        "level": 2,
        "text": "Your Default Project",
        "anchor": "your-default-project",
        "snippet": "When you first sign in to the Banata dashboard, a default project is automatically created for you. This is your starting point — you can use it immediately or create additional projects as needed."
      },
      {
        "level": 2,
        "text": "Switching Projects in the Dashboard",
        "anchor": "switching-projects-in-the-dashboard",
        "snippet": "The project switcher in the dashboard lets you navigate between your projects. When you switch projects, the entire dashboard context changes — the users list, organizations, roles, providers, email t"
      },
      {
        "level": 2,
        "text": "How Your App Connects to a Project",
        "anchor": "how-your-app-connects-to-a-project",
        "snippet": "Your app connects to a project through an API key:"
      },
      {
        "level": 2,
        "text": "Managing Projects with the SDK",
        "anchor": "managing-projects-with-the-sdk",
        "snippet": "You can list and manage projects programmatically using the admin SDK:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "API Keys — How to create and manage project-scoped API keys Project Structure — What files to add to your app Quick Start — Set up your first app"
      }
    ],
    "searchText": "projects projects are the isolation boundary in banata auth. each project has its own users, organizations, roles, and configuration. what a project contains each project is a completely independent auth environment with its own: when to use multiple projects one project per application is the most common setup. but there are good reasons to use multiple projects: your default project when you first sign in to the banata dashboard, a default project is automatically created for you. this is your starting point — you can use it immediately or create additional projects as needed. switching projects in the dashboard the project switcher in the dashboard lets you navigate between your projects. when you switch projects, the entire dashboard context changes — the users list, organizations, roles, providers, email t how your app connects to a project your app connects to a project through an api key: managing projects with the sdk you can list and manage projects programmatically using the admin sdk: next steps api keys — how to create and manage project-scoped api keys project structure — what files to add to your app quick start — set up your first app"
  },
  {
    "slug": "quickstart",
    "title": "Quick Start",
    "description": "Connect a Next.js app to Banata Auth in under 10 minutes. Install packages, set up auth routes, and add sign-in pages.",
    "section": "Start Here",
    "headings": [
      {
        "level": 2,
        "text": "Prerequisites",
        "anchor": "prerequisites",
        "snippet": "Before writing code, set up your Banata project:"
      },
      {
        "level": 2,
        "text": "Step 1: Install Packages",
        "anchor": "step-1-install-packages",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 2: Set Environment Variables",
        "anchor": "step-2-set-environment-variables",
        "snippet": "Create or update your .env.local file:"
      },
      {
        "level": 2,
        "text": "Step 3: Create Server Auth Helpers",
        "anchor": "step-3-create-server-auth-helpers",
        "snippet": "This file initializes the server-side auth connection to Banata. The API key binds your app to your Banata project."
      },
      {
        "level": 2,
        "text": "Step 4: Create the Auth Route",
        "anchor": "step-4-create-the-auth-route",
        "snippet": "This catch-all route proxies all /api/auth/* requests from your app to Banata. This keeps auth cookies on your domain."
      },
      {
        "level": 2,
        "text": "Step 5: Create the Browser Auth Client",
        "anchor": "step-5-create-the-browser-auth-client",
        "snippet": "This client-side module is what your React components use to trigger sign-in, sign-up, sign-out, and other auth actions."
      },
      {
        "level": 2,
        "text": "Step 6: Add Sign-In and Sign-Up Pages",
        "anchor": "step-6-add-sign-in-and-sign-up-pages",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-In Page",
        "anchor": "sign-in-page",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-Up Page",
        "anchor": "sign-up-page",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 7: Protect Your Pages",
        "anchor": "step-7-protect-your-pages",
        "snippet": "Use the isAuthenticated helper to guard server-rendered pages:"
      },
      {
        "level": 2,
        "text": "Verify It Works",
        "anchor": "verify-it-works",
        "snippet": "Start your development server and test the full flow:"
      },
      {
        "level": 2,
        "text": "Configuring Banata by Code (Optional)",
        "anchor": "configuring-banata-by-code-optional",
        "snippet": "The dashboard is the easiest way to configure your project, but you can also use the SDK to manage configuration programmatically:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-in form renders but authentication fails",
        "anchor": "sign-in-form-renders-but-authentication-fails",
        "snippet": "Verify the auth method is enabled in the dashboard (e.g., Email & Password is toggled on). Check that provider credentials are configured if using social OAuth."
      },
      {
        "level": 3,
        "text": "Sign-in succeeds but the app shows no session",
        "anchor": "sign-in-succeeds-but-the-app-shows-no-session",
        "snippet": "Make sure your browser is calling /api/auth on your app's origin, not the Banata backend URL directly. Verify the auth route file exists at src/app/api/auth/[...all]/route.ts."
      },
      {
        "level": 3,
        "text": "Email verification or password reset emails aren't arriving",
        "anchor": "email-verification-or-password-reset-emails-arent-arriving",
        "snippet": "Configure an email provider under Emails > Providers in the dashboard. Make sure the relevant email type is enabled under Emails > Configuration. Customize your templates under Email Templates."
      },
      {
        "level": 3,
        "text": "Hitting rate limits during testing",
        "anchor": "hitting-rate-limits-during-testing",
        "snippet": "Banata rate-limits auth endpoints to prevent abuse. If you're hitting limits during development:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Now that your app is connected to Banata, explore these topics:"
      }
    ],
    "searchText": "quick start connect a next.js app to banata auth in under 10 minutes. install packages, set up auth routes, and add sign-in pages. prerequisites before writing code, set up your banata project: step 1: install packages step 2: set environment variables create or update your .env.local file: step 3: create server auth helpers this file initializes the server-side auth connection to banata. the api key binds your app to your banata project. step 4: create the auth route this catch-all route proxies all /api/auth/* requests from your app to banata. this keeps auth cookies on your domain. step 5: create the browser auth client this client-side module is what your react components use to trigger sign-in, sign-up, sign-out, and other auth actions. step 6: add sign-in and sign-up pages sign-in page sign-up page step 7: protect your pages use the isauthenticated helper to guard server-rendered pages: verify it works start your development server and test the full flow: configuring banata by code (optional) the dashboard is the easiest way to configure your project, but you can also use the sdk to manage configuration programmatically: troubleshooting sign-in form renders but authentication fails verify the auth method is enabled in the dashboard (e.g., email & password is toggled on). check that provider credentials are configured if using social oauth. sign-in succeeds but the app shows no session make sure your browser is calling /api/auth on your app's origin, not the banata backend url directly. verify the auth route file exists at src/app/api/auth/[...all]/route.ts. email verification or password reset emails aren't arriving configure an email provider under emails > providers in the dashboard. make sure the relevant email type is enabled under emails > configuration. customize your templates under email templates. hitting rate limits during testing banata rate-limits auth endpoints to prevent abuse. if you're hitting limits during development: next steps now that your app is connected to banata, explore these topics:"
  },
  {
    "slug": "radar",
    "title": "Radar",
    "description": "Layered defense against bots, credential stuffing, and automated threats with configurable providers and detection rules.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Supported Providers",
        "anchor": "supported-providers",
        "snippet": "Radar supports four bot detection providers. You can switch between them at any time from the dashboard."
      },
      {
        "level": 2,
        "text": "Enable and Configure Radar in the Dashboard",
        "anchor": "enable-and-configure-radar-in-the-dashboard",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Turn on Radar",
        "anchor": "turn-on-radar",
        "snippet": "Open your project in the dashboard Navigate to Radar in the sidebar Click Enable protection The status card turns green to confirm your project is protected"
      },
      {
        "level": 3,
        "text": "Configure Detection Rules",
        "anchor": "configure-detection-rules",
        "snippet": "Click the Configuration tab Toggle individual detection rules on or off (see the table below for what each rule does) Changes save automatically"
      },
      {
        "level": 3,
        "text": "Set Up a Bot Detection Provider",
        "anchor": "set-up-a-bot-detection-provider",
        "snippet": "In the Configuration tab, toggle Bot detection on Under Bot Detection Provider, select your provider from the dropdown Enter the required credentials for that provider"
      },
      {
        "level": 3,
        "text": "Review the Overview Tab",
        "anchor": "review-the-overview-tab",
        "snippet": "The Overview tab shows detection statistics — total detections, allowed requests, challenged requests, and blocked requests — along with a timeline chart. These populate once Radar is handling real tr"
      },
      {
        "level": 2,
        "text": "Detection Rules",
        "anchor": "detection-rules",
        "snippet": "Radar provides four detection rules that work alongside your chosen bot provider for defense in depth."
      },
      {
        "level": 2,
        "text": "Add Bot Protection to Your App",
        "anchor": "add-bot-protection-to-your-app",
        "snippet": "Once you have configured a provider in the dashboard, wire up your Next.js route handler to verify requests at runtime."
      },
      {
        "level": 3,
        "text": "Config-Aware Approach (Recommended)",
        "anchor": "config-aware-approach-recommended",
        "snippet": "This approach reads your provider credentials from the dashboard automatically. When you change the provider or credentials in the dashboard, the change takes effect within one minute."
      },
      {
        "level": 3,
        "text": "Direct Provider Approach (Vercel BotID)",
        "anchor": "direct-provider-approach-vercel-botid",
        "snippet": "If you are deployed on Vercel with BotID installed, you can wire it up directly without reading from the dashboard config."
      },
      {
        "level": 2,
        "text": "Combining with Rate Limiting",
        "anchor": "combining-with-rate-limiting",
        "snippet": "Radar's rate limiting detection rule complements Banata Auth's built-in per-endpoint rate limiting. The built-in rate limiter caps requests to specific auth endpoints (for example, 30 sign-in attempts"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": "\"Bot detected. Access denied.\" (403) — The provider flagged the request as automated. Verify that the provider's client-side widget loaded correctly in your layout or form, and check for browser exten"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Bot Protection — Full API reference for @banata-auth/nextjs/bot-protection Settings — Project-level configuration Audit Logs — Track security events and suspicious activity"
      }
    ],
    "searchText": "radar layered defense against bots, credential stuffing, and automated threats with configurable providers and detection rules. supported providers radar supports four bot detection providers. you can switch between them at any time from the dashboard. enable and configure radar in the dashboard turn on radar open your project in the dashboard navigate to radar in the sidebar click enable protection the status card turns green to confirm your project is protected configure detection rules click the configuration tab toggle individual detection rules on or off (see the table below for what each rule does) changes save automatically set up a bot detection provider in the configuration tab, toggle bot detection on under bot detection provider, select your provider from the dropdown enter the required credentials for that provider review the overview tab the overview tab shows detection statistics — total detections, allowed requests, challenged requests, and blocked requests — along with a timeline chart. these populate once radar is handling real tr detection rules radar provides four detection rules that work alongside your chosen bot provider for defense in depth. add bot protection to your app once you have configured a provider in the dashboard, wire up your next.js route handler to verify requests at runtime. config-aware approach (recommended) this approach reads your provider credentials from the dashboard automatically. when you change the provider or credentials in the dashboard, the change takes effect within one minute. direct provider approach (vercel botid) if you are deployed on vercel with botid installed, you can wire it up directly without reading from the dashboard config. combining with rate limiting radar's rate limiting detection rule complements banata auth's built-in per-endpoint rate limiting. the built-in rate limiter caps requests to specific auth endpoints (for example, 30 sign-in attempts troubleshooting \"bot detected. access denied.\" (403) — the provider flagged the request as automated. verify that the provider's client-side widget loaded correctly in your layout or form, and check for browser exten next steps bot protection — full api reference for @banata-auth/nextjs/bot-protection settings — project-level configuration audit logs — track security events and suspicious activity"
  },
  {
    "slug": "react",
    "title": "React",
    "description": "Pre-built sign-in and sign-up forms, auth provider, hooks for user and session state, and organization helpers.",
    "section": "Build Your App",
    "headings": [
      {
        "level": 2,
        "text": "Package Exports",
        "anchor": "package-exports",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Browser Auth Client",
        "anchor": "browser-auth-client",
        "snippet": "Before using any components or hooks, create a browser auth client. This client talks to your app's /api/auth route:"
      },
      {
        "level": 2,
        "text": "Pre-Built Forms",
        "anchor": "pre-built-forms",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "SignInForm",
        "anchor": "signinform",
        "snippet": "A complete sign-in form that supports all enabled auth methods:"
      },
      {
        "level": 3,
        "text": "SignUpForm",
        "anchor": "signupform",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "SocialButtons",
        "anchor": "socialbuttons",
        "snippet": "Render social login buttons for specific providers:"
      },
      {
        "level": 2,
        "text": "Auth Provider and Hooks",
        "anchor": "auth-provider-and-hooks",
        "snippet": "To access auth state in client components throughout your app, wrap your layout with BanataAuthProvider:"
      },
      {
        "level": 3,
        "text": "useUser()",
        "anchor": "useuser",
        "snippet": "Get the current user and auth status:"
      },
      {
        "level": 3,
        "text": "useSession()",
        "anchor": "usesession",
        "snippet": "Access the raw session data:"
      },
      {
        "level": 3,
        "text": "useOrganization()",
        "anchor": "useorganization",
        "snippet": "Get the active organization:"
      },
      {
        "level": 3,
        "text": "useBanataAuth()",
        "anchor": "usebanataauth",
        "snippet": "Access the full auth context:"
      },
      {
        "level": 2,
        "text": "Organization Client Plugin",
        "anchor": "organization-client-plugin",
        "snippet": "If your app uses organizations with custom roles, add the organizationClient plugin to support your project's role catalog:"
      },
      {
        "level": 2,
        "text": "Convex Bridge",
        "anchor": "convex-bridge",
        "snippet": "If your app uses Convex for data alongside Banata for auth, use BanataConvexProvider to bridge auth tokens into your Convex client:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Next.js Integration — Server-side auth helpers SDK Reference — Programmatic access to Banata Organizations — Multi-tenant workspaces Roles & Permissions — Access control within organizations"
      }
    ],
    "searchText": "react pre-built sign-in and sign-up forms, auth provider, hooks for user and session state, and organization helpers. package exports --- browser auth client before using any components or hooks, create a browser auth client. this client talks to your app's /api/auth route: pre-built forms signinform a complete sign-in form that supports all enabled auth methods: signupform socialbuttons render social login buttons for specific providers: auth provider and hooks to access auth state in client components throughout your app, wrap your layout with banataauthprovider: useuser() get the current user and auth status: usesession() access the raw session data: useorganization() get the active organization: usebanataauth() access the full auth context: organization client plugin if your app uses organizations with custom roles, add the organizationclient plugin to support your project's role catalog: convex bridge if your app uses convex for data alongside banata for auth, use banataconvexprovider to bridge auth tokens into your convex client: next steps next.js integration — server-side auth helpers sdk reference — programmatic access to banata organizations — multi-tenant workspaces roles & permissions — access control within organizations"
  },
  {
    "slug": "redirects",
    "title": "Redirects",
    "description": "Control where users are sent after sign-in, sign-out, email verification, password reset, and Admin Portal operations.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Application Redirects",
        "anchor": "application-redirects",
        "snippet": "These settings govern the core authentication experience for your end users."
      },
      {
        "level": 2,
        "text": "Admin Portal Redirects",
        "anchor": "admin-portal-redirects",
        "snippet": "These settings control where organization admins are sent after completing setup tasks in the Admin Portal."
      },
      {
        "level": 2,
        "text": "Managing Redirects in the Dashboard",
        "anchor": "managing-redirects-in-the-dashboard",
        "snippet": "Open the Redirects page from the dashboard sidebar. Every redirect setting is displayed as its own card."
      },
      {
        "level": 3,
        "text": "Single-Value Settings",
        "anchor": "single-value-settings",
        "snippet": "Click Edit on the card you want to change. Enter the URL in the inline input field. Press Enter to save, or Escape to cancel."
      },
      {
        "level": 3,
        "text": "Multi-Value Settings",
        "anchor": "multi-value-settings",
        "snippet": "Redirect URIs and Sign-out Redirects support multiple URLs:"
      },
      {
        "level": 3,
        "text": "Admin Portal Settings",
        "anchor": "admin-portal-settings",
        "snippet": "Click Edit Admin Portal redirects to unlock all five Admin Portal fields at once. Update the values you need. Click Save to persist your changes, or Cancel to discard them."
      },
      {
        "level": 2,
        "text": "Validation Rules",
        "anchor": "validation-rules",
        "snippet": "Keep these rules in mind when entering redirect URLs:"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "No wildcard URIs. Banata Auth requires every redirect URI to be an exact match. Wildcards are not supported, which prevents redirect-hijacking attacks."
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": "\"Redirect URI mismatch\" — The URL your client is requesting does not match any entry in your Redirect URIs list. Open the Redirects page in the dashboard and verify the URL is present exactly as your "
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Domains — Set up custom domains for your authentication services. Email & Password — Learn about the authentication flow that relies on password-reset redirects."
      }
    ],
    "searchText": "redirects control where users are sent after sign-in, sign-out, email verification, password reset, and admin portal operations. application redirects these settings govern the core authentication experience for your end users. admin portal redirects these settings control where organization admins are sent after completing setup tasks in the admin portal. managing redirects in the dashboard open the redirects page from the dashboard sidebar. every redirect setting is displayed as its own card. single-value settings click edit on the card you want to change. enter the url in the inline input field. press enter to save, or escape to cancel. multi-value settings redirect uris and sign-out redirects support multiple urls: admin portal settings click edit admin portal redirects to unlock all five admin portal fields at once. update the values you need. click save to persist your changes, or cancel to discard them. validation rules keep these rules in mind when entering redirect urls: security best practices no wildcard uris. banata auth requires every redirect uri to be an exact match. wildcards are not supported, which prevents redirect-hijacking attacks. troubleshooting \"redirect uri mismatch\" — the url your client is requesting does not match any entry in your redirect uris list. open the redirects page in the dashboard and verify the url is present exactly as your  next steps domains — set up custom domains for your authentication services. email & password — learn about the authentication flow that relies on password-reset redirects."
  },
  {
    "slug": "resource-types",
    "title": "Resource Types",
    "description": "Define categories of resources in your application for fine-grained authorization.",
    "section": "Organizations & RBAC",
    "headings": [
      {
        "level": 2,
        "text": "The Slug Convention",
        "anchor": "the-slug-convention",
        "snippet": "Every resource type has a slug — a short, lowercase identifier that becomes the prefix in your permission strings:"
      },
      {
        "level": 2,
        "text": "Creating Resource Types in the Dashboard",
        "anchor": "creating-resource-types-in-the-dashboard",
        "snippet": "The fastest way to set up resource types is through your Banata Auth dashboard."
      },
      {
        "level": 3,
        "text": "Auto-Generated Slugs",
        "anchor": "auto-generated-slugs",
        "snippet": "When you type a name, the dashboard automatically generates a slug by converting to lowercase and replacing spaces and special characters with hyphens."
      },
      {
        "level": 2,
        "text": "Managing via SDK or API",
        "anchor": "managing-via-sdk-or-api",
        "snippet": "You can also manage resource types programmatically using the Banata Auth SDK or REST API."
      },
      {
        "level": 3,
        "text": "List All Resource Types",
        "anchor": "list-all-resource-types",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Create a Resource Type",
        "anchor": "create-a-resource-type",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Resource Type",
        "anchor": "delete-a-resource-type",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Connecting Resource Types to Permissions",
        "anchor": "connecting-resource-types-to-permissions",
        "snippet": "Resource types are the foundation of your permission model. Here is how you build from resource types to runtime authorization checks."
      },
      {
        "level": 3,
        "text": "Step 1: Define Your Resource Types",
        "anchor": "step-1-define-your-resource-types",
        "snippet": "Start by identifying the core objects in your application that need access control."
      },
      {
        "level": 3,
        "text": "Step 2: Define Actions for Each Resource",
        "anchor": "step-2-define-actions-for-each-resource",
        "snippet": "Decide what users can do with each resource type."
      },
      {
        "level": 3,
        "text": "Step 3: Create Permission Strings",
        "anchor": "step-3-create-permission-strings",
        "snippet": "Combine resource type slugs with actions to form permission strings."
      },
      {
        "level": 3,
        "text": "Step 4: Assign Permissions to Roles",
        "anchor": "step-4-assign-permissions-to-roles",
        "snippet": "Group permissions into roles that match your application's access levels."
      },
      {
        "level": 3,
        "text": "Step 5: Check Permissions at Runtime",
        "anchor": "step-5-check-permissions-at-runtime",
        "snippet": "Use the SDK to verify access in your application code."
      },
      {
        "level": 2,
        "text": "Common Patterns",
        "anchor": "common-patterns",
        "snippet": "Here are resource type setups that work well for different types of applications."
      },
      {
        "level": 3,
        "text": "B2B SaaS",
        "anchor": "b2b-saas",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Developer Tool",
        "anchor": "developer-tool",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Content Platform",
        "anchor": "content-platform",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Use singular nouns — Use document, not documents. The slug represents a _type_, not a collection. Keep slugs short — Slugs appear in every permission string. doc is fine; documentation-file-resource i"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"A resource type with this slug already exists\"",
        "anchor": "a-resource-type-with-this-slug-already-exists",
        "snippet": "Slugs must be unique across your project. Either choose a different slug or delete the existing resource type first if it is no longer needed."
      },
      {
        "level": 3,
        "text": "Resource types not appearing in the dashboard",
        "anchor": "resource-types-not-appearing-in-the-dashboard",
        "snippet": "Make sure you are signed in with an account that has admin access. Resource type management requires admin-level authentication."
      },
      {
        "level": 3,
        "text": "Deleted resource type still referenced in permissions",
        "anchor": "deleted-resource-type-still-referenced-in-permissions",
        "snippet": "Deleting a resource type does not cascade to permission or role definitions. After deleting a resource type, review your roles and remove any permissions that used the deleted slug. Otherwise, those p"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Roles & Permissions — Assign permissions to roles using your resource type slugs Organizations — Set up multi-tenant workspaces where authorization is applied"
      }
    ],
    "searchText": "resource types define categories of resources in your application for fine-grained authorization. the slug convention every resource type has a slug — a short, lowercase identifier that becomes the prefix in your permission strings: creating resource types in the dashboard the fastest way to set up resource types is through your banata auth dashboard. auto-generated slugs when you type a name, the dashboard automatically generates a slug by converting to lowercase and replacing spaces and special characters with hyphens. managing via sdk or api you can also manage resource types programmatically using the banata auth sdk or rest api. list all resource types create a resource type delete a resource type connecting resource types to permissions resource types are the foundation of your permission model. here is how you build from resource types to runtime authorization checks. step 1: define your resource types start by identifying the core objects in your application that need access control. step 2: define actions for each resource decide what users can do with each resource type. step 3: create permission strings combine resource type slugs with actions to form permission strings. step 4: assign permissions to roles group permissions into roles that match your application's access levels. step 5: check permissions at runtime use the sdk to verify access in your application code. common patterns here are resource type setups that work well for different types of applications. b2b saas developer tool content platform --- best practices use singular nouns — use document, not documents. the slug represents a _type_, not a collection. keep slugs short — slugs appear in every permission string. doc is fine; documentation-file-resource i troubleshooting \"a resource type with this slug already exists\" slugs must be unique across your project. either choose a different slug or delete the existing resource type first if it is no longer needed. resource types not appearing in the dashboard make sure you are signed in with an account that has admin access. resource type management requires admin-level authentication. deleted resource type still referenced in permissions deleting a resource type does not cascade to permission or role definitions. after deleting a resource type, review your roles and remove any permissions that used the deleted slug. otherwise, those p next steps roles & permissions — assign permissions to roles using your resource type slugs organizations — set up multi-tenant workspaces where authorization is applied"
  },
  {
    "slug": "roles-permissions",
    "title": "Roles & Permissions",
    "description": "Define custom roles, create permissions, and control what users can do within organizations.",
    "section": "Organizations & RBAC",
    "headings": [
      {
        "level": 2,
        "text": "The Default Role: super_admin",
        "anchor": "the-default-role-superadmin",
        "snippet": "When your project is created, Banata seeds a single role called super_admin. This role has full access to every built-in permission and serves as the starting point for your authorization model."
      },
      {
        "level": 2,
        "text": "Permission Model",
        "anchor": "permission-model",
        "snippet": "Permissions in Banata are project-scoped. That means the permission catalog you define is shared across all organizations in your project. Individual organizations do not maintain separate permission "
      },
      {
        "level": 3,
        "text": "Built-in Permissions",
        "anchor": "built-in-permissions",
        "snippet": "These are seeded automatically when your project is created. They cover core platform operations and cannot be deleted or edited. Examples include:"
      },
      {
        "level": 3,
        "text": "Custom Permissions",
        "anchor": "custom-permissions",
        "snippet": "These are the permissions you create for your own application logic. Use the resource.action naming convention to keep things consistent. Examples:"
      },
      {
        "level": 2,
        "text": "Creating Roles and Permissions from the Dashboard",
        "anchor": "creating-roles-and-permissions-from-the-dashboard",
        "snippet": "The dashboard gives you a visual way to manage your entire authorization model. Follow these steps:"
      },
      {
        "level": 3,
        "text": "Step 1: Create Your Permissions",
        "anchor": "step-1-create-your-permissions",
        "snippet": "Open your project in the dashboard. Navigate to Authorization > Permissions. Click Create Permission. Enter a slug using the resource.action format (for example, employee.read)."
      },
      {
        "level": 3,
        "text": "Step 2: Create Your Roles",
        "anchor": "step-2-create-your-roles",
        "snippet": "Navigate to Authorization > Roles. Click Create Role. Enter a slug (for example, hr_manager), a display name, and an optional description."
      },
      {
        "level": 3,
        "text": "Step 3: Assign Permissions to Roles",
        "anchor": "step-3-assign-permissions-to-roles",
        "snippet": "From the roles list, find the role you just created and click Manage Permissions. You will see the full list of available permissions (both built-in and custom)."
      },
      {
        "level": 3,
        "text": "Step 4: Assign Roles to Members",
        "anchor": "step-4-assign-roles-to-members",
        "snippet": "Open the organization member screen. Select a member and assign them the appropriate role slug."
      },
      {
        "level": 2,
        "text": "Creating Roles and Permissions via the SDK",
        "anchor": "creating-roles-and-permissions-via-the-sdk",
        "snippet": "You can also manage roles and permissions programmatically using the Banata SDK."
      },
      {
        "level": 3,
        "text": "Initialize the Client",
        "anchor": "initialize-the-client",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Manage Roles",
        "anchor": "manage-roles",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Manage Permissions",
        "anchor": "manage-permissions",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Assigning and Revoking Roles",
        "anchor": "assigning-and-revoking-roles",
        "snippet": "Roles are assigned at the organization level. A user can hold a role within a specific organization."
      },
      {
        "level": 2,
        "text": "Permission Checks",
        "anchor": "permission-checks",
        "snippet": "Use permission checks to determine whether a user is allowed to perform a specific action. You can pass the permission as a { resource, action } object."
      },
      {
        "level": 3,
        "text": "Check a Single Permission",
        "anchor": "check-a-single-permission",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Check Multiple Permissions",
        "anchor": "check-multiple-permissions",
        "snippet": "Use the operator field to require that the user has all of the listed permissions:"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Keep super_admin limited. Only assign it to trusted organization owners. Create purpose-built roles for everyone else."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Organizations Overview — Learn how organizations work and how members are managed. API Keys — Set up API key authentication for your project. Getting Started — Return to the setup guide if you haven't"
      }
    ],
    "searchText": "roles & permissions define custom roles, create permissions, and control what users can do within organizations. the default role: super_admin when your project is created, banata seeds a single role called super_admin. this role has full access to every built-in permission and serves as the starting point for your authorization model. permission model permissions in banata are project-scoped. that means the permission catalog you define is shared across all organizations in your project. individual organizations do not maintain separate permission  built-in permissions these are seeded automatically when your project is created. they cover core platform operations and cannot be deleted or edited. examples include: custom permissions these are the permissions you create for your own application logic. use the resource.action naming convention to keep things consistent. examples: creating roles and permissions from the dashboard the dashboard gives you a visual way to manage your entire authorization model. follow these steps: step 1: create your permissions open your project in the dashboard. navigate to authorization > permissions. click create permission. enter a slug using the resource.action format (for example, employee.read). step 2: create your roles navigate to authorization > roles. click create role. enter a slug (for example, hr_manager), a display name, and an optional description. step 3: assign permissions to roles from the roles list, find the role you just created and click manage permissions. you will see the full list of available permissions (both built-in and custom). step 4: assign roles to members open the organization member screen. select a member and assign them the appropriate role slug. creating roles and permissions via the sdk you can also manage roles and permissions programmatically using the banata sdk. initialize the client manage roles manage permissions assigning and revoking roles roles are assigned at the organization level. a user can hold a role within a specific organization. permission checks use permission checks to determine whether a user is allowed to perform a specific action. you can pass the permission as a { resource, action } object. check a single permission check multiple permissions use the operator field to require that the user has all of the listed permissions: best practices keep super_admin limited. only assign it to trusted organization owners. create purpose-built roles for everyone else. next steps organizations overview — learn how organizations work and how members are managed. api keys — set up api key authentication for your project. getting started — return to the setup guide if you haven't"
  },
  {
    "slug": "scim",
    "title": "Directory Sync (SCIM)",
    "description": "Automated user provisioning and deprovisioning via SCIM 2.0 directory synchronization.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Key Capabilities",
        "anchor": "key-capabilities",
        "snippet": "Automatic provisioning — New employees added in the IdP are automatically created as users in your application. Automatic deprovisioning — Employees removed from the IdP are disabled and their session"
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Directories and Organizations",
        "anchor": "directories-and-organizations",
        "snippet": "Each SCIM directory is scoped to a specific organization in Banata Auth. This means every customer organization can have its own directory connection, keeping user provisioning isolated per tenant. Yo"
      },
      {
        "level": 3,
        "text": "Push-Based Synchronization",
        "anchor": "push-based-synchronization",
        "snippet": "Banata Auth exposes a SCIM 2.0-compliant endpoint for each directory. The IdP pushes user and group changes to this endpoint in real time. Whenever a change occurs in the IdP — a new hire, a terminati"
      },
      {
        "level": 3,
        "text": "Authentication",
        "anchor": "authentication",
        "snippet": "All SCIM endpoints are authenticated using a bearer token. Each directory has its own unique token, generated at the time of directory creation. The IdP must include this token in the Authorization he"
      },
      {
        "level": 2,
        "text": "Supported SCIM Operations",
        "anchor": "supported-scim-operations",
        "snippet": "Banata Auth processes the following SCIM operations:"
      },
      {
        "level": 2,
        "text": "Dashboard Setup",
        "anchor": "dashboard-setup",
        "snippet": "You can create and manage SCIM directories directly from the Banata Auth dashboard."
      },
      {
        "level": 3,
        "text": "Step 1: Navigate to Directory Sync",
        "anchor": "step-1-navigate-to-directory-sync",
        "snippet": "Open the Banata Auth dashboard and navigate to the Directory Sync section under your project settings. This page lists all configured SCIM directories across your organizations."
      },
      {
        "level": 3,
        "text": "Step 2: Create a Directory",
        "anchor": "step-2-create-a-directory",
        "snippet": "Click Create Directory and fill in the required fields:"
      },
      {
        "level": 3,
        "text": "Step 3: Copy the SCIM Endpoint and Bearer Token",
        "anchor": "step-3-copy-the-scim-endpoint-and-bearer-token",
        "snippet": "After creating the directory, Banata Auth displays:"
      },
      {
        "level": 3,
        "text": "Step 4: Configure Your Identity Provider",
        "anchor": "step-4-configure-your-identity-provider",
        "snippet": "Use the SCIM endpoint URL and bearer token to configure provisioning in your IdP. The exact steps vary by provider:"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": "You can also manage SCIM directories programmatically using the Banata Auth SDK."
      },
      {
        "level": 3,
        "text": "Initialize the Client",
        "anchor": "initialize-the-client",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List SCIM Directories",
        "anchor": "list-scim-directories",
        "snippet": "Retrieve all configured SCIM directories across your project:"
      },
      {
        "level": 3,
        "text": "Get a Specific Directory",
        "anchor": "get-a-specific-directory",
        "snippet": "Retrieve details about a single directory by its ID:"
      },
      {
        "level": 3,
        "text": "Create a Directory",
        "anchor": "create-a-directory",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Directory",
        "anchor": "delete-a-directory",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "SCIM Events",
        "anchor": "scim-events",
        "snippet": "When the IdP pushes changes to the SCIM endpoint, Banata Auth processes each operation and triggers the corresponding internal action. The table below summarizes the supported events and their effects"
      },
      {
        "level": 3,
        "text": "Webhook Integration",
        "anchor": "webhook-integration",
        "snippet": "You can subscribe to SCIM-related events via webhooks to trigger custom logic in your application when directory changes occur. The following webhook event types are available:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Organizations — Learn how to set up the organizations that SCIM directories are scoped to. Single Sign-On (SSO) — Pair Directory Sync with SSO to give your enterprise customers a complete identity man"
      }
    ],
    "searchText": "directory sync (scim) automated user provisioning and deprovisioning via scim 2.0 directory synchronization. key capabilities automatic provisioning — new employees added in the idp are automatically created as users in your application. automatic deprovisioning — employees removed from the idp are disabled and their session how it works directories and organizations each scim directory is scoped to a specific organization in banata auth. this means every customer organization can have its own directory connection, keeping user provisioning isolated per tenant. yo push-based synchronization banata auth exposes a scim 2.0-compliant endpoint for each directory. the idp pushes user and group changes to this endpoint in real time. whenever a change occurs in the idp — a new hire, a terminati authentication all scim endpoints are authenticated using a bearer token. each directory has its own unique token, generated at the time of directory creation. the idp must include this token in the authorization he supported scim operations banata auth processes the following scim operations: dashboard setup you can create and manage scim directories directly from the banata auth dashboard. step 1: navigate to directory sync open the banata auth dashboard and navigate to the directory sync section under your project settings. this page lists all configured scim directories across your organizations. step 2: create a directory click create directory and fill in the required fields: step 3: copy the scim endpoint and bearer token after creating the directory, banata auth displays: step 4: configure your identity provider use the scim endpoint url and bearer token to configure provisioning in your idp. the exact steps vary by provider: sdk usage you can also manage scim directories programmatically using the banata auth sdk. initialize the client list scim directories retrieve all configured scim directories across your project: get a specific directory retrieve details about a single directory by its id: create a directory delete a directory scim events when the idp pushes changes to the scim endpoint, banata auth processes each operation and triggers the corresponding internal action. the table below summarizes the supported events and their effects webhook integration you can subscribe to scim-related events via webhooks to trigger custom logic in your application when directory changes occur. the following webhook event types are available: next steps organizations — learn how to set up the organizations that scim directories are scoped to. single sign-on (sso) — pair directory sync with sso to give your enterprise customers a complete identity man"
  },
  {
    "slug": "sdk",
    "title": "SDK Reference",
    "description": "The admin SDK for managing users, organizations, roles, webhooks, and project configuration programmatically.",
    "section": "Build Your App",
    "headings": [
      {
        "level": 2,
        "text": "Getting Started",
        "anchor": "getting-started",
        "snippet": "Initialize the SDK with your project-scoped API key:"
      },
      {
        "level": 2,
        "text": "Resource Managers",
        "anchor": "resource-managers",
        "snippet": "The SDK organizes its functionality into resource managers, each accessed as a property on the BanataAuth instance:"
      },
      {
        "level": 2,
        "text": "User Management",
        "anchor": "user-management",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Organizations",
        "anchor": "organizations",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Roles and Permissions",
        "anchor": "roles-and-permissions",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "The SDK can update the same project configuration that the dashboard manages:"
      },
      {
        "level": 3,
        "text": "Auth Methods",
        "anchor": "auth-methods",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Branding",
        "anchor": "branding",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Social Provider Credentials",
        "anchor": "social-provider-credentials",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Webhooks",
        "anchor": "webhooks",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Audit Logs",
        "anchor": "audit-logs",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Error Handling",
        "anchor": "error-handling",
        "snippet": "The SDK throws typed errors from @banata-auth/shared:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "API Keys — Creating and managing API keys Organizations — Multi-tenant workspaces Roles & Permissions — Access control Webhooks — Event-driven integrations"
      }
    ],
    "searchText": "sdk reference the admin sdk for managing users, organizations, roles, webhooks, and project configuration programmatically. getting started initialize the sdk with your project-scoped api key: resource managers the sdk organizes its functionality into resource managers, each accessed as a property on the banataauth instance: user management organizations roles and permissions configuration the sdk can update the same project configuration that the dashboard manages: auth methods branding social provider credentials webhooks audit logs error handling the sdk throws typed errors from @banata-auth/shared: next steps api keys — creating and managing api keys organizations — multi-tenant workspaces roles & permissions — access control webhooks — event-driven integrations"
  },
  {
    "slug": "self-hosting",
    "title": "Self-Hosting",
    "description": "Run the full Banata platform on your own infrastructure.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "Product Shape",
        "anchor": "product-shape",
        "snippet": "The self-hosted and hosted versions of Banata follow the same workflow:"
      },
      {
        "level": 2,
        "text": "What You Need",
        "anchor": "what-you-need",
        "snippet": "To run Banata yourself, you need four things:"
      },
      {
        "level": 2,
        "text": "Local Convex Wiring",
        "anchor": "local-convex-wiring",
        "snippet": "Your self-hosted deployment keeps a small set of local Convex files alongside the published @banata-auth/convex package:"
      },
      {
        "level": 3,
        "text": "What stays local",
        "anchor": "what-stays-local",
        "snippet": "These files live in your repository because they bind platform configuration to your specific environment:"
      },
      {
        "level": 3,
        "text": "What comes from @banata-auth/convex",
        "anchor": "what-comes-from-banata-authconvex",
        "snippet": "The published package provides everything that is shared across all Banata deployments:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Quick Start -- integrate Banata auth into a customer application. Deploy -- step-by-step guide for deploying the Banata platform. Environment Variables -- every configuration value your self-hosted in"
      }
    ],
    "searchText": "self-hosting run the full banata platform on your own infrastructure. product shape the self-hosted and hosted versions of banata follow the same workflow: what you need to run banata yourself, you need four things: local convex wiring your self-hosted deployment keeps a small set of local convex files alongside the published @banata-auth/convex package: what stays local these files live in your repository because they bind platform configuration to your specific environment: what comes from @banata-auth/convex the published package provides everything that is shared across all banata deployments: next steps quick start -- integrate banata auth into a customer application. deploy -- step-by-step guide for deploying the banata platform. environment variables -- every configuration value your self-hosted in"
  },
  {
    "slug": "settings",
    "title": "Settings",
    "description": "Manage your project identity, review your auth configuration at a glance, and handle destructive actions from the Settings page.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "General",
        "anchor": "general",
        "snippet": "The General page is where you manage your project's identity. You land here by default when you open Settings."
      },
      {
        "level": 3,
        "text": "Project Name",
        "anchor": "project-name",
        "snippet": "Your project name is the human-readable label that appears throughout the dashboard. You can change it at any time - just type a new name (up to 100 characters) and click Save changes."
      },
      {
        "level": 3,
        "text": "Description",
        "anchor": "description",
        "snippet": "Add an optional description (up to 500 characters) to help your team understand what the project is for. This is especially useful if you manage multiple Banata Auth projects."
      },
      {
        "level": 3,
        "text": "Client ID",
        "anchor": "client-id",
        "snippet": "Your Client ID is a read-only identifier assigned to your project. Banata uses it internally for callback URLs and public configuration lookups. You don't need it for day-to-day SDK usage - project-sc"
      },
      {
        "level": 2,
        "text": "Auth Overview",
        "anchor": "auth-overview",
        "snippet": "The Auth Overview page gives you a read-only snapshot of your current authentication setup. Nothing is editable here - it's purely informational, with links to the relevant configuration pages if you "
      },
      {
        "level": 2,
        "text": "Team",
        "anchor": "team",
        "snippet": "The Team page shows the account that is currently managing the active project, along with its access level. Banata now limits this page to live access information instead of showing placeholder invite"
      },
      {
        "level": 2,
        "text": "Danger Zone",
        "anchor": "danger-zone",
        "snippet": "The Danger Zone contains irreversible actions that affect your entire project. Both actions require you to type a confirmation phrase before they execute."
      },
      {
        "level": 3,
        "text": "Reset Configuration",
        "anchor": "reset-configuration",
        "snippet": "Resetting your configuration returns dashboard-managed settings to their defaults. This clears:"
      },
      {
        "level": 3,
        "text": "Delete Project",
        "anchor": "delete-project",
        "snippet": "Deleting your project permanently removes everything associated with it:"
      },
      {
        "level": 2,
        "text": "Branding",
        "anchor": "branding",
        "snippet": "Branding is configured from the Branding page in the dashboard sidebar (not under Settings). From there you control how your sign-in/sign-up forms and transactional emails look. See the Email Template"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Radar & Bot Protection - Set up bot detection rules and provider credentials. Bot Protection Package - Integrate bot detection into your Next.js app. Domains - Configure custom domains for your auth s"
      }
    ],
    "searchText": "settings manage your project identity, review your auth configuration at a glance, and handle destructive actions from the settings page. general the general page is where you manage your project's identity. you land here by default when you open settings. project name your project name is the human-readable label that appears throughout the dashboard. you can change it at any time - just type a new name (up to 100 characters) and click save changes. description add an optional description (up to 500 characters) to help your team understand what the project is for. this is especially useful if you manage multiple banata auth projects. client id your client id is a read-only identifier assigned to your project. banata uses it internally for callback urls and public configuration lookups. you don't need it for day-to-day sdk usage - project-sc auth overview the auth overview page gives you a read-only snapshot of your current authentication setup. nothing is editable here - it's purely informational, with links to the relevant configuration pages if you  team the team page shows the account that is currently managing the active project, along with its access level. banata now limits this page to live access information instead of showing placeholder invite danger zone the danger zone contains irreversible actions that affect your entire project. both actions require you to type a confirmation phrase before they execute. reset configuration resetting your configuration returns dashboard-managed settings to their defaults. this clears: delete project deleting your project permanently removes everything associated with it: branding branding is configured from the branding page in the dashboard sidebar (not under settings). from there you control how your sign-in/sign-up forms and transactional emails look. see the email template next steps radar & bot protection - set up bot detection rules and provider credentials. bot protection package - integrate bot detection into your next.js app. domains - configure custom domains for your auth s"
  },
  {
    "slug": "shared",
    "title": "Shared Package",
    "description": "Types, constants, validation utilities, ID generation, and error classes shared across all Banata Auth packages.",
    "section": "Platform Operators",
    "headings": [
      {
        "level": 2,
        "text": "Installation",
        "anchor": "installation",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Package Structure",
        "anchor": "package-structure",
        "snippet": "The shared package exports six modules, all re-exported from the package root:"
      },
      {
        "level": 2,
        "text": "TypeScript Interfaces",
        "anchor": "typescript-interfaces",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "User",
        "anchor": "user",
        "snippet": "The central identity record. Every authenticated person in a Banata project has one."
      },
      {
        "level": 3,
        "text": "Session",
        "anchor": "session",
        "snippet": "Represents an active login. Sessions are tied to a user and optionally scoped to an organization."
      },
      {
        "level": 3,
        "text": "Account",
        "anchor": "account",
        "snippet": "Links a user to an authentication provider (email/password, GitHub, Google, SSO, etc.)."
      },
      {
        "level": 3,
        "text": "Organization",
        "anchor": "organization",
        "snippet": "A workspace that groups users together. Organizations can enforce MFA, restrict email domains, and enable SSO."
      },
      {
        "level": 3,
        "text": "OrganizationMember",
        "anchor": "organizationmember",
        "snippet": "Tracks a user's membership and role within an organization."
      },
      {
        "level": 3,
        "text": "SSO and Directory Types",
        "anchor": "sso-and-directory-types",
        "snippet": "SSO connections (SsoConnection) and directory sync resources (Directory, DirectoryUser, DirectoryGroup) follow the same pattern. Key type aliases you will encounter:"
      },
      {
        "level": 3,
        "text": "Other Resources",
        "anchor": "other-resources",
        "snippet": "The shared package also defines interfaces for OrganizationInvitation, Team, SsoProfile, AuditEvent, WebhookEndpoint, ApiKey, VaultSecret, DomainVerification, and Project. Each follows the same conven"
      },
      {
        "level": 2,
        "text": "Constants",
        "anchor": "constants",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "ID Prefixes",
        "anchor": "id-prefixes",
        "snippet": "Every Banata Auth resource uses a prefixed ULID as its identifier. The prefix makes IDs self-documenting -- you can tell at a glance what kind of resource you are looking at."
      },
      {
        "level": 3,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "Default rate limits per endpoint category, expressed as requests per minute:"
      },
      {
        "level": 3,
        "text": "Token Lifetimes",
        "anchor": "token-lifetimes",
        "snippet": "Default lifetimes for tokens and sessions, in seconds:"
      },
      {
        "level": 3,
        "text": "Webhook Constants",
        "anchor": "webhook-constants",
        "snippet": "Webhook retry behavior is controlled by three constants:"
      },
      {
        "level": 2,
        "text": "ID Generation",
        "anchor": "id-generation",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "generateId",
        "anchor": "generateid",
        "snippet": "Generate a prefixed ULID for any resource type:"
      },
      {
        "level": 3,
        "text": "ulid",
        "anchor": "ulid",
        "snippet": "Generate a raw ULID without a prefix:"
      },
      {
        "level": 3,
        "text": "getResourceType",
        "anchor": "getresourcetype",
        "snippet": "Extract the resource type from a prefixed ID:"
      },
      {
        "level": 3,
        "text": "validateId",
        "anchor": "validateid",
        "snippet": "Check whether an ID has the correct prefix for a given resource type:"
      },
      {
        "level": 3,
        "text": "generateRandomToken",
        "anchor": "generaterandomtoken",
        "snippet": "Generate a URL-safe base64 random token (useful for password-reset links, magic links, etc.):"
      },
      {
        "level": 3,
        "text": "generateOtp",
        "anchor": "generateotp",
        "snippet": "Generate a random numeric one-time password:"
      },
      {
        "level": 2,
        "text": "Validation Schemas",
        "anchor": "validation-schemas",
        "snippet": "All validation schemas are built with Zod. They are used throughout the backend for input validation, and you can use them in your own code for form validation or API contracts."
      },
      {
        "level": 3,
        "text": "Primitive Schemas",
        "anchor": "primitive-schemas",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Resource Schemas",
        "anchor": "resource-schemas",
        "snippet": "Each resource has a create and update schema, plus a corresponding TypeScript input type:"
      },
      {
        "level": 2,
        "text": "Error Classes",
        "anchor": "error-classes",
        "snippet": "All Banata Auth errors extend BanataAuthError, which provides structured error information with HTTP status codes, machine-readable codes, and request IDs."
      },
      {
        "level": 3,
        "text": "Specialized Errors",
        "anchor": "specialized-errors",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Usage",
        "anchor": "usage",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Block System",
        "anchor": "email-block-system",
        "snippet": "The shared package defines the block type system used by the email template editor, SDK, and backend renderer. Block types include heading, text, button, image, divider, spacer, link, code, and column"
      },
      {
        "level": 2,
        "text": "Pagination Types",
        "anchor": "pagination-types",
        "snippet": "All list endpoints use cursor-based pagination with a consistent shape:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Convex Integration -- the platform runtime that uses these shared definitions SDK Reference -- the admin SDK that consumes these types Email Templates -- full guide to the block-based email system"
      }
    ],
    "searchText": "shared package types, constants, validation utilities, id generation, and error classes shared across all banata auth packages. installation package structure the shared package exports six modules, all re-exported from the package root: typescript interfaces user the central identity record. every authenticated person in a banata project has one. session represents an active login. sessions are tied to a user and optionally scoped to an organization. account links a user to an authentication provider (email/password, github, google, sso, etc.). organization a workspace that groups users together. organizations can enforce mfa, restrict email domains, and enable sso. organizationmember tracks a user's membership and role within an organization. sso and directory types sso connections (ssoconnection) and directory sync resources (directory, directoryuser, directorygroup) follow the same pattern. key type aliases you will encounter: other resources the shared package also defines interfaces for organizationinvitation, team, ssoprofile, auditevent, webhookendpoint, apikey, vaultsecret, domainverification, and project. each follows the same conven constants id prefixes every banata auth resource uses a prefixed ulid as its identifier. the prefix makes ids self-documenting -- you can tell at a glance what kind of resource you are looking at. rate limits default rate limits per endpoint category, expressed as requests per minute: token lifetimes default lifetimes for tokens and sessions, in seconds: webhook constants webhook retry behavior is controlled by three constants: id generation generateid generate a prefixed ulid for any resource type: ulid generate a raw ulid without a prefix: getresourcetype extract the resource type from a prefixed id: validateid check whether an id has the correct prefix for a given resource type: generaterandomtoken generate a url-safe base64 random token (useful for password-reset links, magic links, etc.): generateotp generate a random numeric one-time password: validation schemas all validation schemas are built with zod. they are used throughout the backend for input validation, and you can use them in your own code for form validation or api contracts. primitive schemas resource schemas each resource has a create and update schema, plus a corresponding typescript input type: error classes all banata auth errors extend banataautherror, which provides structured error information with http status codes, machine-readable codes, and request ids. specialized errors usage email block system the shared package defines the block type system used by the email template editor, sdk, and backend renderer. block types include heading, text, button, image, divider, spacer, link, code, and column pagination types all list endpoints use cursor-based pagination with a consistent shape: next steps convex integration -- the platform runtime that uses these shared definitions sdk reference -- the admin sdk that consumes these types email templates -- full guide to the block-based email system"
  },
  {
    "slug": "social-oauth",
    "title": "Social OAuth",
    "description": "Add social login with Google, GitHub, Apple, Microsoft, and more. Step-by-step setup for each provider.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Supported Providers",
        "anchor": "supported-providers",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Setting Up a Provider",
        "anchor": "setting-up-a-provider",
        "snippet": "The setup is the same for every provider:"
      },
      {
        "level": 3,
        "text": "Callback URL Pattern",
        "anchor": "callback-url-pattern",
        "snippet": "All providers use the same callback URL format:"
      },
      {
        "level": 3,
        "text": "Adding Credentials via Dashboard",
        "anchor": "adding-credentials-via-dashboard",
        "snippet": "Go to Authentication > Providers in your project. Select the provider you want to configure. Enter the Client ID and Client Secret. Save."
      },
      {
        "level": 3,
        "text": "Adding Credentials via Convex Environment",
        "anchor": "adding-credentials-via-convex-environment",
        "snippet": "For self-hosted setups, set the credentials on your Convex deployment:"
      },
      {
        "level": 2,
        "text": "Provider Setup Guides",
        "anchor": "provider-setup-guides",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Google",
        "anchor": "google",
        "snippet": "Go to Google Cloud Console > Credentials. Create a new OAuth client ID (Web application type). Add authorized redirect URI: http://localhost:3000/api/auth/callback/google"
      },
      {
        "level": 3,
        "text": "GitHub",
        "anchor": "github",
        "snippet": "Go to GitHub Developer Settings > OAuth Apps. Click New OAuth App. Set Homepage URL to http://localhost:3000. Set Authorization callback URL to http://localhost:3000/api/auth/callback/github."
      },
      {
        "level": 3,
        "text": "Apple",
        "anchor": "apple",
        "snippet": "Go to Apple Developer Portal. Create an App ID with Sign in with Apple enabled. Create a Services ID (this is your clientId). Configure the redirect URL: http://localhost:3000/api/auth/callback/apple"
      },
      {
        "level": 3,
        "text": "Microsoft (Azure AD)",
        "anchor": "microsoft-azure-ad",
        "snippet": "Go to Azure Portal > App registrations. Click New registration. Set redirect URI to http://localhost:3000/api/auth/callback/microsoft (Web platform). Note the Application (client) ID and Directory (te"
      },
      {
        "level": 3,
        "text": "Facebook",
        "anchor": "facebook",
        "snippet": "Go to Meta for Developers. Create a new app (Consumer type). Add Facebook Login and set the redirect URI: http://localhost:3000/api/auth/callback/facebook"
      },
      {
        "level": 3,
        "text": "Twitter (X)",
        "anchor": "twitter-x",
        "snippet": "Go to the Twitter Developer Portal. Create a new project and app with OAuth 2.0 enabled. Set callback URL: http://localhost:3000/api/auth/callback/twitter"
      },
      {
        "level": 3,
        "text": "Discord",
        "anchor": "discord",
        "snippet": "Go to the Discord Developer Portal. Create a new application. Go to OAuth2 and add redirect: http://localhost:3000/api/auth/callback/discord"
      },
      {
        "level": 3,
        "text": "Spotify, Twitch, LinkedIn",
        "anchor": "spotify-twitch-linkedin",
        "snippet": "Follow the same pattern on each provider's developer portal: Spotify Dashboard Twitch Developer Console LinkedIn Developer Portal"
      },
      {
        "level": 2,
        "text": "Client-Side Usage",
        "anchor": "client-side-usage",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Initiating Social Sign-In",
        "anchor": "initiating-social-sign-in",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using the SocialButtons Component",
        "anchor": "using-the-socialbuttons-component",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "How the OAuth Flow Works",
        "anchor": "how-the-oauth-flow-works",
        "snippet": "Here's what happens when a user clicks \"Sign in with GitHub\":"
      },
      {
        "level": 2,
        "text": "Account Linking",
        "anchor": "account-linking",
        "snippet": "For customer apps, the provider callback registered in GitHub or Google is still /api/auth/callback/{provider} on your app domain. The callbackURL in authClient.signIn.social(...) is only the page Ban"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"redirect_uri_mismatch\" error",
        "anchor": "redirecturimismatch-error",
        "snippet": "The callback URL in your provider settings doesn't match the actual URL. Make sure it's exactly: Development: http://localhost:3000/api/auth/callback/{provider}"
      },
      {
        "level": 3,
        "text": "\"Access Denied\" after granting permission",
        "anchor": "access-denied-after-granting-permission",
        "snippet": "Verify the Client Secret is correctly set. Check that the provider is configured in your Banata project. For Microsoft, make sure tenantId is set."
      },
      {
        "level": 3,
        "text": "User created without name or email",
        "anchor": "user-created-without-name-or-email",
        "snippet": "Some providers don't return all user fields by default. Check the provider's scope settings to ensure you're requesting the right permissions."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Magic Links — Passwordless authentication via email Multi-Factor Auth — Add TOTP as a second factor Organizations — Multi-tenant workspaces"
      }
    ],
    "searchText": "social oauth add social login with google, github, apple, microsoft, and more. step-by-step setup for each provider. supported providers --- setting up a provider the setup is the same for every provider: callback url pattern all providers use the same callback url format: adding credentials via dashboard go to authentication > providers in your project. select the provider you want to configure. enter the client id and client secret. save. adding credentials via convex environment for self-hosted setups, set the credentials on your convex deployment: provider setup guides google go to google cloud console > credentials. create a new oauth client id (web application type). add authorized redirect uri: http://localhost:3000/api/auth/callback/google github go to github developer settings > oauth apps. click new oauth app. set homepage url to http://localhost:3000. set authorization callback url to http://localhost:3000/api/auth/callback/github. apple go to apple developer portal. create an app id with sign in with apple enabled. create a services id (this is your clientid). configure the redirect url: http://localhost:3000/api/auth/callback/apple microsoft (azure ad) go to azure portal > app registrations. click new registration. set redirect uri to http://localhost:3000/api/auth/callback/microsoft (web platform). note the application (client) id and directory (te facebook go to meta for developers. create a new app (consumer type). add facebook login and set the redirect uri: http://localhost:3000/api/auth/callback/facebook twitter (x) go to the twitter developer portal. create a new project and app with oauth 2.0 enabled. set callback url: http://localhost:3000/api/auth/callback/twitter discord go to the discord developer portal. create a new application. go to oauth2 and add redirect: http://localhost:3000/api/auth/callback/discord spotify, twitch, linkedin follow the same pattern on each provider's developer portal: spotify dashboard twitch developer console linkedin developer portal client-side usage initiating social sign-in using the socialbuttons component how the oauth flow works here's what happens when a user clicks \"sign in with github\": account linking for customer apps, the provider callback registered in github or google is still /api/auth/callback/{provider} on your app domain. the callbackurl in authclient.signin.social(...) is only the page ban troubleshooting \"redirect_uri_mismatch\" error the callback url in your provider settings doesn't match the actual url. make sure it's exactly: development: http://localhost:3000/api/auth/callback/{provider} \"access denied\" after granting permission verify the client secret is correctly set. check that the provider is configured in your banata project. for microsoft, make sure tenantid is set. user created without name or email some providers don't return all user fields by default. check the provider's scope settings to ensure you're requesting the right permissions. next steps magic links — passwordless authentication via email multi-factor auth — add totp as a second factor organizations — multi-tenant workspaces"
  },
  {
    "slug": "sso",
    "title": "Single Sign-On (SSO)",
    "description": "Enterprise SSO with SAML 2.0 and OpenID Connect (OIDC) for organization-level authentication.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Supported Protocols",
        "anchor": "supported-protocols",
        "snippet": "Banata Auth supports the two industry-standard SSO protocols:"
      },
      {
        "level": 2,
        "text": "How SSO Works",
        "anchor": "how-sso-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization-Scoped Connections",
        "anchor": "organization-scoped-connections",
        "snippet": "Every SSO connection belongs to an organization. This gives you fine-grained control over which identity providers serve which customers:"
      },
      {
        "level": 3,
        "text": "Domain-Based Routing",
        "anchor": "domain-based-routing",
        "snippet": "When a user initiates SSO login, Banata Auth uses their email domain to determine which identity provider to route them to:"
      },
      {
        "level": 3,
        "text": "Just-in-Time (JIT) Provisioning",
        "anchor": "just-in-time-jit-provisioning",
        "snippet": "When a user authenticates via SSO for the first time and no matching account exists, Banata Auth automatically:"
      },
      {
        "level": 2,
        "text": "Dashboard Setup",
        "anchor": "dashboard-setup",
        "snippet": "The fastest way to set up SSO is through the Banata Auth dashboard."
      },
      {
        "level": 3,
        "text": "Creating an SSO Connection",
        "anchor": "creating-an-sso-connection",
        "snippet": "Navigate to the SSO section in the dashboard. Click Create Connection. Select the organization that this connection belongs to. Choose the protocol: SAML 2.0 or OIDC."
      },
      {
        "level": 3,
        "text": "Configuring SAML 2.0",
        "anchor": "configuring-saml-20",
        "snippet": "After creating a SAML connection, you need to exchange metadata between Banata Auth and the IdP."
      },
      {
        "level": 3,
        "text": "Configuring OIDC",
        "anchor": "configuring-oidc",
        "snippet": "For OIDC connections, you'll need the following from the IdP:"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": "You can also manage SSO connections programmatically with the Banata Auth SDK."
      },
      {
        "level": 3,
        "text": "Initialize the Client",
        "anchor": "initialize-the-client",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List SSO Connections",
        "anchor": "list-sso-connections",
        "snippet": "Retrieve all SSO connections for your project:"
      },
      {
        "level": 3,
        "text": "Get a Specific Connection",
        "anchor": "get-a-specific-connection",
        "snippet": "Fetch details for a single connection by ID:"
      },
      {
        "level": 3,
        "text": "Create a Connection",
        "anchor": "create-a-connection",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Initiate SSO Login",
        "anchor": "initiate-sso-login",
        "snippet": "Redirect the user to their IdP for authentication:"
      },
      {
        "level": 2,
        "text": "Connection Field Reference",
        "anchor": "connection-field-reference",
        "snippet": "Each protocol requires different configuration fields. Use these tables as a reference when setting up connections."
      },
      {
        "level": 3,
        "text": "SAML 2.0",
        "anchor": "saml-20",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "OIDC",
        "anchor": "oidc",
        "snippet": "Fields marked as provided by Banata Auth (acsUrl, spEntityId) are generated when the connection is created and must be configured in the IdP."
      },
      {
        "level": 2,
        "text": "Security",
        "anchor": "security",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Project Scoping",
        "anchor": "project-scoping",
        "snippet": "SSO connections are scoped to your project. A connection created in one project cannot be accessed or used by another project, even within the same account. This ensures tenant isolation in multi-proj"
      },
      {
        "level": 3,
        "text": "Domain Verification",
        "anchor": "domain-verification",
        "snippet": "When you associate domains with an SSO connection, Banata Auth enforces that only users with matching email domains are routed through that connection. This prevents unauthorized domain claims and ens"
      },
      {
        "level": 3,
        "text": "Signature Validation",
        "anchor": "signature-validation",
        "snippet": "For SAML connections, Banata Auth validates the XML signature on every assertion using the X.509 certificate you provided during setup. Assertions with invalid, expired, or missing signatures are reje"
      },
      {
        "level": 3,
        "text": "Additional Safeguards",
        "anchor": "additional-safeguards",
        "snippet": "Replay protection — SAML assertions include a unique ID and timestamp. Banata Auth rejects assertions that have already been consumed or that fall outside the allowed time window."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Organizations — Learn how to create and manage the organizations that SSO connections belong to. Authentication — See how SSO fits into the broader Banata Auth authentication flow."
      }
    ],
    "searchText": "single sign-on (sso) enterprise sso with saml 2.0 and openid connect (oidc) for organization-level authentication. supported protocols banata auth supports the two industry-standard sso protocols: how sso works organization-scoped connections every sso connection belongs to an organization. this gives you fine-grained control over which identity providers serve which customers: domain-based routing when a user initiates sso login, banata auth uses their email domain to determine which identity provider to route them to: just-in-time (jit) provisioning when a user authenticates via sso for the first time and no matching account exists, banata auth automatically: dashboard setup the fastest way to set up sso is through the banata auth dashboard. creating an sso connection navigate to the sso section in the dashboard. click create connection. select the organization that this connection belongs to. choose the protocol: saml 2.0 or oidc. configuring saml 2.0 after creating a saml connection, you need to exchange metadata between banata auth and the idp. configuring oidc for oidc connections, you'll need the following from the idp: sdk usage you can also manage sso connections programmatically with the banata auth sdk. initialize the client list sso connections retrieve all sso connections for your project: get a specific connection fetch details for a single connection by id: create a connection initiate sso login redirect the user to their idp for authentication: connection field reference each protocol requires different configuration fields. use these tables as a reference when setting up connections. saml 2.0 oidc fields marked as provided by banata auth (acsurl, spentityid) are generated when the connection is created and must be configured in the idp. security project scoping sso connections are scoped to your project. a connection created in one project cannot be accessed or used by another project, even within the same account. this ensures tenant isolation in multi-proj domain verification when you associate domains with an sso connection, banata auth enforces that only users with matching email domains are routed through that connection. this prevents unauthorized domain claims and ens signature validation for saml connections, banata auth validates the xml signature on every assertion using the x.509 certificate you provided during setup. assertions with invalid, expired, or missing signatures are reje additional safeguards replay protection — saml assertions include a unique id and timestamp. banata auth rejects assertions that have already been consumed or that fall outside the allowed time window. next steps organizations — learn how to create and manage the organizations that sso connections belong to. authentication — see how sso fits into the broader banata auth authentication flow."
  },
  {
    "slug": "username-auth",
    "title": "Username Authentication",
    "description": "Sign in with a username and password instead of an email address.",
    "section": "Configure Authentication",
    "headings": [
      {
        "level": 2,
        "text": "When to Use Username Auth",
        "anchor": "when-to-use-username-auth",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Enabling Username Auth",
        "anchor": "enabling-username-auth",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "From the Dashboard",
        "anchor": "from-the-dashboard",
        "snippet": "Open your project in the Banata Auth dashboard. Go to Authentication > Methods. Toggle on Username & Password. Click Save."
      },
      {
        "level": 3,
        "text": "From the SDK",
        "anchor": "from-the-sdk",
        "snippet": "You can also enable username auth programmatically:"
      },
      {
        "level": 2,
        "text": "Username Validation Rules",
        "anchor": "username-validation-rules",
        "snippet": "Banata Auth enforces the following rules on all usernames:"
      },
      {
        "level": 2,
        "text": "Client API",
        "anchor": "client-api",
        "snippet": "The auth client exposes three methods for username auth:"
      },
      {
        "level": 3,
        "text": "Sign Up",
        "anchor": "sign-up",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign In",
        "anchor": "sign-in",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Check Availability",
        "anchor": "check-availability",
        "snippet": "Before the user submits the sign-up form, you can check if their desired username is available:"
      },
      {
        "level": 2,
        "text": "Complete Sign-Up Form with Availability Checking",
        "anchor": "complete-sign-up-form-with-availability-checking",
        "snippet": "Here is a full React example that debounces the availability check and disables the submit button when the username is taken:"
      },
      {
        "level": 2,
        "text": "Sign-In Form Example",
        "anchor": "sign-in-form-example",
        "snippet": "A minimal sign-in form for username auth:"
      },
      {
        "level": 2,
        "text": "Combining Username with Email/Password",
        "anchor": "combining-username-with-emailpassword",
        "snippet": "You can enable both authentication methods so users can sign in with either a username or an email address:"
      },
      {
        "level": 2,
        "text": "Password Reset Without Email",
        "anchor": "password-reset-without-email",
        "snippet": "If a user signed up with only a username and no email, the standard \"forgot password\" email flow is not available. You have a few options:"
      },
      {
        "level": 2,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "Username auth endpoints are rate-limited to prevent brute-force attacks:"
      },
      {
        "level": 2,
        "text": "Error Reference",
        "anchor": "error-reference",
        "snippet": "You can handle these by checking the error.status code:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Invalid username format\"",
        "anchor": "invalid-username-format",
        "snippet": "The username does not meet the validation rules. Make sure it:"
      },
      {
        "level": 3,
        "text": "\"Username already taken\"",
        "anchor": "username-already-taken",
        "snippet": "Another user has already claimed that username. Remember that usernames are case-insensitive, so JaneDoe and janedoe count as the same name. Prompt the user to choose a different one, or use checkAvai"
      },
      {
        "level": 3,
        "text": "\"Cannot reset password\"",
        "anchor": "cannot-reset-password",
        "snippet": "The user signed up with a username only and has no email on their account. Use the admin SDK to reset their password, or ask them to add an email address first."
      },
      {
        "level": 3,
        "text": "Sign-in returns 401 but the username exists",
        "anchor": "sign-in-returns-401-but-the-username-exists",
        "snippet": "The most likely cause is an incorrect password. The error message is intentionally vague (\"Invalid username or password\") to prevent username enumeration. Double-check that the password is correct and"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Email & Password -- Add traditional email-based authentication alongside username auth Social OAuth -- Let users link a Google, GitHub, or other social account"
      }
    ],
    "searchText": "username authentication sign in with a username and password instead of an email address. when to use username auth --- enabling username auth from the dashboard open your project in the banata auth dashboard. go to authentication > methods. toggle on username & password. click save. from the sdk you can also enable username auth programmatically: username validation rules banata auth enforces the following rules on all usernames: client api the auth client exposes three methods for username auth: sign up sign in check availability before the user submits the sign-up form, you can check if their desired username is available: complete sign-up form with availability checking here is a full react example that debounces the availability check and disables the submit button when the username is taken: sign-in form example a minimal sign-in form for username auth: combining username with email/password you can enable both authentication methods so users can sign in with either a username or an email address: password reset without email if a user signed up with only a username and no email, the standard \"forgot password\" email flow is not available. you have a few options: rate limits username auth endpoints are rate-limited to prevent brute-force attacks: error reference you can handle these by checking the error.status code: troubleshooting \"invalid username format\" the username does not meet the validation rules. make sure it: \"username already taken\" another user has already claimed that username. remember that usernames are case-insensitive, so janedoe and janedoe count as the same name. prompt the user to choose a different one, or use checkavai \"cannot reset password\" the user signed up with a username only and has no email on their account. use the admin sdk to reset their password, or ask them to add an email address first. sign-in returns 401 but the username exists the most likely cause is an incorrect password. the error message is intentionally vague (\"invalid username or password\") to prevent username enumeration. double-check that the password is correct and next steps email & password -- add traditional email-based authentication alongside username auth social oauth -- let users link a google, github, or other social account"
  },
  {
    "slug": "vault",
    "title": "Vault & Encryption",
    "description": "Application-level encryption for sensitive data with key management and field-level encryption support.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "The Vault uses AES-256-GCM (Galois/Counter Mode) authenticated encryption. Here's what happens under the hood:"
      },
      {
        "level": 2,
        "text": "What Gets Encrypted",
        "anchor": "what-gets-encrypted",
        "snippet": "The Vault automatically encrypts sensitive data across Banata Auth's internal subsystems:"
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "The Vault is enabled by default when the BETTER_AUTH_SECRET environment variable is set in your deployment. No additional configuration is required — the encryption key is derived directly from this s"
      },
      {
        "level": 3,
        "text": "Requirements",
        "anchor": "requirements",
        "snippet": "BETTER_AUTH_SECRET must be at least 32 characters Use a cryptographically random value (e.g., openssl rand -base64 48) Store it in your deployment's environment variables, not in source control"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Encrypting Data",
        "anchor": "encrypting-data",
        "snippet": "Store a secret in the Vault:"
      },
      {
        "level": 3,
        "text": "Decrypting Data",
        "anchor": "decrypting-data",
        "snippet": "Retrieve and decrypt a stored secret:"
      },
      {
        "level": 3,
        "text": "Listing Secrets",
        "anchor": "listing-secrets",
        "snippet": "List Vault secrets (metadata only — encrypted values are never returned in list responses):"
      },
      {
        "level": 3,
        "text": "Deleting a Secret",
        "anchor": "deleting-a-secret",
        "snippet": "Permanently remove a secret from the Vault:"
      },
      {
        "level": 3,
        "text": "Key Rotation",
        "anchor": "key-rotation",
        "snippet": "Rotate the Vault encryption key. This re-encrypts all existing secrets with a new key derived from the current BETTER_AUTH_SECRET:"
      },
      {
        "level": 2,
        "text": "Envelope Encryption",
        "anchor": "envelope-encryption",
        "snippet": "The Vault uses envelope encryption to balance security and performance:"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "Protect BETTER_AUTH_SECRET — This is the root of all Vault encryption. Use a secrets manager (AWS Secrets Manager, Vercel env vars, etc.) and never commit it to source control."
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Decryption failed\"",
        "anchor": "decryption-failed",
        "snippet": "Verify the context parameter matches the value used during encryption. Ensure BETTER_AUTH_SECRET has not been changed since the secret was encrypted. Check that the secret has not been corrupted — GCM"
      },
      {
        "level": 3,
        "text": "\"Vault secret not found\"",
        "anchor": "vault-secret-not-found",
        "snippet": "Confirm the secretId is correct (it should start with vsec_). The secret may have been deleted. Check organization scoping — secrets scoped to one org are not visible to another."
      },
      {
        "level": 3,
        "text": "\"BETTER_AUTH_SECRET is required\"",
        "anchor": "betterauthsecret-is-required",
        "snippet": "Set the BETTER_AUTH_SECRET environment variable in your deployment. It must be at least 32 characters."
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "SDK Reference — Complete API reference for all Vault methods Audit Logs — Monitor Vault access events Environment Variables — Configure BETTER_AUTH_SECRET and other secrets"
      }
    ],
    "searchText": "vault & encryption application-level encryption for sensitive data with key management and field-level encryption support. how it works the vault uses aes-256-gcm (galois/counter mode) authenticated encryption. here's what happens under the hood: what gets encrypted the vault automatically encrypts sensitive data across banata auth's internal subsystems: configuration the vault is enabled by default when the better_auth_secret environment variable is set in your deployment. no additional configuration is required — the encryption key is derived directly from this s requirements better_auth_secret must be at least 32 characters use a cryptographically random value (e.g., openssl rand -base64 48) store it in your deployment's environment variables, not in source control sdk usage encrypting data store a secret in the vault: decrypting data retrieve and decrypt a stored secret: listing secrets list vault secrets (metadata only — encrypted values are never returned in list responses): deleting a secret permanently remove a secret from the vault: key rotation rotate the vault encryption key. this re-encrypts all existing secrets with a new key derived from the current better_auth_secret: envelope encryption the vault uses envelope encryption to balance security and performance: security best practices protect better_auth_secret — this is the root of all vault encryption. use a secrets manager (aws secrets manager, vercel env vars, etc.) and never commit it to source control. audit events --- troubleshooting \"decryption failed\" verify the context parameter matches the value used during encryption. ensure better_auth_secret has not been changed since the secret was encrypted. check that the secret has not been corrupted — gcm \"vault secret not found\" confirm the secretid is correct (it should start with vsec_). the secret may have been deleted. check organization scoping — secrets scoped to one org are not visible to another. \"better_auth_secret is required\" set the better_auth_secret environment variable in your deployment. it must be at least 32 characters. next steps sdk reference — complete api reference for all vault methods audit logs — monitor vault access events environment variables — configure better_auth_secret and other secrets"
  },
  {
    "slug": "webhooks",
    "title": "Webhooks",
    "description": "Receive real-time notifications when auth events occur — user sign-ups, session changes, organization updates, and more.",
    "section": "Operate Your Project",
    "headings": [
      {
        "level": 2,
        "text": "Setting Up Webhooks",
        "anchor": "setting-up-webhooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "From the Dashboard",
        "anchor": "from-the-dashboard",
        "snippet": "Go to Settings > Webhooks in your project dashboard. Click Add Endpoint. Enter your Endpoint URL (e.g., https://myapp.com/api/webhooks/banata). Select which events you want to receive."
      },
      {
        "level": 3,
        "text": "Using the SDK",
        "anchor": "using-the-sdk",
        "snippet": "You can also manage webhook endpoints programmatically:"
      },
      {
        "level": 2,
        "text": "Webhook Payload Format",
        "anchor": "webhook-payload-format",
        "snippet": "Every webhook arrives as a POST request with a JSON body:"
      },
      {
        "level": 3,
        "text": "Headers",
        "anchor": "headers",
        "snippet": "Each request includes these headers:"
      },
      {
        "level": 2,
        "text": "Signing and Verification",
        "anchor": "signing-and-verification",
        "snippet": "Every webhook is signed so you can confirm it was sent by Banata Auth and has not been tampered with."
      },
      {
        "level": 3,
        "text": "Signature Format",
        "anchor": "signature-format",
        "snippet": "The Webhook-Signature header looks like this:"
      },
      {
        "level": 3,
        "text": "Using the SDK (Recommended)",
        "anchor": "using-the-sdk-recommended",
        "snippet": "The SDK's constructEvent method handles verification for you. It is async because it uses the Web Crypto API under the hood — always await it."
      },
      {
        "level": 3,
        "text": "Manual Verification",
        "anchor": "manual-verification",
        "snippet": "If you prefer to verify signatures without the SDK (or you are using a language other than TypeScript), here is the process:"
      },
      {
        "level": 2,
        "text": "Retry Policy",
        "anchor": "retry-policy",
        "snippet": "If your endpoint returns a non-2xx status code (or is unreachable), Banata Auth retries with exponential backoff:"
      },
      {
        "level": 2,
        "text": "Available Events",
        "anchor": "available-events",
        "snippet": "You can subscribe to any combination of the following events."
      },
      {
        "level": 3,
        "text": "User Events",
        "anchor": "user-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Session Events",
        "anchor": "session-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization Events",
        "anchor": "organization-events",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Security Events",
        "anchor": "security-events",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Complete Next.js Handler Example",
        "anchor": "complete-nextjs-handler-example",
        "snippet": "Here is a full webhook handler you can drop into a Next.js App Router project:"
      },
      {
        "level": 2,
        "text": "Testing Locally",
        "anchor": "testing-locally",
        "snippet": "During development, your local server is not publicly accessible. Use a tunneling tool like ngrok to expose it:"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "Always verify signatures. Never process a webhook payload without checking the HMAC signature first. Check timestamp freshness. Reject webhooks with timestamps older than 5 minutes to guard against re"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "Audit Logs — Track and query a detailed history of auth events. SDK Reference — Explore the full SDK API, including webhook management methods. Deploy — Take your project to production with monitoring"
      }
    ],
    "searchText": "webhooks receive real-time notifications when auth events occur — user sign-ups, session changes, organization updates, and more. setting up webhooks from the dashboard go to settings > webhooks in your project dashboard. click add endpoint. enter your endpoint url (e.g., https://myapp.com/api/webhooks/banata). select which events you want to receive. using the sdk you can also manage webhook endpoints programmatically: webhook payload format every webhook arrives as a post request with a json body: headers each request includes these headers: signing and verification every webhook is signed so you can confirm it was sent by banata auth and has not been tampered with. signature format the webhook-signature header looks like this: using the sdk (recommended) the sdk's constructevent method handles verification for you. it is async because it uses the web crypto api under the hood — always await it. manual verification if you prefer to verify signatures without the sdk (or you are using a language other than typescript), here is the process: retry policy if your endpoint returns a non-2xx status code (or is unreachable), banata auth retries with exponential backoff: available events you can subscribe to any combination of the following events. user events session events organization events security events --- complete next.js handler example here is a full webhook handler you can drop into a next.js app router project: testing locally during development, your local server is not publicly accessible. use a tunneling tool like ngrok to expose it: security best practices always verify signatures. never process a webhook payload without checking the hmac signature first. check timestamp freshness. reject webhooks with timestamps older than 5 minutes to guard against re next steps audit logs — track and query a detailed history of auth events. sdk reference — explore the full sdk api, including webhook management methods. deploy — take your project to production with monitoring"
  }
];
