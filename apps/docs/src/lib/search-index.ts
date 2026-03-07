/**
 * Auto-generated search index for client-side instant search.
 *
 * DO NOT EDIT MANUALLY -- regenerate with:
 *   bun run scripts/generate-search-index.ts
 *
 * Pages: 40
 * Total headings: 955
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
    "slug": "introduction",
    "title": "Introduction",
    "description": "Banata Auth is an open-source authentication infrastructure platform — a self-hostable, type-safe replacement for WorkOS, built on Better Auth, Convex, and Next.js.",
    "section": "Getting Started",
    "headings": [
      {
        "level": 2,
        "text": "What is Banata Auth?",
        "anchor": "what-is-banata-auth",
        "snippet": "Banata Auth is an open-source authentication infrastructure platform — a drop-in replacement for WorkOS built on three proven technologies:"
      },
      {
        "level": 2,
        "text": "Why Banata Auth?",
        "anchor": "why-banata-auth",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "The Problem",
        "anchor": "the-problem",
        "snippet": "Building authentication for modern SaaS applications means choosing between:"
      },
      {
        "level": 3,
        "text": "The Solution",
        "anchor": "the-solution",
        "snippet": "Banata Auth sits in the sweet spot: enterprise-grade auth infrastructure that you own and control. You get the developer experience of a managed service with the freedom of open source."
      },
      {
        "level": 3,
        "text": "Key Advantages",
        "anchor": "key-advantages",
        "snippet": "Open Source (MIT) — No vendor lock-in. Fork it, modify it, self-host it. No per-user pricing, ever. Enterprise-grade from Day One — Organizations, RBAC, audit logs, webhooks, and MFA are built in, not"
      },
      {
        "level": 2,
        "text": "Architecture",
        "anchor": "architecture",
        "snippet": "Banata Auth follows a four-layer architecture where each layer has a clear responsibility:"
      },
      {
        "level": 3,
        "text": "Layer 1: Convex Backend (@banata-auth/convex)",
        "anchor": "layer-1-convex-backend-banata-authconvex",
        "snippet": "All authentication logic runs inside Convex functions. Better Auth is instantiated server-side with a Convex database adapter, meaning:"
      },
      {
        "level": 3,
        "text": "Layer 2: Next.js Proxy (@banata-auth/nextjs)",
        "anchor": "layer-2-nextjs-proxy-banata-authnextjs",
        "snippet": "A reverse proxy route handler at /api/auth/[...all] forwards browser requests to the Convex backend. This is necessary because:"
      },
      {
        "level": 3,
        "text": "Layer 3: React Client (@banata-auth/react)",
        "anchor": "layer-3-react-client-banata-authreact",
        "snippet": "The React layer provides:"
      },
      {
        "level": 3,
        "text": "Layer 4: Admin SDK (@banata-auth/sdk)",
        "anchor": "layer-4-admin-sdk-banata-authsdk",
        "snippet": "The TypeScript SDK provides server-side management of your entire auth system:"
      },
      {
        "level": 2,
        "text": "What's Included",
        "anchor": "whats-included",
        "snippet": "Banata Auth ships as a monorepo with 5 npm packages, a pre-built admin dashboard, and an example application:"
      },
      {
        "level": 3,
        "text": "Packages",
        "anchor": "packages",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Applications",
        "anchor": "applications",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Authentication Methods",
        "anchor": "authentication-methods",
        "snippet": "Banata Auth supports 12 authentication methods, all configurable via the BanataAuthConfig object:"
      },
      {
        "level": 3,
        "text": "Enterprise Features",
        "anchor": "enterprise-features",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Security Model",
        "anchor": "security-model",
        "snippet": "Banata Auth implements defense-in-depth security:"
      },
      {
        "level": 2,
        "text": "How It Compares",
        "anchor": "how-it-compares",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "vs. WorkOS",
        "anchor": "vs-workos",
        "snippet": "WorkOS is the primary inspiration for Banata Auth. Both provide authentication infrastructure with enterprise features. The key differences:"
      },
      {
        "level": 3,
        "text": "vs. Clerk",
        "anchor": "vs-clerk",
        "snippet": "Clerk excels at developer experience with polished pre-built UI components. Banata Auth differs in:"
      },
      {
        "level": 3,
        "text": "vs. Auth0",
        "anchor": "vs-auth0",
        "snippet": "Auth0 is the incumbent enterprise auth platform. Banata Auth differs in:"
      },
      {
        "level": 2,
        "text": "Next Steps",
        "anchor": "next-steps",
        "snippet": "<a href=\"/docs/quickstart\" className=\"block p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-colors\"> <strong>Quick Start</strong>"
      }
    ],
    "searchText": "introduction banata auth is an open-source authentication infrastructure platform — a self-hostable, type-safe replacement for workos, built on better auth, convex, and next.js. what is banata auth? banata auth is an open-source authentication infrastructure platform — a drop-in replacement for workos built on three proven technologies: why banata auth? the problem building authentication for modern saas applications means choosing between: the solution banata auth sits in the sweet spot: enterprise-grade auth infrastructure that you own and control. you get the developer experience of a managed service with the freedom of open source. key advantages open source (mit) — no vendor lock-in. fork it, modify it, self-host it. no per-user pricing, ever. enterprise-grade from day one — organizations, rbac, audit logs, webhooks, and mfa are built in, not architecture banata auth follows a four-layer architecture where each layer has a clear responsibility: layer 1: convex backend (@banata-auth/convex) all authentication logic runs inside convex functions. better auth is instantiated server-side with a convex database adapter, meaning: layer 2: next.js proxy (@banata-auth/nextjs) a reverse proxy route handler at /api/auth/[...all] forwards browser requests to the convex backend. this is necessary because: layer 3: react client (@banata-auth/react) the react layer provides: layer 4: admin sdk (@banata-auth/sdk) the typescript sdk provides server-side management of your entire auth system: what's included banata auth ships as a monorepo with 5 npm packages, a pre-built admin dashboard, and an example application: packages applications authentication methods banata auth supports 12 authentication methods, all configurable via the banataauthconfig object: enterprise features --- security model banata auth implements defense-in-depth security: how it compares vs. workos workos is the primary inspiration for banata auth. both provide authentication infrastructure with enterprise features. the key differences: vs. clerk clerk excels at developer experience with polished pre-built ui components. banata auth differs in: vs. auth0 auth0 is the incumbent enterprise auth platform. banata auth differs in: next steps <a href=\"/docs/quickstart\" classname=\"block p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-colors\"> <strong>quick start</strong>"
  },
  {
    "slug": "project-structure",
    "title": "Project Structure",
    "description": "Detailed walkthrough of the Banata Auth monorepo â€” every package, every app, and how they fit together.",
    "section": "Getting Started",
    "headings": [
      {
        "level": 2,
        "text": "Top-Level Structure",
        "anchor": "top-level-structure",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Packages",
        "anchor": "packages",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "@banata-auth/shared (packages/shared)",
        "anchor": "banata-authshared-packagesshared",
        "snippet": "The foundation package â€” every other package depends on it. Contains no runtime dependencies on any framework."
      },
      {
        "level": 3,
        "text": "@banata-auth/sdk (packages/sdk)",
        "anchor": "banata-authsdk-packagessdk",
        "snippet": "The server-side admin SDK for managing your auth system programmatically. Used in backend services, admin scripts, and CI/CD pipelines."
      },
      {
        "level": 3,
        "text": "@banata-auth/react (packages/react)",
        "anchor": "banata-authreact-packagesreact",
        "snippet": "React integration with 3 entry points: main, /convex, and /plugins."
      },
      {
        "level": 3,
        "text": "@banata-auth/nextjs (packages/nextjs)",
        "anchor": "banata-authnextjs-packagesnextjs",
        "snippet": "Next.js integration with 4 entry points: main, /server, /client, /middleware."
      },
      {
        "level": 3,
        "text": "@banata-auth/convex (packages/convex)",
        "anchor": "banata-authconvex-packagesconvex",
        "snippet": "The Convex backend â€” the heart of the system. This is where Better Auth runs."
      },
      {
        "level": 2,
        "text": "Applications",
        "anchor": "applications",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "apps/dashboard",
        "anchor": "appsdashboard",
        "snippet": "The admin dashboard â€” a full Next.js application for managing your Banata Auth deployment. This is what end-users (developers) use to manage users, organizations, SSO connections, API keys, branding"
      },
      {
        "level": 3,
        "text": "apps/example-app",
        "anchor": "appsexample-app",
        "snippet": "A reference implementation showing how to integrate Banata Auth into a Next.js + Convex project. This is the same setup described in the Quick Start guide."
      },
      {
        "level": 3,
        "text": "apps/auth-ui",
        "anchor": "appsauth-ui",
        "snippet": "Hosted auth pages â€” pre-built sign-in, sign-up, forgot password, and other auth-related pages that can be served at a custom domain."
      },
      {
        "level": 3,
        "text": "apps/docs",
        "anchor": "appsdocs",
        "snippet": "This documentation site â€” built with Next.js, MDX, and the same design system as the dashboard."
      },
      {
        "level": 2,
        "text": "Package Dependency Graph",
        "anchor": "package-dependency-graph",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Tooling",
        "anchor": "tooling",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "tooling/typescript",
        "anchor": "toolingtypescript",
        "snippet": "Shared TypeScript configuration presets. All packages and apps extend from these:"
      },
      {
        "level": 3,
        "text": "tooling/tailwind",
        "anchor": "toolingtailwind",
        "snippet": "Shared Tailwind CSS configuration with the oklch color system used across dashboard, docs, and UI components."
      },
      {
        "level": 3,
        "text": "tooling/biome",
        "anchor": "toolingbiome",
        "snippet": "Shared Biome configuration for linting and formatting. Biome replaces ESLint + Prettier with a single, fast tool."
      },
      {
        "level": 2,
        "text": "Build System",
        "anchor": "build-system",
        "snippet": "The monorepo uses Turborepo for build orchestration with Bun as the package manager."
      },
      {
        "level": 3,
        "text": "Turbo Pipeline",
        "anchor": "turbo-pipeline",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Commands",
        "anchor": "commands",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Package Publishing",
        "anchor": "package-publishing",
        "snippet": "Packages are published to npm using Changesets:"
      },
      {
        "level": 2,
        "text": "Database Schema (26 Tables)",
        "anchor": "database-schema-26-tables",
        "snippet": "The Convex backend uses 26 tables to store all auth data. These are defined in @banata-auth/convex/schema:"
      },
      {
        "level": 2,
        "text": "CI/CD",
        "anchor": "cicd",
        "snippet": "The project includes GitHub Actions workflows:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Quick Start â€” Set up Banata Auth in your project SDK Reference â€” Complete API reference for @banata-auth/sdk Convex Integration â€” Deep dive into the backend configuration"
      }
    ],
    "searchText": "project structure detailed walkthrough of the banata auth monorepo â€” every package, every app, and how they fit together. top-level structure packages @banata-auth/shared (packages/shared) the foundation package â€” every other package depends on it. contains no runtime dependencies on any framework. @banata-auth/sdk (packages/sdk) the server-side admin sdk for managing your auth system programmatically. used in backend services, admin scripts, and ci/cd pipelines. @banata-auth/react (packages/react) react integration with 3 entry points: main, /convex, and /plugins. @banata-auth/nextjs (packages/nextjs) next.js integration with 4 entry points: main, /server, /client, /middleware. @banata-auth/convex (packages/convex) the convex backend â€” the heart of the system. this is where better auth runs. applications apps/dashboard the admin dashboard â€” a full next.js application for managing your banata auth deployment. this is what end-users (developers) use to manage users, organizations, sso connections, api keys, branding apps/example-app a reference implementation showing how to integrate banata auth into a next.js + convex project. this is the same setup described in the quick start guide. apps/auth-ui hosted auth pages â€” pre-built sign-in, sign-up, forgot password, and other auth-related pages that can be served at a custom domain. apps/docs this documentation site â€” built with next.js, mdx, and the same design system as the dashboard. package dependency graph tooling tooling/typescript shared typescript configuration presets. all packages and apps extend from these: tooling/tailwind shared tailwind css configuration with the oklch color system used across dashboard, docs, and ui components. tooling/biome shared biome configuration for linting and formatting. biome replaces eslint + prettier with a single, fast tool. build system the monorepo uses turborepo for build orchestration with bun as the package manager. turbo pipeline commands package publishing packages are published to npm using changesets: database schema (26 tables) the convex backend uses 26 tables to store all auth data. these are defined in @banata-auth/convex/schema: ci/cd the project includes github actions workflows: what's next quick start â€” set up banata auth in your project sdk reference â€” complete api reference for @banata-auth/sdk convex integration â€” deep dive into the backend configuration"
  },
  {
    "slug": "quickstart",
    "title": "Quick Start",
    "description": "Get Banata Auth running in your Convex + Next.js project — from zero to authenticated users in under 10 minutes.",
    "section": "Getting Started",
    "headings": [
      {
        "level": 2,
        "text": "Prerequisites",
        "anchor": "prerequisites",
        "snippet": "Before you start, make sure you have:"
      },
      {
        "level": 2,
        "text": "Step 1: Install Packages",
        "anchor": "step-1-install-packages",
        "snippet": "Install the Banata Auth packages you need:"
      },
      {
        "level": 2,
        "text": "Step 2: Set Environment Variables",
        "anchor": "step-2-set-environment-variables",
        "snippet": "Banata Auth requires environment variables in two places: your Next.js .env.local file and your Convex deployment."
      },
      {
        "level": 3,
        "text": "Next.js Environment (.env.local)",
        "anchor": "nextjs-environment-envlocal",
        "snippet": "Add these to your .env.local:"
      },
      {
        "level": 3,
        "text": "Convex Environment Variables",
        "anchor": "convex-environment-variables",
        "snippet": "Auth secrets must be set on the Convex deployment (not in .env.local), because they're used by server-side Convex functions:"
      },
      {
        "level": 2,
        "text": "Step 3: Create the Convex Auth Configuration",
        "anchor": "step-3-create-the-convex-auth-configuration",
        "snippet": "This is the core of your Banata Auth setup. You need three files in your convex/ directory."
      },
      {
        "level": 3,
        "text": "3a. Auth Config (convex/auth.config.ts)",
        "anchor": "3a-auth-config-convexauthconfigts",
        "snippet": "This tells Convex how to validate JWTs issued by Better Auth:"
      },
      {
        "level": 3,
        "text": "3b. Component Schema (convex/banataAuth/schema.ts)",
        "anchor": "3b-component-schema-convexbanataauthschemats",
        "snippet": "Re-export the Banata Auth database schema. This defines the 26 tables used for auth data (users, sessions, accounts, organizations, etc.):"
      },
      {
        "level": 3,
        "text": "3c. Auth Factory (convex/banataAuth/auth.ts)",
        "anchor": "3c-auth-factory-convexbanataauthauthts",
        "snippet": "This is where you configure Banata Auth — authentication methods, social providers, email callbacks, and more:"
      },
      {
        "level": 2,
        "text": "Step 4: Register HTTP Routes",
        "anchor": "step-4-register-http-routes",
        "snippet": "Better Auth needs HTTP endpoints to handle sign-in, sign-up, OAuth callbacks, JWKS, and other auth flows. Register them in your Convex HTTP router:"
      },
      {
        "level": 2,
        "text": "Step 5: Create the Next.js Route Handler",
        "anchor": "step-5-create-the-nextjs-route-handler",
        "snippet": "The route handler acts as a reverse proxy — it forwards auth requests from your Next.js app to the Convex .site URL where Better Auth is running. This keeps auth cookies on your domain."
      },
      {
        "level": 3,
        "text": "5a. Server Auth Utilities (src/lib/auth-server.ts)",
        "anchor": "5a-server-auth-utilities-srclibauth-serverts",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "5b. API Route Handler (src/app/api/auth/[...all]/route.ts)",
        "anchor": "5b-api-route-handler-srcappapiauthallroutets",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 6: Create the Auth Client",
        "anchor": "step-6-create-the-auth-client",
        "snippet": "The client-side auth client is used by React components to call auth endpoints (sign in, sign up, sign out, etc.):"
      },
      {
        "level": 2,
        "text": "Step 7: Add the React Provider",
        "anchor": "step-7-add-the-react-provider",
        "snippet": "Wrap your app in the auth provider so hooks work throughout your component tree:"
      },
      {
        "level": 2,
        "text": "Step 8: Use Auth in Your Components",
        "anchor": "step-8-use-auth-in-your-components",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign Up Form",
        "anchor": "sign-up-form",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign In Form",
        "anchor": "sign-in-form",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using Auth State with Hooks",
        "anchor": "using-auth-state-with-hooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Server-Side Auth Check",
        "anchor": "server-side-auth-check",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 9: Start Development",
        "anchor": "step-9-start-development",
        "snippet": "Run both Next.js and Convex dev servers:"
      },
      {
        "level": 2,
        "text": "File Summary",
        "anchor": "file-summary",
        "snippet": "After completing this guide, your project should have these new/modified files:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"BETTER_AUTH_SECRET environment variable is required\"",
        "anchor": "betterauthsecret-environment-variable-is-required",
        "snippet": "You haven't set the secret on your Convex deployment:"
      },
      {
        "level": 3,
        "text": "\"Failed to fetch\" or Network Errors on Sign In/Sign Up",
        "anchor": "failed-to-fetch-or-network-errors-on-sign-insign-up",
        "snippet": "Check that Convex dev server is running — You need npx convex dev running alongside your Next.js dev server. Check NEXT_PUBLIC_CONVEX_SITE_URL — This must point to your Convex HTTP actions URL (ending"
      },
      {
        "level": 3,
        "text": "OAuth Callback Errors",
        "anchor": "oauth-callback-errors",
        "snippet": "Callback URL must match — In your OAuth provider's settings (e.g., GitHub), set the callback URL to http://localhost:3000/api/auth/callback/github (or whichever provider)."
      },
      {
        "level": 3,
        "text": "Hooks Return undefined User",
        "anchor": "hooks-return-undefined-user",
        "snippet": "Make sure BanataConvexProvider wraps your app — Check that your layout includes the provider from Step 7. Wait for loading — Always check isLoading before reading user:"
      },
      {
        "level": 3,
        "text": "\"Module not found: @banata-auth/convex\"",
        "anchor": "module-not-found-banata-authconvex",
        "snippet": "If you're in a monorepo, make sure the packages are properly linked. With pnpm workspaces:"
      },
      {
        "level": 3,
        "text": "Session Cookie Not Being Set",
        "anchor": "session-cookie-not-being-set",
        "snippet": "Same-origin requirement — The auth route handler must be on the same domain as your app. Don't call the Convex .site URL directly from the browser. HTTPS in production — Cookies with Secure flag requi"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Now that you have basic authentication working, explore these guides:"
      }
    ],
    "searchText": "quick start get banata auth running in your convex + next.js project — from zero to authenticated users in under 10 minutes. prerequisites before you start, make sure you have: step 1: install packages install the banata auth packages you need: step 2: set environment variables banata auth requires environment variables in two places: your next.js .env.local file and your convex deployment. next.js environment (.env.local) add these to your .env.local: convex environment variables auth secrets must be set on the convex deployment (not in .env.local), because they're used by server-side convex functions: step 3: create the convex auth configuration this is the core of your banata auth setup. you need three files in your convex/ directory. 3a. auth config (convex/auth.config.ts) this tells convex how to validate jwts issued by better auth: 3b. component schema (convex/banataauth/schema.ts) re-export the banata auth database schema. this defines the 26 tables used for auth data (users, sessions, accounts, organizations, etc.): 3c. auth factory (convex/banataauth/auth.ts) this is where you configure banata auth — authentication methods, social providers, email callbacks, and more: step 4: register http routes better auth needs http endpoints to handle sign-in, sign-up, oauth callbacks, jwks, and other auth flows. register them in your convex http router: step 5: create the next.js route handler the route handler acts as a reverse proxy — it forwards auth requests from your next.js app to the convex .site url where better auth is running. this keeps auth cookies on your domain. 5a. server auth utilities (src/lib/auth-server.ts) 5b. api route handler (src/app/api/auth/[...all]/route.ts) step 6: create the auth client the client-side auth client is used by react components to call auth endpoints (sign in, sign up, sign out, etc.): step 7: add the react provider wrap your app in the auth provider so hooks work throughout your component tree: step 8: use auth in your components sign up form sign in form using auth state with hooks server-side auth check step 9: start development run both next.js and convex dev servers: file summary after completing this guide, your project should have these new/modified files: troubleshooting \"better_auth_secret environment variable is required\" you haven't set the secret on your convex deployment: \"failed to fetch\" or network errors on sign in/sign up check that convex dev server is running — you need npx convex dev running alongside your next.js dev server. check next_public_convex_site_url — this must point to your convex http actions url (ending oauth callback errors callback url must match — in your oauth provider's settings (e.g., github), set the callback url to http://localhost:3000/api/auth/callback/github (or whichever provider). hooks return undefined user make sure banataconvexprovider wraps your app — check that your layout includes the provider from step 7. wait for loading — always check isloading before reading user: \"module not found: @banata-auth/convex\" if you're in a monorepo, make sure the packages are properly linked. with pnpm workspaces: session cookie not being set same-origin requirement — the auth route handler must be on the same domain as your app. don't call the convex .site url directly from the browser. https in production — cookies with secure flag requi what's next now that you have basic authentication working, explore these guides:"
  },
  {
    "slug": "anonymous-auth",
    "title": "Anonymous Authentication",
    "description": "Allow users to interact with your app without creating an account, with optional upgrade to a full account later.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Use Cases",
        "anchor": "use-cases",
        "snippet": "Anonymous auth is well-suited for scenarios where you want to reduce friction and let users experience your product before committing to an account:"
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Anonymous User Properties",
        "anchor": "anonymous-user-properties",
        "snippet": "When an anonymous user is created, the user record has these characteristics:"
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable anonymous authentication in your BanataAuthConfig:"
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
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Check if the Current User is Anonymous",
        "anchor": "check-if-the-current-user-is-anonymous",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Upgrade to Email/Password",
        "anchor": "upgrade-to-emailpassword",
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
        "text": "Complete Anonymous-to-Upgrade Flow",
        "anchor": "complete-anonymous-to-upgrade-flow",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Data Persistence During Upgrade",
        "anchor": "data-persistence-during-upgrade",
        "snippet": "When an anonymous user upgrades to a full account, the following are preserved:"
      },
      {
        "level": 3,
        "text": "What Changes on Upgrade",
        "anchor": "what-changes-on-upgrade",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Cleanup of Stale Anonymous Accounts",
        "anchor": "cleanup-of-stale-anonymous-accounts",
        "snippet": "Anonymous users that never upgrade will accumulate over time. Banata Auth provides mechanisms to clean up stale anonymous accounts."
      },
      {
        "level": 3,
        "text": "Automatic Cleanup",
        "anchor": "automatic-cleanup",
        "snippet": "Configure automatic cleanup of anonymous accounts that have been inactive beyond a threshold:"
      },
      {
        "level": 3,
        "text": "Manual Cleanup via Admin SDK",
        "anchor": "manual-cleanup-via-admin-sdk",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "Anonymous session creation is rate-limited to prevent abuse:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "See the Audit Logs guide for more details."
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Rate limit anonymous creation -- Without rate limiting, anonymous auth can be abused to create unlimited user records. The built-in rate limit (30/min per IP) mitigates this."
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
        "snippet": "The upgrade endpoint was called on a user that is already a full account (i.e., isAnonymous is false). Only anonymous users can be upgraded."
      },
      {
        "level": 3,
        "text": "\"Email already in use\"",
        "anchor": "email-already-in-use",
        "snippet": "The email provided during upgrade is already registered to another user. The anonymous user cannot claim an email that belongs to an existing account."
      },
      {
        "level": 3,
        "text": "\"Anonymous session expired\"",
        "anchor": "anonymous-session-expired",
        "snippet": "The session expired before the user upgraded. The anonymous user record still exists, but a new session must be created. If the user has no way to re-authenticate (no email/password), the data from th"
      },
      {
        "level": 3,
        "text": "\"Too many anonymous accounts\"",
        "anchor": "too-many-anonymous-accounts",
        "snippet": "If you see a large number of anonymous users, check for: Bot traffic creating sessions programmatically Missing cleanup configuration Frontend code that creates anonymous sessions on every page load ("
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Email & Password -- The most common upgrade target for anonymous users Social OAuth -- Let anonymous users upgrade via Google, GitHub, etc. Username Auth -- Upgrade with a username instead of email"
      }
    ],
    "searchText": "anonymous authentication allow users to interact with your app without creating an account, with optional upgrade to a full account later. use cases anonymous auth is well-suited for scenarios where you want to reduce friction and let users experience your product before committing to an account: how it works anonymous user properties when an anonymous user is created, the user record has these characteristics: configuration enable anonymous authentication in your banataauthconfig: client-side api create an anonymous session check if the current user is anonymous upgrade to email/password link an email and password to the anonymous user, converting them to a full account: upgrade via social oauth anonymous users can also upgrade by linking a social account: complete anonymous-to-upgrade flow data persistence during upgrade when an anonymous user upgrades to a full account, the following are preserved: what changes on upgrade --- cleanup of stale anonymous accounts anonymous users that never upgrade will accumulate over time. banata auth provides mechanisms to clean up stale anonymous accounts. automatic cleanup configure automatic cleanup of anonymous accounts that have been inactive beyond a threshold: manual cleanup via admin sdk rate limiting anonymous session creation is rate-limited to prevent abuse: audit events see the audit logs guide for more details. security considerations rate limit anonymous creation -- without rate limiting, anonymous auth can be abused to create unlimited user records. the built-in rate limit (30/min per ip) mitigates this. troubleshooting \"user is not anonymous\" the upgrade endpoint was called on a user that is already a full account (i.e., isanonymous is false). only anonymous users can be upgraded. \"email already in use\" the email provided during upgrade is already registered to another user. the anonymous user cannot claim an email that belongs to an existing account. \"anonymous session expired\" the session expired before the user upgraded. the anonymous user record still exists, but a new session must be created. if the user has no way to re-authenticate (no email/password), the data from th \"too many anonymous accounts\" if you see a large number of anonymous users, check for: bot traffic creating sessions programmatically missing cleanup configuration frontend code that creates anonymous sessions on every page load ( what's next email & password -- the most common upgrade target for anonymous users social oauth -- let anonymous users upgrade via google, github, etc. username auth -- upgrade with a username instead of email"
  },
  {
    "slug": "email-otp",
    "title": "Email OTP",
    "description": "Passwordless authentication using one-time passcodes sent via email.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "New Users vs. Existing Users",
        "anchor": "new-users-vs-existing-users",
        "snippet": "New email -- A new user account is created automatically. No separate sign-up step is needed. Existing email -- The existing user is signed in. Their account data is unchanged."
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable email OTP in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Email Callback Parameters",
        "anchor": "email-callback-parameters",
        "snippet": "The sendOtp callback receives:"
      },
      {
        "level": 2,
        "text": "OTP Properties",
        "anchor": "otp-properties",
        "snippet": "OTP expiry is defined alongside other token lifetimes in @banata-auth/shared:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 1: Send the OTP",
        "anchor": "step-1-send-the-otp",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 2: Verify the OTP",
        "anchor": "step-2-verify-the-otp",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Complete OTP Form Example",
        "anchor": "complete-otp-form-example",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Template Integration",
        "anchor": "email-template-integration",
        "snippet": "Email OTP uses the \"magic-auth\" email category in the email configuration system. When you configure email types in the dashboard under Emails > Configuration, the \"Magic Auth\" toggle controls deliver"
      },
      {
        "level": 2,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "OTP requests are rate-limited to prevent abuse and brute-force attempts:"
      },
      {
        "level": 2,
        "text": "Combining with Other Methods",
        "anchor": "combining-with-other-methods",
        "snippet": "Email OTP works alongside other authentication methods. A common pattern is offering email OTP as the primary method:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "See the Audit Logs guide for more details."
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Short expiry window -- OTPs expire after 10 minutes, limiting the window for interception. Single-use codes -- Each OTP is consumed on verification and cannot be reused."
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
        "snippet": "The code does not match or has expired. Common causes: User entered the code incorrectly (check for typos) More than 10 minutes passed since the code was sent"
      },
      {
        "level": 3,
        "text": "\"OTP email not received\"",
        "anchor": "otp-email-not-received",
        "snippet": "Check your sendOtp callback for errors Check the spam/junk folder Verify the email provider API key is correct In development, log the OTP to the console instead of sending an email"
      },
      {
        "level": 3,
        "text": "\"Rate limit exceeded\"",
        "anchor": "rate-limit-exceeded",
        "snippet": "The user has made too many requests. Wait one minute before retrying. If this happens frequently, consider showing a countdown timer in your UI."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Magic Links -- Link-based passwordless authentication Passkeys -- WebAuthn-based biometric authentication Multi-Factor Auth -- Add TOTP as a second factor"
      }
    ],
    "searchText": "email otp passwordless authentication using one-time passcodes sent via email. how it works new users vs. existing users new email -- a new user account is created automatically. no separate sign-up step is needed. existing email -- the existing user is signed in. their account data is unchanged. configuration enable email otp in your banataauthconfig: email callback parameters the sendotp callback receives: otp properties otp expiry is defined alongside other token lifetimes in @banata-auth/shared: client-side api step 1: send the otp step 2: verify the otp complete otp form example email template integration email otp uses the \"magic-auth\" email category in the email configuration system. when you configure email types in the dashboard under emails > configuration, the \"magic auth\" toggle controls deliver rate limiting otp requests are rate-limited to prevent abuse and brute-force attempts: combining with other methods email otp works alongside other authentication methods. a common pattern is offering email otp as the primary method: audit events see the audit logs guide for more details. security considerations short expiry window -- otps expire after 10 minutes, limiting the window for interception. single-use codes -- each otp is consumed on verification and cannot be reused. troubleshooting \"invalid or expired otp\" the code does not match or has expired. common causes: user entered the code incorrectly (check for typos) more than 10 minutes passed since the code was sent \"otp email not received\" check your sendotp callback for errors check the spam/junk folder verify the email provider api key is correct in development, log the otp to the console instead of sending an email \"rate limit exceeded\" the user has made too many requests. wait one minute before retrying. if this happens frequently, consider showing a countdown timer in your ui. what's next magic links -- link-based passwordless authentication passkeys -- webauthn-based biometric authentication multi-factor auth -- add totp as a second factor"
  },
  {
    "slug": "email-password",
    "title": "Email & Password",
    "description": "Configure email/password authentication with email verification, password reset, and customizable validation rules.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable email/password authentication in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Email Callback Parameters",
        "anchor": "email-callback-parameters",
        "snippet": "> Development tip: In development, you can log to console instead of sending real emails: > ```typescript > sendVerificationEmail: async ({ user, url }) => {"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign Up",
        "anchor": "sign-up",
        "snippet": "Use the Better Auth client to sign up with email and password:"
      },
      {
        "level": 3,
        "text": "Sign In",
        "anchor": "sign-in",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign Out",
        "anchor": "sign-out",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Request Password Reset",
        "anchor": "request-password-reset",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Reset Password (with token from email)",
        "anchor": "reset-password-with-token-from-email",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Verify Email",
        "anchor": "verify-email",
        "snippet": "Email verification typically happens automatically when the user clicks the link in the verification email. The link hits the /api/auth/verify-email endpoint with the token, and Better Auth handles th"
      },
      {
        "level": 2,
        "text": "Password Validation",
        "anchor": "password-validation",
        "snippet": "Banata Auth validates passwords using the passwordSchema from @banata-auth/shared:"
      },
      {
        "level": 3,
        "text": "Custom Password Rules",
        "anchor": "custom-password-rules",
        "snippet": "To enforce additional rules (uppercase, numbers, special characters), you can add custom validation in your sign-up form before calling the API:"
      },
      {
        "level": 2,
        "text": "Pre-Built UI Components",
        "anchor": "pre-built-ui-components",
        "snippet": "Banata Auth ships a SignUpForm and SignInForm in @banata-auth/react that handle the entire email/password flow:"
      },
      {
        "level": 3,
        "text": "Sign Up Form",
        "anchor": "sign-up-form",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign In Form",
        "anchor": "sign-in-form",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Server-Side User Management",
        "anchor": "server-side-user-management",
        "snippet": "Use the admin SDK to manage users from your backend:"
      },
      {
        "level": 2,
        "text": "Email Providers",
        "anchor": "email-providers",
        "snippet": "You can use any email provider that supports HTTP APIs. Here are examples for popular services:"
      },
      {
        "level": 3,
        "text": "Resend",
        "anchor": "resend",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "SendGrid",
        "anchor": "sendgrid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "AWS SES (via fetch)",
        "anchor": "aws-ses-via-fetch",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "When email/password auth is enabled, the following events are automatically logged to the audit log:"
      },
      {
        "level": 2,
        "text": "Error Handling",
        "anchor": "error-handling",
        "snippet": "All auth endpoints return typed errors from @banata-auth/shared:"
      },
      {
        "level": 3,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "Always enable email verification â€” Without it, anyone can sign up with someone else's email. Use HTTPS in production â€” Session cookies are Secure-flagged and won't work over HTTP."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Social OAuth â€” Add Google, GitHub, and more alongside email/password Magic Links â€” Offer passwordless sign-in via email Multi-Factor Auth â€” Add TOTP-based two-factor authentication"
      }
    ],
    "searchText": "email & password configure email/password authentication with email verification, password reset, and customizable validation rules. configuration enable email/password authentication in your banataauthconfig: email callback parameters > development tip: in development, you can log to console instead of sending real emails: > ```typescript > sendverificationemail: async ({ user, url }) => { client-side api sign up use the better auth client to sign up with email and password: sign in sign out request password reset reset password (with token from email) verify email email verification typically happens automatically when the user clicks the link in the verification email. the link hits the /api/auth/verify-email endpoint with the token, and better auth handles th password validation banata auth validates passwords using the passwordschema from @banata-auth/shared: custom password rules to enforce additional rules (uppercase, numbers, special characters), you can add custom validation in your sign-up form before calling the api: pre-built ui components banata auth ships a signupform and signinform in @banata-auth/react that handle the entire email/password flow: sign up form sign in form server-side user management use the admin sdk to manage users from your backend: email providers you can use any email provider that supports http apis. here are examples for popular services: resend sendgrid aws ses (via fetch) audit events when email/password auth is enabled, the following events are automatically logged to the audit log: error handling all auth endpoints return typed errors from @banata-auth/shared: rate limits --- security best practices always enable email verification â€” without it, anyone can sign up with someone else's email. use https in production â€” session cookies are secure-flagged and won't work over http. what's next social oauth â€” add google, github, and more alongside email/password magic links â€” offer passwordless sign-in via email multi-factor auth â€” add totp-based two-factor authentication"
  },
  {
    "slug": "magic-links",
    "title": "Magic Links",
    "description": "Passwordless authentication via email — users click a link to sign in without needing a password.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable magic links in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Email Callback Parameters",
        "anchor": "email-callback-parameters",
        "snippet": "The sendMagicLink callback receives:"
      },
      {
        "level": 2,
        "text": "Token Lifetime",
        "anchor": "token-lifetime",
        "snippet": "Magic link tokens expire after 10 minutes (600 seconds) by default. This is defined in @banata-auth/shared:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Send Magic Link",
        "anchor": "send-magic-link",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Magic Link Form Example",
        "anchor": "magic-link-form-example",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "Here's the complete magic link flow:"
      },
      {
        "level": 3,
        "text": "New Users vs. Existing Users",
        "anchor": "new-users-vs-existing-users",
        "snippet": "New email — A new user account is created automatically. No separate sign-up step needed. Existing email — The existing user is signed in. Their account is unchanged."
      },
      {
        "level": 2,
        "text": "Combining with Other Methods",
        "anchor": "combining-with-other-methods",
        "snippet": "Magic links work well alongside other authentication methods. A common pattern is offering magic links as the primary method with email/password as a fallback:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Token Security",
        "anchor": "token-security",
        "snippet": "Tokens are cryptographically signed using the BETTER_AUTH_SECRET. Tokens are single-use — once verified, they cannot be reused. Tokens expire after 10 minutes — a narrow window limits exposure."
      },
      {
        "level": 3,
        "text": "Email Security",
        "anchor": "email-security",
        "snippet": "Magic links are as secure as the user's email account. If someone has access to the email, they can sign in. For higher-security applications, consider combining magic links with MFA (TOTP) for a pass"
      },
      {
        "level": 3,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "Magic link requests are rate-limited to prevent abuse:"
      },
      {
        "level": 2,
        "text": "Email OTP Alternative",
        "anchor": "email-otp-alternative",
        "snippet": "If you prefer one-time codes instead of links, Banata Auth also supports Email OTP (one-time password):"
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
        "text": "\"Magic link expired\"",
        "anchor": "magic-link-expired",
        "snippet": "The token is only valid for 10 minutes. Ask the user to request a new one. Common causes: User took too long to check their email Email was delayed by the provider"
      },
      {
        "level": 3,
        "text": "\"Invalid magic link\"",
        "anchor": "invalid-magic-link",
        "snippet": "The token signature doesn't match. This can happen if: The BETTER_AUTH_SECRET was changed after the link was generated The link URL was modified or truncated (some email clients break long URLs)"
      },
      {
        "level": 3,
        "text": "Magic Link Email Not Received",
        "anchor": "magic-link-email-not-received",
        "snippet": "Check your sendMagicLink callback for errors Check the spam/junk folder Verify the email provider API key is correct In development, check the console for [DEV] log output"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Multi-Factor Auth — Add TOTP as a second factor Email & Password — Traditional authentication Social OAuth — Sign in with Google, GitHub, etc."
      }
    ],
    "searchText": "magic links passwordless authentication via email — users click a link to sign in without needing a password. configuration enable magic links in your banataauthconfig: email callback parameters the sendmagiclink callback receives: token lifetime magic link tokens expire after 10 minutes (600 seconds) by default. this is defined in @banata-auth/shared: client-side api send magic link magic link form example how it works here's the complete magic link flow: new users vs. existing users new email — a new user account is created automatically. no separate sign-up step needed. existing email — the existing user is signed in. their account is unchanged. combining with other methods magic links work well alongside other authentication methods. a common pattern is offering magic links as the primary method with email/password as a fallback: security considerations token security tokens are cryptographically signed using the better_auth_secret. tokens are single-use — once verified, they cannot be reused. tokens expire after 10 minutes — a narrow window limits exposure. email security magic links are as secure as the user's email account. if someone has access to the email, they can sign in. for higher-security applications, consider combining magic links with mfa (totp) for a pass rate limiting magic link requests are rate-limited to prevent abuse: email otp alternative if you prefer one-time codes instead of links, banata auth also supports email otp (one-time password): audit events --- troubleshooting \"magic link expired\" the token is only valid for 10 minutes. ask the user to request a new one. common causes: user took too long to check their email email was delayed by the provider \"invalid magic link\" the token signature doesn't match. this can happen if: the better_auth_secret was changed after the link was generated the link url was modified or truncated (some email clients break long urls) magic link email not received check your sendmagiclink callback for errors check the spam/junk folder verify the email provider api key is correct in development, check the console for [dev] log output what's next multi-factor auth — add totp as a second factor email & password — traditional authentication social oauth — sign in with google, github, etc."
  },
  {
    "slug": "mfa",
    "title": "Multi-Factor Authentication",
    "description": "Add TOTP-based two-factor authentication with authenticator apps, backup codes, and recovery flows.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable two-factor authentication in your BanataAuthConfig:"
      },
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Setup Flow",
        "anchor": "setup-flow",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-In Flow (with MFA enabled)",
        "anchor": "sign-in-flow-with-mfa-enabled",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Enable Two-Factor Auth",
        "anchor": "enable-two-factor-auth",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Generate QR Code",
        "anchor": "generate-qr-code",
        "snippet": "Use a QR code library to render the TOTP URI:"
      },
      {
        "level": 3,
        "text": "Verify TOTP Code",
        "anchor": "verify-totp-code",
        "snippet": "After setup, verify the user can generate valid codes:"
      },
      {
        "level": 3,
        "text": "Disable Two-Factor Auth",
        "anchor": "disable-two-factor-auth",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Backup Codes",
        "anchor": "backup-codes",
        "snippet": "When a user enables MFA, backup codes are automatically generated. These are one-time use codes that allow sign-in if the user loses access to their authenticator app."
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
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using a Backup Code to Sign In",
        "anchor": "using-a-backup-code-to-sign-in",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Complete MFA Setup Component",
        "anchor": "complete-mfa-setup-component",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "MFA Challenge During Sign-In",
        "anchor": "mfa-challenge-during-sign-in",
        "snippet": "When a user with MFA enabled signs in, the sign-in response indicates that a TOTP code is required:"
      },
      {
        "level": 2,
        "text": "Passkeys (WebAuthn)",
        "anchor": "passkeys-webauthn",
        "snippet": "In addition to TOTP, Banata Auth also supports passkeys (WebAuthn) for passwordless biometric/hardware key authentication:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "TOTP codes are time-sensitive — They change every 30 seconds. Make sure your server's clock is accurate. Backup codes are critical — Users who lose both their device and backup codes may be locked out"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Organizations — Multi-tenant workspaces Roles & Permissions — Fine-grained access control Webhooks — Get notified about auth events"
      }
    ],
    "searchText": "multi-factor authentication add totp-based two-factor authentication with authenticator apps, backup codes, and recovery flows. configuration enable two-factor authentication in your banataauthconfig: how it works setup flow sign-in flow (with mfa enabled) client-side api enable two-factor auth generate qr code use a qr code library to render the totp uri: verify totp code after setup, verify the user can generate valid codes: disable two-factor auth backup codes when a user enables mfa, backup codes are automatically generated. these are one-time use codes that allow sign-in if the user loses access to their authenticator app. backup code format displaying backup codes using a backup code to sign in complete mfa setup component mfa challenge during sign-in when a user with mfa enabled signs in, the sign-in response indicates that a totp code is required: passkeys (webauthn) in addition to totp, banata auth also supports passkeys (webauthn) for passwordless biometric/hardware key authentication: audit events --- security considerations totp codes are time-sensitive — they change every 30 seconds. make sure your server's clock is accurate. backup codes are critical — users who lose both their device and backup codes may be locked out what's next organizations — multi-tenant workspaces roles & permissions — fine-grained access control webhooks — get notified about auth events"
  },
  {
    "slug": "passkeys",
    "title": "Passkeys",
    "description": "WebAuthn-based passwordless authentication using biometrics, security keys, or device credentials.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "Passkeys involve two distinct flows: registration (creating a credential) and authentication (using a credential to sign in)."
      },
      {
        "level": 3,
        "text": "Registration Flow",
        "anchor": "registration-flow",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Authentication Flow",
        "anchor": "authentication-flow",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable passkeys in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Passkey Configuration Options",
        "anchor": "passkey-configuration-options",
        "snippet": "> Important: The rpId must be a valid domain that matches or is a registrable suffix of the page origin. For example, if your app is at https://app.mycompany.com, the rpId can be \"app.mycompany.com\" o"
      },
      {
        "level": 3,
        "text": "Environment Variables",
        "anchor": "environment-variables",
        "snippet": ""
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
        "snippet": "Modern passkey implementations support cross-device authentication, where a user can use their phone to authenticate on a desktop browser via Bluetooth proximity. This is handled natively by the brows"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Register a Passkey",
        "anchor": "register-a-passkey",
        "snippet": "Users must be signed in to register a passkey. This is typically done in a security settings page:"
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
        "text": "Complete Registration Component",
        "anchor": "complete-registration-component",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-In Page with Passkey Option",
        "anchor": "sign-in-page-with-passkey-option",
        "snippet": ""
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
        "snippet": "Passkeys work well alongside traditional authentication methods. Users can register a passkey after signing in with email/password, and then use the passkey for future sign-ins:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "See the Audit Logs guide for more details."
      },
      {
        "level": 2,
        "text": "Security Advantages Over Passwords",
        "anchor": "security-advantages-over-passwords",
        "snippet": "Passkeys are the most secure user authentication method available in web browsers today. The private key never leaves the user's device, and authentication requires physical presence (biometric or sec"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Always validate the origin -- The origin in your passkey config must exactly match the page origin. Mismatches will cause authentication failures. Use HTTPS in production -- WebAuthn requires a secure"
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
        "snippet": "The user's browser does not support the WebAuthn API. This is rare on modern browsers but can happen on older versions or certain embedded browser views. Check window.PublicKeyCredential before showin"
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
        "snippet": "The origin in your passkey config does not match the actual page origin. Ensure PASSKEY_ORIGIN matches exactly (including protocol and port)."
      },
      {
        "level": 3,
        "text": "\"Passkey not found\"",
        "anchor": "passkey-not-found",
        "snippet": "No registered credentials match the rpId. This can happen if: The user hasn't registered a passkey for this site The rpId changed between registration and authentication"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Email OTP -- Passwordless authentication via email codes Multi-Factor Auth -- Add TOTP as a second factor Email & Password -- Traditional authentication"
      }
    ],
    "searchText": "passkeys webauthn-based passwordless authentication using biometrics, security keys, or device credentials. how it works passkeys involve two distinct flows: registration (creating a credential) and authentication (using a credential to sign in). registration flow authentication flow configuration enable passkeys in your banataauthconfig: passkey configuration options > important: the rpid must be a valid domain that matches or is a registrable suffix of the page origin. for example, if your app is at https://app.mycompany.com, the rpid can be \"app.mycompany.com\" o environment variables browser and platform support passkeys are supported on all modern browsers and platforms: cross-device authentication modern passkey implementations support cross-device authentication, where a user can use their phone to authenticate on a desktop browser via bluetooth proximity. this is handled natively by the brows client-side api register a passkey users must be signed in to register a passkey. this is typically done in a security settings page: sign in with a passkey list registered passkeys delete a passkey complete registration component sign-in page with passkey option resident vs. non-resident credentials webauthn defines two types of credentials: combining with other methods passkeys work well alongside traditional authentication methods. users can register a passkey after signing in with email/password, and then use the passkey for future sign-ins: audit events see the audit logs guide for more details. security advantages over passwords passkeys are the most secure user authentication method available in web browsers today. the private key never leaves the user's device, and authentication requires physical presence (biometric or sec security considerations always validate the origin -- the origin in your passkey config must exactly match the page origin. mismatches will cause authentication failures. use https in production -- webauthn requires a secure troubleshooting \"webauthn not supported\" the user's browser does not support the webauthn api. this is rare on modern browsers but can happen on older versions or certain embedded browser views. check window.publickeycredential before showin \"registration cancelled\" the user dismissed the browser's passkey prompt. this is not an error -- simply allow the user to try again. \"origin mismatch\" the origin in your passkey config does not match the actual page origin. ensure passkey_origin matches exactly (including protocol and port). \"passkey not found\" no registered credentials match the rpid. this can happen if: the user hasn't registered a passkey for this site the rpid changed between registration and authentication what's next email otp -- passwordless authentication via email codes multi-factor auth -- add totp as a second factor email & password -- traditional authentication"
  },
  {
    "slug": "social-oauth",
    "title": "Social OAuth",
    "description": "Add social login with Google, GitHub, Apple, Microsoft, and 6 more providers — complete setup guides for each.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "Supported Providers",
        "anchor": "supported-providers",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Add social providers to your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Setting Provider Credentials",
        "anchor": "setting-provider-credentials",
        "snippet": "OAuth credentials must be set on the Convex deployment (not in .env.local), since they're used by server-side Convex functions:"
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
        "snippet": "Go to the Google Cloud Console Create a new project (or select existing) Navigate to APIs & Services > Credentials Click Create Credentials > OAuth client ID"
      },
      {
        "level": 3,
        "text": "GitHub",
        "anchor": "github",
        "snippet": "Go to GitHub Developer Settings Click New OAuth App Set Homepage URL: http://localhost:3000 Set Authorization callback URL: http://localhost:3000/api/auth/callback/github"
      },
      {
        "level": 3,
        "text": "Apple",
        "anchor": "apple",
        "snippet": "Apple Sign-In requires more setup than other providers:"
      },
      {
        "level": 3,
        "text": "Microsoft (Azure AD)",
        "anchor": "microsoft-azure-ad",
        "snippet": "Go to the Azure Portal Click New registration Set redirect URI: http://localhost:3000/api/auth/callback/microsoft (Web platform) Note the Application (client) ID and Directory (tenant) ID"
      },
      {
        "level": 3,
        "text": "Facebook",
        "anchor": "facebook",
        "snippet": "Go to Meta for Developers Create a new app (Consumer type) Add Facebook Login product Set Valid OAuth Redirect URIs: http://localhost:3000/api/auth/callback/facebook"
      },
      {
        "level": 3,
        "text": "Twitter (X)",
        "anchor": "twitter-x",
        "snippet": "Go to the Twitter Developer Portal Create a new project and app Enable OAuth 2.0 Set Callback URL: http://localhost:3000/api/auth/callback/twitter Copy the Client ID and Client Secret"
      },
      {
        "level": 3,
        "text": "Discord",
        "anchor": "discord",
        "snippet": "Go to the Discord Developer Portal Create a new application Go to OAuth2 settings Add redirect: http://localhost:3000/api/auth/callback/discord Copy the Client ID and reset the Client Secret"
      },
      {
        "level": 3,
        "text": "Spotify",
        "anchor": "spotify",
        "snippet": "Go to the Spotify Developer Dashboard Create a new app Add redirect URI: http://localhost:3000/api/auth/callback/spotify Copy the Client ID and Client Secret"
      },
      {
        "level": 3,
        "text": "Twitch",
        "anchor": "twitch",
        "snippet": "Go to the Twitch Developer Console Register a new application Set OAuth Redirect URL: http://localhost:3000/api/auth/callback/twitch Copy the Client ID and generate a Client Secret"
      },
      {
        "level": 3,
        "text": "LinkedIn",
        "anchor": "linkedin",
        "snippet": "Go to the LinkedIn Developer Portal Create a new app Under Auth, add redirect URL: http://localhost:3000/api/auth/callback/linkedin Request the Sign In with LinkedIn using OpenID Connect product"
      },
      {
        "level": 2,
        "text": "Callback URL Pattern",
        "anchor": "callback-url-pattern",
        "snippet": "All OAuth providers follow the same callback URL pattern:"
      },
      {
        "level": 2,
        "text": "Client-Side Integration",
        "anchor": "client-side-integration",
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
        "text": "SocialButtons Component",
        "anchor": "socialbuttons-component",
        "snippet": "Banata Auth ships a SocialButtons component that renders buttons for all configured providers:"
      },
      {
        "level": 2,
        "text": "Conditional Provider Configuration",
        "anchor": "conditional-provider-configuration",
        "snippet": "You can conditionally enable providers based on whether credentials are available:"
      },
      {
        "level": 2,
        "text": "Account Linking",
        "anchor": "account-linking",
        "snippet": "When a user signs in with a social provider and an account with the same email already exists (from email/password sign-up), Better Auth handles account linking:"
      },
      {
        "level": 2,
        "text": "How the OAuth Flow Works",
        "anchor": "how-the-oauth-flow-works",
        "snippet": "Here's what happens under the hood when a user clicks \"Sign in with GitHub\":"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "Social sign-ins generate these audit log events:"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"redirect_uri_mismatch\" Error",
        "anchor": "redirecturimismatch-error",
        "snippet": "The callback URL in your OAuth provider settings doesn't match the actual URL. Make sure: Development: http://localhost:3000/api/auth/callback/{provider}"
      },
      {
        "level": 3,
        "text": "\"Access Denied\" After Granting Permission",
        "anchor": "access-denied-after-granting-permission",
        "snippet": "Check that the provider's Client Secret is correctly set on Convex: npx convex env list Check that the provider is included in your socialProviders config."
      },
      {
        "level": 3,
        "text": "User Created Without Name/Email",
        "anchor": "user-created-without-nameemail",
        "snippet": "Some providers don't return all user fields. Check the provider's scope settings to ensure you're requesting the right permissions (e.g., email scope for Google)."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Magic Links — Passwordless authentication via email Multi-Factor Auth — Add TOTP as a second factor Organizations — Multi-tenant workspaces"
      }
    ],
    "searchText": "social oauth add social login with google, github, apple, microsoft, and 6 more providers — complete setup guides for each. supported providers --- configuration add social providers to your banataauthconfig: setting provider credentials oauth credentials must be set on the convex deployment (not in .env.local), since they're used by server-side convex functions: provider setup guides google go to the google cloud console create a new project (or select existing) navigate to apis & services > credentials click create credentials > oauth client id github go to github developer settings click new oauth app set homepage url: http://localhost:3000 set authorization callback url: http://localhost:3000/api/auth/callback/github apple apple sign-in requires more setup than other providers: microsoft (azure ad) go to the azure portal click new registration set redirect uri: http://localhost:3000/api/auth/callback/microsoft (web platform) note the application (client) id and directory (tenant) id facebook go to meta for developers create a new app (consumer type) add facebook login product set valid oauth redirect uris: http://localhost:3000/api/auth/callback/facebook twitter (x) go to the twitter developer portal create a new project and app enable oauth 2.0 set callback url: http://localhost:3000/api/auth/callback/twitter copy the client id and client secret discord go to the discord developer portal create a new application go to oauth2 settings add redirect: http://localhost:3000/api/auth/callback/discord copy the client id and reset the client secret spotify go to the spotify developer dashboard create a new app add redirect uri: http://localhost:3000/api/auth/callback/spotify copy the client id and client secret twitch go to the twitch developer console register a new application set oauth redirect url: http://localhost:3000/api/auth/callback/twitch copy the client id and generate a client secret linkedin go to the linkedin developer portal create a new app under auth, add redirect url: http://localhost:3000/api/auth/callback/linkedin request the sign in with linkedin using openid connect product callback url pattern all oauth providers follow the same callback url pattern: client-side integration initiating social sign-in socialbuttons component banata auth ships a socialbuttons component that renders buttons for all configured providers: conditional provider configuration you can conditionally enable providers based on whether credentials are available: account linking when a user signs in with a social provider and an account with the same email already exists (from email/password sign-up), better auth handles account linking: how the oauth flow works here's what happens under the hood when a user clicks \"sign in with github\": audit events social sign-ins generate these audit log events: troubleshooting \"redirect_uri_mismatch\" error the callback url in your oauth provider settings doesn't match the actual url. make sure: development: http://localhost:3000/api/auth/callback/{provider} \"access denied\" after granting permission check that the provider's client secret is correctly set on convex: npx convex env list check that the provider is included in your socialproviders config. user created without name/email some providers don't return all user fields. check the provider's scope settings to ensure you're requesting the right permissions (e.g., email scope for google). what's next magic links — passwordless authentication via email multi-factor auth — add totp as a second factor organizations — multi-tenant workspaces"
  },
  {
    "slug": "username-auth",
    "title": "Username Authentication",
    "description": "Allow users to sign in with a username and password instead of email.",
    "section": "Authentication",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "When to Use Username Auth",
        "anchor": "when-to-use-username-auth",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable username authentication in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Username with Optional Email",
        "anchor": "username-with-optional-email",
        "snippet": "In many cases, you want to support both username and email. You can enable both methods and make email optional during sign-up:"
      },
      {
        "level": 2,
        "text": "Username Validation Rules",
        "anchor": "username-validation-rules",
        "snippet": "Banata Auth enforces the following rules on usernames:"
      },
      {
        "level": 3,
        "text": "Reserved Usernames",
        "anchor": "reserved-usernames",
        "snippet": "The following usernames are reserved and cannot be registered:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign Up with Username",
        "anchor": "sign-up-with-username",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign In with Username",
        "anchor": "sign-in-with-username",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Check Username Availability",
        "anchor": "check-username-availability",
        "snippet": "Before sign-up, you can check if a username is available:"
      },
      {
        "level": 2,
        "text": "Complete Sign-Up Form Example",
        "anchor": "complete-sign-up-form-example",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sign-In Form",
        "anchor": "sign-in-form",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Username Uniqueness Enforcement",
        "anchor": "username-uniqueness-enforcement",
        "snippet": "Usernames are enforced as globally unique across all users in your application. The uniqueness check is performed at the database level:"
      },
      {
        "level": 3,
        "text": "Handling Conflicts",
        "anchor": "handling-conflicts",
        "snippet": "If a username is taken, the server returns a ConflictError (409):"
      },
      {
        "level": 2,
        "text": "Combining Username with Email",
        "anchor": "combining-username-with-email",
        "snippet": "When both username and emailPassword are enabled, users can sign in with either their username or their email:"
      },
      {
        "level": 3,
        "text": "Password Reset with Username Auth",
        "anchor": "password-reset-with-username-auth",
        "snippet": "If a user signed up with only a username (no email), password reset via email is not available. Consider these alternatives:"
      },
      {
        "level": 2,
        "text": "Server-Side User Management",
        "anchor": "server-side-user-management",
        "snippet": "Use the admin SDK to manage username-based users:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "See the Audit Logs guide for more details."
      },
      {
        "level": 2,
        "text": "Error Handling",
        "anchor": "error-handling",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Username enumeration -- The sign-in error message is intentionally vague (\"Invalid username or password\") to prevent attackers from determining whether a username exists. The checkAvailability endpoin"
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
        "snippet": "The username does not meet the validation rules. Ensure the username: Is at least 3 characters long Is at most 32 characters long Starts with a letter Contains only lowercase letters, numbers, undersc"
      },
      {
        "level": 3,
        "text": "\"Username already taken\"",
        "anchor": "username-already-taken",
        "snippet": "Another user has registered with the same username. Suggest alternatives or prompt the user to choose a different one. Remember that usernames are case-insensitive."
      },
      {
        "level": 3,
        "text": "\"Cannot reset password\"",
        "anchor": "cannot-reset-password",
        "snippet": "The user signed up with username only and has no email address linked. Use the admin SDK to reset their password, or ask them to add an email to their account first."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Email & Password -- Traditional email-based authentication Anonymous Auth -- Guest access with optional upgrade Social OAuth -- Add Google, GitHub, etc. alongside username auth"
      }
    ],
    "searchText": "username authentication allow users to sign in with a username and password instead of email. how it works when to use username auth --- configuration enable username authentication in your banataauthconfig: username with optional email in many cases, you want to support both username and email. you can enable both methods and make email optional during sign-up: username validation rules banata auth enforces the following rules on usernames: reserved usernames the following usernames are reserved and cannot be registered: client-side api sign up with username sign in with username check username availability before sign-up, you can check if a username is available: complete sign-up form example sign-in form username uniqueness enforcement usernames are enforced as globally unique across all users in your application. the uniqueness check is performed at the database level: handling conflicts if a username is taken, the server returns a conflicterror (409): combining username with email when both username and emailpassword are enabled, users can sign in with either their username or their email: password reset with username auth if a user signed up with only a username (no email), password reset via email is not available. consider these alternatives: server-side user management use the admin sdk to manage username-based users: audit events see the audit logs guide for more details. error handling rate limits --- security considerations username enumeration -- the sign-in error message is intentionally vague (\"invalid username or password\") to prevent attackers from determining whether a username exists. the checkavailability endpoin troubleshooting \"invalid username format\" the username does not meet the validation rules. ensure the username: is at least 3 characters long is at most 32 characters long starts with a letter contains only lowercase letters, numbers, undersc \"username already taken\" another user has registered with the same username. suggest alternatives or prompt the user to choose a different one. remember that usernames are case-insensitive. \"cannot reset password\" the user signed up with username only and has no email address linked. use the admin sdk to reset their password, or ask them to add an email to their account first. what's next email & password -- traditional email-based authentication anonymous auth -- guest access with optional upgrade social oauth -- add google, github, etc. alongside username auth"
  },
  {
    "slug": "email-templates",
    "title": "Email Templates",
    "description": "Block-based email template editor with 9 block types, variable interpolation, and 6 built-in auth templates.",
    "section": "Infrastructure",
    "headings": [
      {
        "level": 2,
        "text": "Block Types",
        "anchor": "block-types",
        "snippet": "Each email template is an ordered array of 9 block types. Blocks map 1:1 to React Email components and support the shared EmailBlockStyle properties for inline styling."
      },
      {
        "level": 3,
        "text": "Heading",
        "anchor": "heading",
        "snippet": "Renders an <h1> through <h6> element."
      },
      {
        "level": 3,
        "text": "Text",
        "anchor": "text",
        "snippet": "A paragraph of body text. Supports basic inline HTML (e.g., <strong>, <em>)."
      },
      {
        "level": 3,
        "text": "Button",
        "anchor": "button",
        "snippet": "A call-to-action button rendered as a linked element."
      },
      {
        "level": 3,
        "text": "Image",
        "anchor": "image",
        "snippet": "An inline image element."
      },
      {
        "level": 3,
        "text": "Divider",
        "anchor": "divider",
        "snippet": "A horizontal rule separator."
      },
      {
        "level": 3,
        "text": "Spacer",
        "anchor": "spacer",
        "snippet": "Empty vertical space with configurable height."
      },
      {
        "level": 3,
        "text": "Code",
        "anchor": "code",
        "snippet": "Monospace-styled text, designed for OTP codes, tokens, and inline code snippets."
      },
      {
        "level": 3,
        "text": "Link",
        "anchor": "link",
        "snippet": "An inline hyperlink."
      },
      {
        "level": 3,
        "text": "Columns",
        "anchor": "columns",
        "snippet": "A multi-column layout (2 to 4 columns). Each column contains its own nested array of blocks."
      },
      {
        "level": 2,
        "text": "EmailBlockStyle",
        "anchor": "emailblockstyle",
        "snippet": "All blocks that accept a style property use the shared EmailBlockStyle interface:"
      },
      {
        "level": 2,
        "text": "Variable Interpolation",
        "anchor": "variable-interpolation",
        "snippet": "Templates support {{variableName}} placeholders in text, URLs, and subject lines. Variables are replaced at send time with the data passed in the API call."
      },
      {
        "level": 3,
        "text": "Extracting Variables",
        "anchor": "extracting-variables",
        "snippet": "The extractVariables utility scans a block array and returns all referenced variable names:"
      },
      {
        "level": 2,
        "text": "Built-in Auth Templates",
        "anchor": "built-in-auth-templates",
        "snippet": "Banata Auth ships with 6 built-in templates for standard auth flows. These are created automatically and can be customized in the dashboard editor. Built-in templates cannot be deleted."
      },
      {
        "level": 3,
        "text": "verification",
        "anchor": "verification",
        "snippet": "Sent when a user signs up and needs to verify their email address."
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
        "snippet": "Sent for passwordless sign-in via magic link."
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
        "snippet": "Sent when a user is invited to join an organization."
      },
      {
        "level": 3,
        "text": "welcome",
        "anchor": "welcome",
        "snippet": "Sent after successful account creation."
      },
      {
        "level": 2,
        "text": "Template Categories",
        "anchor": "template-categories",
        "snippet": "Templates are organized into 6 categories:"
      },
      {
        "level": 2,
        "text": "Branding Integration",
        "anchor": "branding-integration",
        "snippet": "All email templates automatically inherit the project's branding configuration when rendered. Branding is set in the dashboard under Settings and includes:"
      },
      {
        "level": 2,
        "text": "Dashboard Design Studio",
        "anchor": "dashboard-design-studio",
        "snippet": "The dashboard includes a visual email editor for building and editing templates:"
      },
      {
        "level": 2,
        "text": "SDK / API Usage",
        "anchor": "sdk-api-usage",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Sending Emails",
        "anchor": "sending-emails",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Previewing a Template",
        "anchor": "previewing-a-template",
        "snippet": "Render a template with sample data without sending it:"
      },
      {
        "level": 3,
        "text": "Listing Templates",
        "anchor": "listing-templates",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Getting a Template",
        "anchor": "getting-a-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Creating a Custom Template",
        "anchor": "creating-a-custom-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Updating a Template",
        "anchor": "updating-a-template",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Deleting a Template",
        "anchor": "deleting-a-template",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Template Data Model",
        "anchor": "template-data-model",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Sending Test Emails",
        "anchor": "sending-test-emails",
        "snippet": "Verify your email provider configuration by sending a test email:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Emails — Configure email providers (SendGrid, Resend, Postmark, etc.) SDK Reference — Complete API reference for the Emails resource Settings — Configure project branding used by email templates"
      }
    ],
    "searchText": "email templates block-based email template editor with 9 block types, variable interpolation, and 6 built-in auth templates. block types each email template is an ordered array of 9 block types. blocks map 1:1 to react email components and support the shared emailblockstyle properties for inline styling. heading renders an <h1> through <h6> element. text a paragraph of body text. supports basic inline html (e.g., <strong>, <em>). button a call-to-action button rendered as a linked element. image an inline image element. divider a horizontal rule separator. spacer empty vertical space with configurable height. code monospace-styled text, designed for otp codes, tokens, and inline code snippets. link an inline hyperlink. columns a multi-column layout (2 to 4 columns). each column contains its own nested array of blocks. emailblockstyle all blocks that accept a style property use the shared emailblockstyle interface: variable interpolation templates support {{variablename}} placeholders in text, urls, and subject lines. variables are replaced at send time with the data passed in the api call. extracting variables the extractvariables utility scans a block array and returns all referenced variable names: built-in auth templates banata auth ships with 6 built-in templates for standard auth flows. these are created automatically and can be customized in the dashboard editor. built-in templates cannot be deleted. verification sent when a user signs up and needs to verify their email address. password-reset sent when a user requests a password reset. magic-link sent for passwordless sign-in via magic link. email-otp sent for email-based one-time password verification. invitation sent when a user is invited to join an organization. welcome sent after successful account creation. template categories templates are organized into 6 categories: branding integration all email templates automatically inherit the project's branding configuration when rendered. branding is set in the dashboard under settings and includes: dashboard design studio the dashboard includes a visual email editor for building and editing templates: sdk / api usage sending emails previewing a template render a template with sample data without sending it: listing templates getting a template creating a custom template updating a template deleting a template template data model api endpoints --- sending test emails verify your email provider configuration by sending a test email: what's next emails — configure email providers (sendgrid, resend, postmark, etc.) sdk reference — complete api reference for the emails resource settings — configure project branding used by email templates"
  },
  {
    "slug": "emails",
    "title": "Emails",
    "description": "Configure email providers, manage transactional email types, and monitor email delivery events in the Banata Auth dashboard.",
    "section": "Infrastructure",
    "headings": [
      {
        "level": 2,
        "text": "Email Sub-Pages",
        "anchor": "email-sub-pages",
        "snippet": "Navigating to /emails automatically redirects to /emails/events."
      },
      {
        "level": 2,
        "text": "Email Providers",
        "anchor": "email-providers",
        "snippet": "Configure which third-party email delivery provider handles transactional emails for your Banata Auth instance. Five providers are supported out of the box:"
      },
      {
        "level": 3,
        "text": "Setting Up a Provider",
        "anchor": "setting-up-a-provider",
        "snippet": "Navigate to Emails > Providers Click Enable on your preferred provider Enter your API key in the input field that appears Click Save Key to persist the credential"
      },
      {
        "level": 3,
        "text": "Sending Test Emails",
        "anchor": "sending-test-emails",
        "snippet": "Once a provider is active, click the Send test email button in the page header. Enter a recipient email address and click Send. The test email is dispatched through your active provider to verify that"
      },
      {
        "level": 3,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Provider Config Shape",
        "anchor": "provider-config-shape",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Example: Setting Up Resend",
        "anchor": "example-setting-up-resend",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Configuration",
        "anchor": "email-configuration",
        "snippet": "Control which categories of transactional emails are sent to your users. Each email type can be independently enabled or disabled."
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
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Toggling an Email Type",
        "anchor": "toggling-an-email-type",
        "snippet": "Each email type has a Switch toggle. Changes are saved immediately when toggled. The server returns the full updated configuration after each change."
      },
      {
        "level": 3,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Email Toggle Shape",
        "anchor": "email-toggle-shape",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Example: Disabling Password Reset Emails",
        "anchor": "example-disabling-password-reset-emails",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Events",
        "anchor": "email-events",
        "snippet": "The Events page provides a real-time view of email-related activity in your Banata Auth instance. Events are filtered from the global audit log based on email-related action keywords."
      },
      {
        "level": 3,
        "text": "What's Tracked",
        "anchor": "whats-tracked",
        "snippet": "Events matching these keywords are displayed:"
      },
      {
        "level": 3,
        "text": "Event Table Columns",
        "anchor": "event-table-columns",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Empty State",
        "anchor": "empty-state",
        "snippet": "If no email events exist in the audit log, the page shows an empty state with the message: \"No email events found in the last 30 days. Events will appear here once emails are sent through your configu"
      },
      {
        "level": 2,
        "text": "Data Model",
        "anchor": "data-model",
        "snippet": "Email configuration is stored in two separate config tables:"
      },
      {
        "level": 3,
        "text": "Email Toggles",
        "anchor": "email-toggles",
        "snippet": "Stored in the emailConfig table as a JSON blob:"
      },
      {
        "level": 3,
        "text": "Email Provider Config",
        "anchor": "email-provider-config",
        "snippet": "Stored in the emailProviderConfig table as a JSON blob:"
      },
      {
        "level": 2,
        "text": "Using Emails Programmatically",
        "anchor": "using-emails-programmatically",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Notifications — Configure system notifications Domains — Set up custom domains for auth email links Settings — Configure project-level settings"
      }
    ],
    "searchText": "emails configure email providers, manage transactional email types, and monitor email delivery events in the banata auth dashboard. email sub-pages navigating to /emails automatically redirects to /emails/events. email providers configure which third-party email delivery provider handles transactional emails for your banata auth instance. five providers are supported out of the box: setting up a provider navigate to emails > providers click enable on your preferred provider enter your api key in the input field that appears click save key to persist the credential sending test emails once a provider is active, click the send test email button in the page header. enter a recipient email address and click send. the test email is dispatched through your active provider to verify that api endpoints provider config shape example: setting up resend email configuration control which categories of transactional emails are sent to your users. each email type can be independently enabled or disabled. authentication emails organization emails toggling an email type each email type has a switch toggle. changes are saved immediately when toggled. the server returns the full updated configuration after each change. api endpoints email toggle shape example: disabling password reset emails email events the events page provides a real-time view of email-related activity in your banata auth instance. events are filtered from the global audit log based on email-related action keywords. what's tracked events matching these keywords are displayed: event table columns empty state if no email events exist in the audit log, the page shows an empty state with the message: \"no email events found in the last 30 days. events will appear here once emails are sent through your configu data model email configuration is stored in two separate config tables: email toggles stored in the emailconfig table as a json blob: email provider config stored in the emailproviderconfig table as a json blob: using emails programmatically what's next notifications — configure system notifications domains — set up custom domains for auth email links settings — configure project-level settings"
  },
  {
    "slug": "projects-environments",
    "title": "Projects",
    "description": "Multi-tenant project isolation with per-project users, organizations, branding, and configuration.",
    "section": "Infrastructure",
    "headings": [
      {
        "level": 2,
        "text": "Why Projects?",
        "anchor": "why-projects",
        "snippet": "Consider a software engineering firm that builds and operates authentication for several client products from a single dashboard. Without project isolation, all users, organizations, email templates, "
      },
      {
        "level": 2,
        "text": "Concepts",
        "anchor": "concepts",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Project",
        "anchor": "project",
        "snippet": "A project is a fully isolated auth tenant. Everything that constitutes an application's auth system lives within a project boundary:"
      },
      {
        "level": 2,
        "text": "Data Model",
        "anchor": "data-model",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Project",
        "anchor": "project",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Project Scoping",
        "anchor": "project-scoping",
        "snippet": "Every record in the database (except the project table itself) has an optional projectId field. This field links the record to its parent project. Records without a projectId are excluded from dashboa"
      },
      {
        "level": 2,
        "text": "Default Bootstrapping",
        "anchor": "default-bootstrapping",
        "snippet": "On the first dashboard load, the dashboard calls the ensure-default endpoint. If no projects exist in the database and autoCreateDefault is enabled (the default), Banata Auth automatically creates:"
      },
      {
        "level": 3,
        "text": "Plugin Options",
        "anchor": "plugin-options",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Dashboard Usage",
        "anchor": "dashboard-usage",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Project Switcher",
        "anchor": "project-switcher",
        "snippet": "The dashboard sidebar includes a ProjectSwitcher component that lists all projects. Selecting a project updates the active scope, and all subsequent API calls from the dashboard are automatically scop"
      },
      {
        "level": 3,
        "text": "Automatic Scope Injection",
        "anchor": "automatic-scope-injection",
        "snippet": "The dashboard API layer automatically injects the active projectId into every outgoing POST request body, unless the endpoint is scope-exempt (project management endpoints themselves are exempt). This"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": "The @banata-auth/sdk provides a Projects resource for programmatic management of projects."
      },
      {
        "level": 3,
        "text": "Initialize the SDK",
        "anchor": "initialize-the-sdk",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List All Projects",
        "anchor": "list-all-projects",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Create a Project",
        "anchor": "create-a-project",
        "snippet": "Creating a project seeds RBAC permissions and a super_admin role automatically."
      },
      {
        "level": 3,
        "text": "Get a Project",
        "anchor": "get-a-project",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Update a Project",
        "anchor": "update-a-project",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Project",
        "anchor": "delete-a-project",
        "snippet": "Deleting a project removes the project record. Note that this does not cascade-delete project-scoped data (users, organizations, etc.) which requires a separate migration."
      },
      {
        "level": 3,
        "text": "Bootstrap Default Project",
        "anchor": "bootstrap-default-project",
        "snippet": "Typically called by the dashboard on first load. If no projects exist, creates a \"Default Project\" with seeded RBAC permissions."
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "All project management endpoints are under /api/auth/banata/projects/. Every endpoint requires admin authentication."
      },
      {
        "level": 3,
        "text": "Validation Rules",
        "anchor": "validation-rules",
        "snippet": "Project slug: 1-100 characters, lowercase alphanumeric with hyphens (/^[a-z0-9-]+$/), must be unique across all projects. Project name: 1-100 characters."
      },
      {
        "level": 3,
        "text": "Response Examples",
        "anchor": "response-examples",
        "snippet": "Create Project"
      },
      {
        "level": 2,
        "text": "Migrations",
        "anchor": "migrations",
        "snippet": "Banata Auth includes built-in migrations for managing project data. These run inside the Convex component via CLI."
      },
      {
        "level": 3,
        "text": "Backfill Project IDs",
        "anchor": "backfill-project-ids",
        "snippet": "If you have existing records that were created before project isolation was enforced, they may be missing projectId. These records are hidden from dashboard views. To assign them to a project:"
      },
      {
        "level": 3,
        "text": "Clear All Data",
        "anchor": "clear-all-data",
        "snippet": "For a complete fresh start (wipes ALL records from ALL tables):"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Admin-only access: All project management endpoints require admin authentication. Regular users cannot create, modify, or delete projects."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "API Keys -- Programmatic access with scoped API keys SDK Reference -- Complete API reference for all SDK methods Webhooks -- Configure webhook endpoints per project"
      }
    ],
    "searchText": "projects multi-tenant project isolation with per-project users, organizations, branding, and configuration. why projects? consider a software engineering firm that builds and operates authentication for several client products from a single dashboard. without project isolation, all users, organizations, email templates,  concepts project a project is a fully isolated auth tenant. everything that constitutes an application's auth system lives within a project boundary: data model project project scoping every record in the database (except the project table itself) has an optional projectid field. this field links the record to its parent project. records without a projectid are excluded from dashboa default bootstrapping on the first dashboard load, the dashboard calls the ensure-default endpoint. if no projects exist in the database and autocreatedefault is enabled (the default), banata auth automatically creates: plugin options dashboard usage project switcher the dashboard sidebar includes a projectswitcher component that lists all projects. selecting a project updates the active scope, and all subsequent api calls from the dashboard are automatically scop automatic scope injection the dashboard api layer automatically injects the active projectid into every outgoing post request body, unless the endpoint is scope-exempt (project management endpoints themselves are exempt). this sdk usage the @banata-auth/sdk provides a projects resource for programmatic management of projects. initialize the sdk list all projects create a project creating a project seeds rbac permissions and a super_admin role automatically. get a project update a project delete a project deleting a project removes the project record. note that this does not cascade-delete project-scoped data (users, organizations, etc.) which requires a separate migration. bootstrap default project typically called by the dashboard on first load. if no projects exist, creates a \"default project\" with seeded rbac permissions. api endpoints all project management endpoints are under /api/auth/banata/projects/. every endpoint requires admin authentication. validation rules project slug: 1-100 characters, lowercase alphanumeric with hyphens (/^[a-z0-9-]+$/), must be unique across all projects. project name: 1-100 characters. response examples create project migrations banata auth includes built-in migrations for managing project data. these run inside the convex component via cli. backfill project ids if you have existing records that were created before project isolation was enforced, they may be missing projectid. these records are hidden from dashboard views. to assign them to a project: clear all data for a complete fresh start (wipes all records from all tables): security considerations admin-only access: all project management endpoints require admin authentication. regular users cannot create, modify, or delete projects. what's next api keys -- programmatic access with scoped api keys sdk reference -- complete api reference for all sdk methods webhooks -- configure webhook endpoints per project"
  },
  {
    "slug": "convex",
    "title": "Convex Integration",
    "description": "Complete reference for @banata-auth/convex — auth factory, plugin system, triggers, database schema, and HTTP route registration.",
    "section": "Packages",
    "headings": [
      {
        "level": 2,
        "text": "Entry Points",
        "anchor": "entry-points",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Setup",
        "anchor": "setup",
        "snippet": "You need 4 files in your convex/ directory to set up the backend:"
      },
      {
        "level": 3,
        "text": "1. Auth Config (convex/auth.config.ts)",
        "anchor": "1-auth-config-convexauthconfigts",
        "snippet": "Tells Convex how to validate JWTs issued by Better Auth:"
      },
      {
        "level": 3,
        "text": "2. Schema (convex/banataAuth/schema.ts)",
        "anchor": "2-schema-convexbanataauthschemats",
        "snippet": "Re-export the auth database schema:"
      },
      {
        "level": 3,
        "text": "3. Auth Factory (convex/banataAuth/auth.ts)",
        "anchor": "3-auth-factory-convexbanataauthauthts",
        "snippet": "Configure and create the auth instance:"
      },
      {
        "level": 3,
        "text": "4. HTTP Router (convex/http.ts)",
        "anchor": "4-http-router-convexhttpts",
        "snippet": "Register auth routes:"
      },
      {
        "level": 2,
        "text": "BanataAuthConfig Reference",
        "anchor": "banataauthconfig-reference",
        "snippet": "The complete configuration type:"
      },
      {
        "level": 2,
        "text": "Plugin System",
        "anchor": "plugin-system",
        "snippet": "Banata Auth uses Better Auth's plugin system to add features. Plugins are assembled automatically based on your config."
      },
      {
        "level": 3,
        "text": "Always-On Plugins (7)",
        "anchor": "always-on-plugins-7",
        "snippet": "These are always enabled — you can't turn them off:"
      },
      {
        "level": 3,
        "text": "Conditionally-Enabled Plugins (8)",
        "anchor": "conditionally-enabled-plugins-8",
        "snippet": "These are enabled based on your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "SSO and SCIM (Disabled)",
        "anchor": "sso-and-scim-disabled",
        "snippet": "The SSO (SAML/OIDC) and SCIM (directory sync) plugins are not currently available because they depend on Node.js built-ins (XML parsing, crypto operations) that aren't available in the Convex runtime."
      },
      {
        "level": 2,
        "text": "Trigger System",
        "anchor": "trigger-system",
        "snippet": "Triggers let you execute custom logic when auth events occur. They're defined in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Available Triggers (14)",
        "anchor": "available-triggers-14",
        "snippet": "> Note: Only 6 of the 14 triggers are currently wired to Better Auth's databaseHooks system (the user and session triggers). The remaining 8 are defined but need to be connected to plugin hooks."
      },
      {
        "level": 2,
        "text": "Database Schema (26 Tables)",
        "anchor": "database-schema-26-tables",
        "snippet": "The schema is defined at @banata-auth/convex/schema and includes these tables:"
      },
      {
        "level": 3,
        "text": "Core Auth Tables",
        "anchor": "core-auth-tables",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization Tables",
        "anchor": "organization-tables",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "RBAC Tables",
        "anchor": "rbac-tables",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Security Tables",
        "anchor": "security-tables",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Infrastructure Tables",
        "anchor": "infrastructure-tables",
        "snippet": "Plus ~9 additional internal Better Auth tables for OAuth state, anonymous sessions, multi-session management, etc."
      },
      {
        "level": 2,
        "text": "HTTP Route Registration",
        "anchor": "http-route-registration",
        "snippet": "authComponent.registerRoutes(http, createAuth) registers all Better Auth HTTP routes:"
      },
      {
        "level": 2,
        "text": "Custom Convex Functions",
        "anchor": "custom-convex-functions",
        "snippet": "You can write Convex queries and mutations that access auth data:"
      },
      {
        "level": 2,
        "text": "Environment Variables",
        "anchor": "environment-variables",
        "snippet": "The Convex backend needs these environment variables (set via npx convex env set):"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Environment Variables — Complete reference for all variables SDK Reference — Server-side admin SDK Deploy — Production deployment guide"
      }
    ],
    "searchText": "convex integration complete reference for @banata-auth/convex — auth factory, plugin system, triggers, database schema, and http route registration. entry points --- setup you need 4 files in your convex/ directory to set up the backend: 1. auth config (convex/auth.config.ts) tells convex how to validate jwts issued by better auth: 2. schema (convex/banataauth/schema.ts) re-export the auth database schema: 3. auth factory (convex/banataauth/auth.ts) configure and create the auth instance: 4. http router (convex/http.ts) register auth routes: banataauthconfig reference the complete configuration type: plugin system banata auth uses better auth's plugin system to add features. plugins are assembled automatically based on your config. always-on plugins (7) these are always enabled — you can't turn them off: conditionally-enabled plugins (8) these are enabled based on your banataauthconfig: sso and scim (disabled) the sso (saml/oidc) and scim (directory sync) plugins are not currently available because they depend on node.js built-ins (xml parsing, crypto operations) that aren't available in the convex runtime. trigger system triggers let you execute custom logic when auth events occur. they're defined in your banataauthconfig: available triggers (14) > note: only 6 of the 14 triggers are currently wired to better auth's databasehooks system (the user and session triggers). the remaining 8 are defined but need to be connected to plugin hooks. database schema (26 tables) the schema is defined at @banata-auth/convex/schema and includes these tables: core auth tables organization tables rbac tables security tables infrastructure tables plus ~9 additional internal better auth tables for oauth state, anonymous sessions, multi-session management, etc. http route registration authcomponent.registerroutes(http, createauth) registers all better auth http routes: custom convex functions you can write convex queries and mutations that access auth data: environment variables the convex backend needs these environment variables (set via npx convex env set): what's next environment variables — complete reference for all variables sdk reference — server-side admin sdk deploy — production deployment guide"
  },
  {
    "slug": "nextjs",
    "title": "Next.js",
    "description": "Complete reference for @banata-auth/nextjs — reverse proxy route handler, middleware, server auth utilities, and preloaded queries.",
    "section": "Packages",
    "headings": [
      {
        "level": 2,
        "text": "Entry Points",
        "anchor": "entry-points",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Route Handler (Reverse Proxy)",
        "anchor": "route-handler-reverse-proxy",
        "snippet": "The route handler acts as a reverse proxy — it forwards auth requests from your Next.js app to the Convex .site URL where Better Auth is running. This keeps session cookies on your domain."
      },
      {
        "level": 3,
        "text": "createRouteHandler(options?)",
        "anchor": "createroutehandleroptions",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "How the Proxy Works",
        "anchor": "how-the-proxy-works",
        "snippet": "Browser sends request to /api/auth/sign-in/email Route handler receives the request Forwards to {CONVEX_SITE_URL}/api/auth/sign-in/email Preserves all headers and body"
      },
      {
        "level": 2,
        "text": "Middleware (Route Protection)",
        "anchor": "middleware-route-protection",
        "snippet": "The middleware checks for the Better Auth session cookie on incoming requests and redirects unauthenticated users."
      },
      {
        "level": 3,
        "text": "banataAuthProxy(options) / banataAuthMiddleware(options)",
        "anchor": "banataauthproxyoptions-banataauthmiddlewareoptions",
        "snippet": "These are aliases for the same function:"
      },
      {
        "level": 3,
        "text": "Route Matching",
        "anchor": "route-matching",
        "snippet": "Routes are matched using regex with ^...$ anchoring. This means:"
      },
      {
        "level": 3,
        "text": "How Middleware Works",
        "anchor": "how-middleware-works",
        "snippet": "Request comes in Check if the route matches any publicRoutes → Allow through Check for Better Auth session cookie (via getSessionCookie()) Cookie found → Set x-pathname header and allow through"
      },
      {
        "level": 3,
        "text": "The x-pathname Header",
        "anchor": "the-x-pathname-header",
        "snippet": "The middleware sets an x-pathname header on authenticated requests. You can use this in your server components to know the current path:"
      },
      {
        "level": 2,
        "text": "Server Utilities",
        "anchor": "server-utilities",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "createBanataAuthServer(options)",
        "anchor": "createbanataauthserveroptions",
        "snippet": "A factory that returns server-side auth utilities:"
      },
      {
        "level": 3,
        "text": "isAuthenticated()",
        "anchor": "isauthenticated",
        "snippet": "Check if the current request has a valid session. Use in server components and server actions:"
      },
      {
        "level": 3,
        "text": "getToken()",
        "anchor": "gettoken",
        "snippet": "Get a Convex-compatible JWT token for making authenticated queries:"
      },
      {
        "level": 3,
        "text": "preloadAuthQuery(query, args)",
        "anchor": "preloadauthqueryquery-args",
        "snippet": "Preload an authenticated Convex query in a server component, then consume it client-side without waterfalls:"
      },
      {
        "level": 3,
        "text": "fetchAuthQuery(query, args) / fetchAuthMutation(mutation, args) / fetchAuthAction(action, args)",
        "anchor": "fetchauthqueryquery-args-fetchauthmutationmutation-args-fetchauthactionaction-args",
        "snippet": "Execute authenticated Convex operations from server components and server actions:"
      },
      {
        "level": 2,
        "text": "Client Hook",
        "anchor": "client-hook",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "usePreloadedAuthQuery(preloadedQuery)",
        "anchor": "usepreloadedauthquerypreloadedquery",
        "snippet": "Consume a preloaded auth query on the client side:"
      },
      {
        "level": 2,
        "text": "Two Route Handler Approaches",
        "anchor": "two-route-handler-approaches",
        "snippet": "There are two ways to set up the auth route handler:"
      },
      {
        "level": 3,
        "text": "Approach 1: createRouteHandler (from @banata-auth/nextjs)",
        "anchor": "approach-1-createroutehandler-from-banata-authnextjs",
        "snippet": "Simple proxy — just forwards requests:"
      },
      {
        "level": 3,
        "text": "Approach 2: convexBetterAuthNextJs (from @convex-dev/better-auth)",
        "anchor": "approach-2-convexbetterauthnextjs-from-convex-devbetter-auth",
        "snippet": "Full-featured — provides the handler plus server utilities:"
      },
      {
        "level": 2,
        "text": "Complete Setup Example",
        "anchor": "complete-setup-example",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Convex — Backend configuration and plugin system React — Client-side hooks and components Environment Variables — All configuration options"
      }
    ],
    "searchText": "next.js complete reference for @banata-auth/nextjs — reverse proxy route handler, middleware, server auth utilities, and preloaded queries. entry points --- route handler (reverse proxy) the route handler acts as a reverse proxy — it forwards auth requests from your next.js app to the convex .site url where better auth is running. this keeps session cookies on your domain. createroutehandler(options?) how the proxy works browser sends request to /api/auth/sign-in/email route handler receives the request forwards to {convex_site_url}/api/auth/sign-in/email preserves all headers and body middleware (route protection) the middleware checks for the better auth session cookie on incoming requests and redirects unauthenticated users. banataauthproxy(options) / banataauthmiddleware(options) these are aliases for the same function: route matching routes are matched using regex with ^...$ anchoring. this means: how middleware works request comes in check if the route matches any publicroutes → allow through check for better auth session cookie (via getsessioncookie()) cookie found → set x-pathname header and allow through the x-pathname header the middleware sets an x-pathname header on authenticated requests. you can use this in your server components to know the current path: server utilities createbanataauthserver(options) a factory that returns server-side auth utilities: isauthenticated() check if the current request has a valid session. use in server components and server actions: gettoken() get a convex-compatible jwt token for making authenticated queries: preloadauthquery(query, args) preload an authenticated convex query in a server component, then consume it client-side without waterfalls: fetchauthquery(query, args) / fetchauthmutation(mutation, args) / fetchauthaction(action, args) execute authenticated convex operations from server components and server actions: client hook usepreloadedauthquery(preloadedquery) consume a preloaded auth query on the client side: two route handler approaches there are two ways to set up the auth route handler: approach 1: createroutehandler (from @banata-auth/nextjs) simple proxy — just forwards requests: approach 2: convexbetterauthnextjs (from @convex-dev/better-auth) full-featured — provides the handler plus server utilities: complete setup example what's next convex — backend configuration and plugin system react — client-side hooks and components environment variables — all configuration options"
  },
  {
    "slug": "react",
    "title": "React",
    "description": "Complete reference for @banata-auth/react — provider, hooks, pre-built components, and Convex integration.",
    "section": "Packages",
    "headings": [
      {
        "level": 2,
        "text": "Entry Points",
        "anchor": "entry-points",
        "snippet": "The package has 3 entry points:"
      },
      {
        "level": 2,
        "text": "BanataAuthProvider",
        "anchor": "banataauthprovider",
        "snippet": "The provider supplies auth context to your entire component tree. It supports two modes."
      },
      {
        "level": 3,
        "text": "Adapter Mode",
        "anchor": "adapter-mode",
        "snippet": "Provide callback functions that the provider calls to fetch auth state:"
      },
      {
        "level": 3,
        "text": "Controlled Mode",
        "anchor": "controlled-mode",
        "snippet": "Pass auth state as props directly (useful when you manage state externally):"
      },
      {
        "level": 3,
        "text": "BanataAuthAdapter Interface",
        "anchor": "banataauthadapter-interface",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Hooks",
        "anchor": "hooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "useBanataAuth()",
        "anchor": "usebanataauth",
        "snippet": "Returns the full auth context:"
      },
      {
        "level": 3,
        "text": "useUser()",
        "anchor": "useuser",
        "snippet": "Returns only the user:"
      },
      {
        "level": 3,
        "text": "useSession()",
        "anchor": "usesession",
        "snippet": "Returns only the session:"
      },
      {
        "level": 3,
        "text": "useOrganization()",
        "anchor": "useorganization",
        "snippet": "Returns the active organization:"
      },
      {
        "level": 2,
        "text": "UI Components",
        "anchor": "ui-components",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "AuthBoundary",
        "anchor": "authboundary",
        "snippet": "Renders children only when the user is authenticated. Shows a fallback during loading and when unauthenticated:"
      },
      {
        "level": 3,
        "text": "AuthCard",
        "anchor": "authcard",
        "snippet": "A styled card wrapper for auth forms:"
      },
      {
        "level": 3,
        "text": "SignInForm",
        "anchor": "signinform",
        "snippet": "Pre-built sign-in form with email/password inputs:"
      },
      {
        "level": 3,
        "text": "SignUpForm",
        "anchor": "signupform",
        "snippet": "Pre-built sign-up form with name, email, and password inputs:"
      },
      {
        "level": 3,
        "text": "SocialButtons",
        "anchor": "socialbuttons",
        "snippet": "Renders OAuth sign-in buttons for configured social providers:"
      },
      {
        "level": 2,
        "text": "AuthClientLike Interface",
        "anchor": "authclientlike-interface",
        "snippet": "The components accept any object matching the AuthClientLike interface, which is a loose typing against Better Auth's client:"
      },
      {
        "level": 2,
        "text": "Convex Integration",
        "anchor": "convex-integration",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "BanataConvexProvider",
        "anchor": "banataconvexprovider",
        "snippet": "The Convex provider wraps ConvexBetterAuthProvider to handle JWT token exchange between your auth system and Convex:"
      },
      {
        "level": 2,
        "text": "Plugin Re-exports",
        "anchor": "plugin-re-exports",
        "snippet": "Import client-side plugins from @banata-auth/react/plugins:"
      },
      {
        "level": 2,
        "text": "Type Reference",
        "anchor": "type-reference",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "User",
        "anchor": "user",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Session",
        "anchor": "session",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization",
        "anchor": "organization",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Next.js — Server-side utilities and middleware SDK Reference — Server-side admin SDK Convex — Backend configuration"
      }
    ],
    "searchText": "react complete reference for @banata-auth/react — provider, hooks, pre-built components, and convex integration. entry points the package has 3 entry points: banataauthprovider the provider supplies auth context to your entire component tree. it supports two modes. adapter mode provide callback functions that the provider calls to fetch auth state: controlled mode pass auth state as props directly (useful when you manage state externally): banataauthadapter interface hooks usebanataauth() returns the full auth context: useuser() returns only the user: usesession() returns only the session: useorganization() returns the active organization: ui components authboundary renders children only when the user is authenticated. shows a fallback during loading and when unauthenticated: authcard a styled card wrapper for auth forms: signinform pre-built sign-in form with email/password inputs: signupform pre-built sign-up form with name, email, and password inputs: socialbuttons renders oauth sign-in buttons for configured social providers: authclientlike interface the components accept any object matching the authclientlike interface, which is a loose typing against better auth's client: convex integration banataconvexprovider the convex provider wraps convexbetterauthprovider to handle jwt token exchange between your auth system and convex: plugin re-exports import client-side plugins from @banata-auth/react/plugins: type reference user session organization what's next next.js — server-side utilities and middleware sdk reference — server-side admin sdk convex — backend configuration"
  },
  {
    "slug": "sdk",
    "title": "SDK Reference",
    "description": "Complete API reference for @banata-auth/sdk -- the TypeScript admin SDK with 14 resource classes for server-side auth management.",
    "section": "Packages",
    "headings": [
      {
        "level": 2,
        "text": "Initialization",
        "anchor": "initialization",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "BanataAuthOptions",
        "anchor": "banataauthoptions",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "HTTP Client Behavior",
        "anchor": "http-client-behavior",
        "snippet": "All SDK methods use POST requests (Convex HTTP actions accept POST bodies). The internal HttpClient provides:"
      },
      {
        "level": 3,
        "text": "Error Handling",
        "anchor": "error-handling",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Pagination",
        "anchor": "pagination",
        "snippet": "All list methods return paginated results:"
      },
      {
        "level": 2,
        "text": "Resource Classes",
        "anchor": "resource-classes",
        "snippet": "The SDK exposes 12 resource classes via the BanataAuth instance:"
      },
      {
        "level": 2,
        "text": "UserManagement",
        "anchor": "usermanagement",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "listUsers(options?)",
        "anchor": "listusersoptions",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "getUser(userId)",
        "anchor": "getuseruserid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "createUser(data)",
        "anchor": "createuserdata",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "updateUser({ userId, ...data })",
        "anchor": "updateuser-userid-data",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "deleteUser(userId)",
        "anchor": "deleteuseruserid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "banUser({ userId, ... }) / unbanUser(userId)",
        "anchor": "banuser-userid-unbanuseruserid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "listUserSessions(userId)",
        "anchor": "listusersessionsuserid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "revokeSession(sessionId) / revokeAllSessions(userId)",
        "anchor": "revokesessionsessionid-revokeallsessionsuserid",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "setRole(userId, role)",
        "anchor": "setroleuserid-role",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "impersonateUser(userId) / stopImpersonating()",
        "anchor": "impersonateuseruserid-stopimpersonating",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "setUserPassword(userId, newPassword)",
        "anchor": "setuserpassworduserid-newpassword",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "hasPermission(...)",
        "anchor": "haspermission",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Organizations",
        "anchor": "organizations",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "CRUD",
        "anchor": "crud",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Members",
        "anchor": "members",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Invitations",
        "anchor": "invitations",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "SSO",
        "anchor": "sso",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "DirectorySync",
        "anchor": "directorysync",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "AuditLogs",
        "anchor": "auditlogs",
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
        "text": "Rbac",
        "anchor": "rbac",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Events",
        "anchor": "events",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Portal",
        "anchor": "portal",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Vault",
        "anchor": "vault",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Domains",
        "anchor": "domains",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "React -- Client-side hooks and components Next.js -- Server utilities and middleware Convex -- Backend configuration reference"
      }
    ],
    "searchText": "sdk reference complete api reference for @banata-auth/sdk -- the typescript admin sdk with 14 resource classes for server-side auth management. initialization banataauthoptions --- http client behavior all sdk methods use post requests (convex http actions accept post bodies). the internal httpclient provides: error handling pagination all list methods return paginated results: resource classes the sdk exposes 12 resource classes via the banataauth instance: usermanagement listusers(options?) getuser(userid) createuser(data) updateuser({ userid, ...data }) deleteuser(userid) banuser({ userid, ... }) / unbanuser(userid) listusersessions(userid) revokesession(sessionid) / revokeallsessions(userid) setrole(userid, role) impersonateuser(userid) / stopimpersonating() setuserpassword(userid, newpassword) haspermission(...) organizations crud members invitations sso directorysync auditlogs webhooks rbac events portal vault domains what's next react -- client-side hooks and components next.js -- server utilities and middleware convex -- backend configuration reference"
  },
  {
    "slug": "shared",
    "title": "@banata-auth/shared",
    "description": "Shared types, constants, validation utilities, and email block definitions used across all Banata Auth packages.",
    "section": "Packages",
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
        "snippet": "The shared package exports 6 modules:"
      },
      {
        "level": 2,
        "text": "TypeScript Interfaces",
        "anchor": "typescript-interfaces",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Core Resources",
        "anchor": "core-resources",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Organization Resources",
        "anchor": "organization-resources",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "SSO Resources",
        "anchor": "sso-resources",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Directory Sync Resources",
        "anchor": "directory-sync-resources",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Other Resources",
        "anchor": "other-resources",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Constants",
        "anchor": "constants",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "ID_PREFIXES",
        "anchor": "idprefixes",
        "snippet": "Every Banata Auth resource uses a prefixed ULID for its identifier. The prefix makes IDs self-documenting and debuggable:"
      },
      {
        "level": 3,
        "text": "Rate Limits",
        "anchor": "rate-limits",
        "snippet": "Default rate limits per endpoint category (requests per minute):"
      },
      {
        "level": 3,
        "text": "Token Lifetimes",
        "anchor": "token-lifetimes",
        "snippet": "Default token and session lifetimes in seconds:"
      },
      {
        "level": 3,
        "text": "Size Limits",
        "anchor": "size-limits",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Webhook Constants",
        "anchor": "webhook-constants",
        "snippet": ""
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
        "snippet": "Check if an ID has the correct prefix for a given resource type:"
      },
      {
        "level": 3,
        "text": "generateRandomToken",
        "anchor": "generaterandomtoken",
        "snippet": "Generate a URL-safe base64 random token:"
      },
      {
        "level": 3,
        "text": "generateOtp",
        "anchor": "generateotp",
        "snippet": "Generate a random numeric OTP:"
      },
      {
        "level": 2,
        "text": "Validation Schemas",
        "anchor": "validation-schemas",
        "snippet": "All validation schemas are built with Zod and are used throughout the backend for input validation. They can also be used in client applications for form validation."
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
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Input Types",
        "anchor": "input-types",
        "snippet": "Each schema exports a corresponding TypeScript type:"
      },
      {
        "level": 2,
        "text": "Error Classes",
        "anchor": "error-classes",
        "snippet": "All Banata Auth errors extend BanataAuthError, which provides structured error information with HTTP status codes, error codes, and request IDs."
      },
      {
        "level": 3,
        "text": "BanataAuthError (Base)",
        "anchor": "banataautherror-base",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Specialized Error Classes",
        "anchor": "specialized-error-classes",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Usage",
        "anchor": "usage",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "FieldError",
        "anchor": "fielderror",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Email Block System",
        "anchor": "email-block-system",
        "snippet": "The shared package defines the complete email block type system used by the template editor, SDK, and backend renderer. See the Email Templates documentation for full details."
      },
      {
        "level": 3,
        "text": "Key Exports",
        "anchor": "key-exports",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Factory Helpers",
        "anchor": "factory-helpers",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Variable Interpolation",
        "anchor": "variable-interpolation",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Built-in Template Blocks",
        "anchor": "built-in-template-blocks",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Pagination Types",
        "anchor": "pagination-types",
        "snippet": "All list endpoints use a cursor-based pagination model:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "SDK Reference — The TypeScript SDK that consumes these shared types Email Templates — Full documentation on the block-based email system Vault & Encryption — Encryption layer using shared VaultSecret "
      }
    ],
    "searchText": "@banata-auth/shared shared types, constants, validation utilities, and email block definitions used across all banata auth packages. installation package structure the shared package exports 6 modules: typescript interfaces core resources organization resources sso resources directory sync resources other resources constants id_prefixes every banata auth resource uses a prefixed ulid for its identifier. the prefix makes ids self-documenting and debuggable: rate limits default rate limits per endpoint category (requests per minute): token lifetimes default token and session lifetimes in seconds: size limits webhook constants id generation generateid generate a prefixed ulid for any resource type: ulid generate a raw ulid without a prefix: getresourcetype extract the resource type from a prefixed id: validateid check if an id has the correct prefix for a given resource type: generaterandomtoken generate a url-safe base64 random token: generateotp generate a random numeric otp: validation schemas all validation schemas are built with zod and are used throughout the backend for input validation. they can also be used in client applications for form validation. primitive schemas resource schemas input types each schema exports a corresponding typescript type: error classes all banata auth errors extend banataautherror, which provides structured error information with http status codes, error codes, and request ids. banataautherror (base) specialized error classes usage fielderror email block system the shared package defines the complete email block type system used by the template editor, sdk, and backend renderer. see the email templates documentation for full details. key exports factory helpers variable interpolation built-in template blocks pagination types all list endpoints use a cursor-based pagination model: what's next sdk reference — the typescript sdk that consumes these shared types email templates — full documentation on the block-based email system vault & encryption — encryption layer using shared vaultsecret "
  },
  {
    "slug": "account",
    "title": "Account Management",
    "description": "Manage your admin profile, security settings, connected accounts, and active sessions from the Banata Auth dashboard.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "Account Sub-Pages",
        "anchor": "account-sub-pages",
        "snippet": "Navigating to /account automatically redirects to /account/profile."
      },
      {
        "level": 2,
        "text": "Profile",
        "anchor": "profile",
        "snippet": "The Profile page manages your personal information and connected accounts."
      },
      {
        "level": 3,
        "text": "Personal Information",
        "anchor": "personal-information",
        "snippet": "Display name â€” Editable text field (click \"Edit\" to enter edit mode) Avatar â€” Upload an image (max 2MB, stored as a Data URL). Click the upload button on the avatar to change it, or \"Remove\" to cl"
      },
      {
        "level": 3,
        "text": "Email Address",
        "anchor": "email-address",
        "snippet": "Change your email by clicking \"Change email\", entering a new address, and clicking \"Send verification\". Better Auth sends a verification email to the new address. Your email does not change until you "
      },
      {
        "level": 3,
        "text": "Connected Accounts",
        "anchor": "connected-accounts",
        "snippet": "Lists all sign-in methods linked to your account:"
      },
      {
        "level": 3,
        "text": "Delete Account",
        "anchor": "delete-account",
        "snippet": "Permanently deletes your account and all associated data. Requires typing DELETE to confirm. Triggers authClient.deleteUser() which sends a confirmation email before deletion."
      },
      {
        "level": 2,
        "text": "Security",
        "anchor": "security",
        "snippet": "The Security page manages authentication credentials and active sessions."
      },
      {
        "level": 3,
        "text": "Password",
        "anchor": "password",
        "snippet": "Change your password by providing your current password and a new one (minimum 8 characters). The confirmation field validates that both entries match before enabling the submit button."
      },
      {
        "level": 3,
        "text": "Two-Factor Authentication (TOTP)",
        "anchor": "two-factor-authentication-totp",
        "snippet": "TOTP-based two-factor authentication adds an extra layer of security. The setup flow has multiple steps:"
      },
      {
        "level": 3,
        "text": "Active Sessions",
        "anchor": "active-sessions",
        "snippet": "Lists all devices where you are currently signed in, showing:"
      },
      {
        "level": 2,
        "text": "Auth Client Methods",
        "anchor": "auth-client-methods",
        "snippet": "The account pages use the Better Auth client directly. All methods follow the { data, error } response convention."
      },
      {
        "level": 2,
        "text": "Client Plugins",
        "anchor": "client-plugins",
        "snippet": "The dashboard auth client includes the twoFactorClient() plugin for 2FA methods. If you are building a custom UI, import it from the react package:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Settings â€” Configure project name and team Authentication â€” Set up authentication methods Radar & Bot Protection â€” Configure bot detection for your auth endpoints"
      }
    ],
    "searchText": "account management manage your admin profile, security settings, connected accounts, and active sessions from the banata auth dashboard. account sub-pages navigating to /account automatically redirects to /account/profile. profile the profile page manages your personal information and connected accounts. personal information display name â€” editable text field (click \"edit\" to enter edit mode) avatar â€” upload an image (max 2mb, stored as a data url). click the upload button on the avatar to change it, or \"remove\" to cl email address change your email by clicking \"change email\", entering a new address, and clicking \"send verification\". better auth sends a verification email to the new address. your email does not change until you  connected accounts lists all sign-in methods linked to your account: delete account permanently deletes your account and all associated data. requires typing delete to confirm. triggers authclient.deleteuser() which sends a confirmation email before deletion. security the security page manages authentication credentials and active sessions. password change your password by providing your current password and a new one (minimum 8 characters). the confirmation field validates that both entries match before enabling the submit button. two-factor authentication (totp) totp-based two-factor authentication adds an extra layer of security. the setup flow has multiple steps: active sessions lists all devices where you are currently signed in, showing: auth client methods the account pages use the better auth client directly. all methods follow the { data, error } response convention. client plugins the dashboard auth client includes the twofactorclient() plugin for 2fa methods. if you are building a custom ui, import it from the react package: what's next settings â€” configure project name and team authentication â€” set up authentication methods radar & bot protection â€” configure bot detection for your auth endpoints"
  },
  {
    "slug": "addons",
    "title": "Add-ons",
    "description": "Extend authentication with third-party integrations — Google Analytics, Segment, Stripe, and PostHog.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "Available Add-ons",
        "anchor": "available-add-ons",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "How Add-ons Work",
        "anchor": "how-add-ons-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Add-on Configuration Data Model",
        "anchor": "add-on-configuration-data-model",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Managing Add-ons via the Dashboard",
        "anchor": "managing-add-ons-via-the-dashboard",
        "snippet": "Navigate to Authentication > Add-ons in the dashboard sidebar Each add-on is displayed as a card with its icon, title, description, and current state A badge shows \"Enabled\" or \"Disabled\""
      },
      {
        "level": 3,
        "text": "Add-on Cards",
        "anchor": "add-on-cards",
        "snippet": "Each card displays: Icon — Color-coded icon for the service (amber for Google Analytics, green for Segment, violet for Stripe, blue for PostHog) Title — The service name"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 2 add-on endpoints:"
      },
      {
        "level": 3,
        "text": "Get Add-on Configuration",
        "anchor": "get-add-on-configuration",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save Add-on Configuration",
        "anchor": "save-add-on-configuration",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Add-on configuration is stored as a singleton row in the addonConfig table:"
      },
      {
        "level": 2,
        "text": "Using Add-ons Programmatically",
        "anchor": "using-add-ons-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": ""
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
        "snippet": "Enable the Google Analytics add-on in the dashboard Configure your Google Analytics measurement ID in your application Auth events (sign-up, sign-in) will be attributed to traffic sources"
      },
      {
        "level": 3,
        "text": "Segment",
        "anchor": "segment",
        "snippet": "Enable the Segment add-on in the dashboard Configure your Segment write key in your application Auth events are sent to Segment as track calls Use Segment destinations to forward events to your data w"
      },
      {
        "level": 3,
        "text": "Stripe",
        "anchor": "stripe",
        "snippet": "Enable the Stripe add-on in the dashboard Configure your Stripe API keys in your application User creation events trigger Stripe customer creation Seat counts are automatically synced when members are"
      },
      {
        "level": 3,
        "text": "PostHog",
        "anchor": "posthog",
        "snippet": "Enable the PostHog add-on in the dashboard Configure your PostHog API key and host in your application Auth events are sent to PostHog as custom events Use PostHog feature flags to gate features based"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Admin-only access — Only admin users can enable or disable add-ons. API key management — Third-party service API keys should be stored in environment variables, not in the add-on configuration. The ad"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Add-on enabled but no data appearing in the service\"",
        "anchor": "add-on-enabled-but-no-data-appearing-in-the-service",
        "snippet": "Check that your third-party service API keys are correctly configured in your environment variables Verify the add-on is enabled in the dashboard (check the badge)"
      },
      {
        "level": 3,
        "text": "\"Failed to update addon configuration\"",
        "anchor": "failed-to-update-addon-configuration",
        "snippet": "The backend save failed. Check that the Convex backend is running and that your user has admin privileges."
      },
      {
        "level": 3,
        "text": "\"Add-on states reset\"",
        "anchor": "add-on-states-reset",
        "snippet": "Add-on configuration is stored in a singleton database row. If the row was deleted (e.g., during a database reset), add-on states will revert to their defaults (all disabled)."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Radar & Bot Protection — AI-powered bot detection and fraud prevention Webhooks — Get notified about auth events Audit Logs — Track all auth activity"
      }
    ],
    "searchText": "add-ons extend authentication with third-party integrations — google analytics, segment, stripe, and posthog. available add-ons --- how add-ons work add-on configuration data model managing add-ons via the dashboard navigate to authentication > add-ons in the dashboard sidebar each add-on is displayed as a card with its icon, title, description, and current state a badge shows \"enabled\" or \"disabled\" add-on cards each card displays: icon — color-coded icon for the service (amber for google analytics, green for segment, violet for stripe, blue for posthog) title — the service name api endpoints the configplugin exposes 2 add-on endpoints: get add-on configuration save add-on configuration database storage add-on configuration is stored as a singleton row in the addonconfig table: using add-ons programmatically via the dashboard api client setting up each add-on google analytics enable the google analytics add-on in the dashboard configure your google analytics measurement id in your application auth events (sign-up, sign-in) will be attributed to traffic sources segment enable the segment add-on in the dashboard configure your segment write key in your application auth events are sent to segment as track calls use segment destinations to forward events to your data w stripe enable the stripe add-on in the dashboard configure your stripe api keys in your application user creation events trigger stripe customer creation seat counts are automatically synced when members are posthog enable the posthog add-on in the dashboard configure your posthog api key and host in your application auth events are sent to posthog as custom events use posthog feature flags to gate features based security considerations admin-only access — only admin users can enable or disable add-ons. api key management — third-party service api keys should be stored in environment variables, not in the add-on configuration. the ad troubleshooting \"add-on enabled but no data appearing in the service\" check that your third-party service api keys are correctly configured in your environment variables verify the add-on is enabled in the dashboard (check the badge) \"failed to update addon configuration\" the backend save failed. check that the convex backend is running and that your user has admin privileges. \"add-on states reset\" add-on configuration is stored in a singleton database row. if the row was deleted (e.g., during a database reset), add-on states will revert to their defaults (all disabled). what's next radar & bot protection — ai-powered bot detection and fraud prevention webhooks — get notified about auth events audit logs — track all auth activity"
  },
  {
    "slug": "api-keys",
    "title": "API Keys",
    "description": "Programmatic access with scoped API keys — create, manage, and authenticate server-to-server requests.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable API keys in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "API Key Config Options",
        "anchor": "api-key-config-options",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "How API Keys Work",
        "anchor": "how-api-keys-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Creating API Keys",
        "anchor": "creating-api-keys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Client SDK (Authenticated User)",
        "anchor": "via-the-client-sdk-authenticated-user",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Admin SDK (Server-Side)",
        "anchor": "via-the-admin-sdk-server-side",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Admin Dashboard",
        "anchor": "via-the-admin-dashboard",
        "snippet": "Navigate to a User's detail page Go to the API Keys tab Click Create API Key Enter a name and select permissions Copy the key and save it securely"
      },
      {
        "level": 2,
        "text": "Using API Keys",
        "anchor": "using-api-keys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Authorization Header",
        "anchor": "authorization-header",
        "snippet": "Include the API key in the Authorization header:"
      },
      {
        "level": 3,
        "text": "In Application Code",
        "anchor": "in-application-code",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "With the Admin SDK",
        "anchor": "with-the-admin-sdk",
        "snippet": "The admin SDK itself uses API keys for authentication:"
      },
      {
        "level": 2,
        "text": "Managing API Keys",
        "anchor": "managing-api-keys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List Keys",
        "anchor": "list-keys",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Revoke a Key",
        "anchor": "revoke-a-key",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Permission Scoping",
        "anchor": "permission-scoping",
        "snippet": "API keys can be scoped to specific permissions, limiting what they can do:"
      },
      {
        "level": 2,
        "text": "Client-Side Plugin",
        "anchor": "client-side-plugin",
        "snippet": "To use API key features from the client, import the apiKeyClient plugin:"
      },
      {
        "level": 2,
        "text": "Key Storage & Security",
        "anchor": "key-storage-security",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "How Keys Are Stored",
        "anchor": "how-keys-are-stored",
        "snippet": "The raw key is never stored — only its hash. This means: If your database is compromised, the keys cannot be recovered Lost keys cannot be retrieved — they must be revoked and replaced"
      },
      {
        "level": 3,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Rotate keys regularly — Create new keys and revoke old ones periodically (e.g., every 90 days). Use separate keys per integration — Don't share a single key across multiple services. If one is comprom"
      },
      {
        "level": 2,
        "text": "API Key Data Model",
        "anchor": "api-key-data-model",
        "snippet": ""
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
        "text": "\"Invalid API Key\"",
        "anchor": "invalid-api-key",
        "snippet": "Check that the key hasn't been revoked Check that the key hasn't expired Verify you're using the complete key string (including the prefix) Make sure the Authorization header format is Bearer {key}"
      },
      {
        "level": 3,
        "text": "\"Insufficient Permissions\"",
        "anchor": "insufficient-permissions",
        "snippet": "The API key doesn't have the required permission for this action. Either: Create a new key with the needed permissions Use an unrestricted key (no permissions specified)"
      },
      {
        "level": 3,
        "text": "\"API Keys Not Enabled\"",
        "anchor": "api-keys-not-enabled",
        "snippet": "Make sure apiKeyConfig.enabled is true in your BanataAuthConfig."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "SDK Reference — Complete API reference for all SDK methods Roles & Permissions — Configure the permissions that API keys use Webhooks — Get notified about API key events"
      }
    ],
    "searchText": "api keys programmatic access with scoped api keys — create, manage, and authenticate server-to-server requests. configuration enable api keys in your banataauthconfig: api key config options --- how api keys work creating api keys via the client sdk (authenticated user) via the admin sdk (server-side) via the admin dashboard navigate to a user's detail page go to the api keys tab click create api key enter a name and select permissions copy the key and save it securely using api keys authorization header include the api key in the authorization header: in application code with the admin sdk the admin sdk itself uses api keys for authentication: managing api keys list keys revoke a key permission scoping api keys can be scoped to specific permissions, limiting what they can do: client-side plugin to use api key features from the client, import the apikeyclient plugin: key storage & security how keys are stored the raw key is never stored — only its hash. this means: if your database is compromised, the keys cannot be recovered lost keys cannot be retrieved — they must be revoked and replaced best practices rotate keys regularly — create new keys and revoke old ones periodically (e.g., every 90 days). use separate keys per integration — don't share a single key across multiple services. if one is comprom api key data model audit events --- troubleshooting \"invalid api key\" check that the key hasn't been revoked check that the key hasn't expired verify you're using the complete key string (including the prefix) make sure the authorization header format is bearer {key} \"insufficient permissions\" the api key doesn't have the required permission for this action. either: create a new key with the needed permissions use an unrestricted key (no permissions specified) \"api keys not enabled\" make sure apikeyconfig.enabled is true in your banataauthconfig. what's next sdk reference — complete api reference for all sdk methods roles & permissions — configure the permissions that api keys use webhooks — get notified about api key events"
  },
  {
    "slug": "audit-logs",
    "title": "Audit Logs",
    "description": "Comprehensive audit logging with 30 auto-tracked events, custom events, actor/target tracking, and export capabilities.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": "The auditLog plugin is one of the 7 always-on plugins — it's enabled by default with no configuration needed. Every auth action automatically generates an audit log entry."
      },
      {
        "level": 3,
        "text": "Audit Event Structure",
        "anchor": "audit-event-structure",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Auto-Tracked Events (30)",
        "anchor": "auto-tracked-events-30",
        "snippet": "The audit log plugin automatically tracks these events:"
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
        "text": "Querying Audit Logs",
        "anchor": "querying-audit-logs",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Admin SDK",
        "anchor": "via-the-admin-sdk",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Pagination",
        "anchor": "pagination",
        "snippet": "Audit logs use cursor-based pagination:"
      },
      {
        "level": 3,
        "text": "Via the Admin Dashboard",
        "anchor": "via-the-admin-dashboard",
        "snippet": "Navigate to Audit Logs in the dashboard sidebar to see a searchable, filterable view of all events."
      },
      {
        "level": 2,
        "text": "Custom Audit Events",
        "anchor": "custom-audit-events",
        "snippet": "In addition to the 30 auto-tracked events, you can log custom events:"
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
        "snippet": "Inside Convex functions, you can use the logAuditEvent helper directly:"
      },
      {
        "level": 2,
        "text": "Exporting Audit Logs",
        "anchor": "exporting-audit-logs",
        "snippet": "Export audit logs for compliance reporting or external analysis:"
      },
      {
        "level": 2,
        "text": "Change Tracking",
        "anchor": "change-tracking",
        "snippet": "For update events, audit logs capture what changed:"
      },
      {
        "level": 2,
        "text": "Audit Log Endpoints (API)",
        "anchor": "audit-log-endpoints-api",
        "snippet": "The auditLog plugin exposes 3 endpoints:"
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Audit events are stored in the auditLog table in Convex:"
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
        "snippet": "SOC 2 requires logging of: User authentication events (sign-in, sign-out) — Covered by session.created and session.revoked Access control changes (role assignments) — Covered by member.role_updated an"
      },
      {
        "level": 3,
        "text": "HIPAA",
        "anchor": "hipaa",
        "snippet": "HIPAA requires: Audit trails for electronic health information access — Use custom events for PHI access Login monitoring — Covered by session.created Access control audits — Covered by RBAC events"
      },
      {
        "level": 3,
        "text": "GDPR",
        "anchor": "gdpr",
        "snippet": "GDPR requires: Records of processing activities — Custom events for data processing Account deletion tracking — Covered by user.deleted Consent changes — Use custom events"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Don't disable audit logging — It's always-on for a reason. Compliance requirements don't have exceptions. Add custom events for business actions — Supplement the 30 auto-tracked events with custom eve"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Webhooks — Get real-time notifications for audit events API Keys — Programmatic access management Deploy — Production deployment with audit log monitoring"
      }
    ],
    "searchText": "audit logs comprehensive audit logging with 30 auto-tracked events, custom events, actor/target tracking, and export capabilities. how it works the auditlog plugin is one of the 7 always-on plugins — it's enabled by default with no configuration needed. every auth action automatically generates an audit log entry. audit event structure auto-tracked events (30) the audit log plugin automatically tracks these events: user events session events email & password events organization events security events --- querying audit logs via the admin sdk pagination audit logs use cursor-based pagination: via the admin dashboard navigate to audit logs in the dashboard sidebar to see a searchable, filterable view of all events. custom audit events in addition to the 30 auto-tracked events, you can log custom events: via the sdk via the logauditevent helper (server-side) inside convex functions, you can use the logauditevent helper directly: exporting audit logs export audit logs for compliance reporting or external analysis: change tracking for update events, audit logs capture what changed: audit log endpoints (api) the auditlog plugin exposes 3 endpoints: database storage audit events are stored in the auditlog table in convex: compliance use cases soc 2 soc 2 requires logging of: user authentication events (sign-in, sign-out) — covered by session.created and session.revoked access control changes (role assignments) — covered by member.role_updated an hipaa hipaa requires: audit trails for electronic health information access — use custom events for phi access login monitoring — covered by session.created access control audits — covered by rbac events gdpr gdpr requires: records of processing activities — custom events for data processing account deletion tracking — covered by user.deleted consent changes — use custom events best practices don't disable audit logging — it's always-on for a reason. compliance requirements don't have exceptions. add custom events for business actions — supplement the 30 auto-tracked events with custom eve what's next webhooks — get real-time notifications for audit events api keys — programmatic access management deploy — production deployment with audit log monitoring"
  },
  {
    "slug": "auth-configuration",
    "title": "Auth Configuration",
    "description": "Configure authorization behavior — role assignment, multiple roles, and API key permissions via the admin dashboard.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Configuration Settings",
        "anchor": "configuration-settings",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Role Assignment in Admin Portal",
        "anchor": "role-assignment-in-admin-portal",
        "snippet": "When enabled, organization administrators can configure role mapping rules based on identity provider (IdP) groups. This is useful for enterprises that manage user roles in their IdP (e.g., Okta, Azur"
      },
      {
        "level": 3,
        "text": "Multiple Roles",
        "anchor": "multiple-roles",
        "snippet": "By default, a user has exactly one role per organization. Enabling multiple roles allows users to hold several roles simultaneously:"
      },
      {
        "level": 3,
        "text": "Organization API Key Permissions",
        "anchor": "organization-api-key-permissions",
        "snippet": "When enabled, you can control which specific permissions are available to organization-scoped API keys. This lets you create narrowly-scoped API keys that can only perform certain actions within an or"
      },
      {
        "level": 2,
        "text": "Auth Configuration Data Model",
        "anchor": "auth-configuration-data-model",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Managing Auth Configuration via the Dashboard",
        "anchor": "managing-auth-configuration-via-the-dashboard",
        "snippet": "Navigate to Authorization > Configuration in the dashboard sidebar Each setting is displayed as a card with a title, description, and toggle switch A badge shows the current state: \"Enabled\" or \"Disab"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 2 auth configuration endpoints:"
      },
      {
        "level": 3,
        "text": "Get Auth Configuration",
        "anchor": "get-auth-configuration",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save Auth Configuration",
        "anchor": "save-auth-configuration",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Auth configuration is stored inside the dashboardConfig singleton row — the same row that stores branding and other dashboard settings. The authConfiguration key holds the configuration object:"
      },
      {
        "level": 2,
        "text": "Using Auth Configuration Programmatically",
        "anchor": "using-auth-configuration-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "How Settings Affect Behavior",
        "anchor": "how-settings-affect-behavior",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Multiple Roles Disabled (Default)",
        "anchor": "multiple-roles-disabled-default",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Multiple Roles Enabled",
        "anchor": "multiple-roles-enabled",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Principle of least privilege — Only enable settings that your application needs. Multiple roles and API key permissions expand the authorization surface."
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Configuration not persisting\"",
        "anchor": "configuration-not-persisting",
        "snippet": "Auth configuration is stored in the dashboardConfig singleton. If changes aren't persisting, check that the Convex backend is running and that your user has admin privileges."
      },
      {
        "level": 3,
        "text": "\"Multiple roles not working\"",
        "anchor": "multiple-roles-not-working",
        "snippet": "Ensure the multipleRoles setting is enabled. When disabled, assigning a new role replaces the existing one."
      },
      {
        "level": 3,
        "text": "\"Toggle reverted unexpectedly\"",
        "anchor": "toggle-reverted-unexpectedly",
        "snippet": "The dashboard uses optimistic updates — if the backend save fails, the toggle reverts. Check the browser console for error details and ensure the Convex backend is reachable."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Roles & Permissions — Define roles and check permissions Resource Types — Define what can be protected API Keys — Programmatic access with scoped permissions"
      }
    ],
    "searchText": "auth configuration configure authorization behavior — role assignment, multiple roles, and api key permissions via the admin dashboard. configuration settings role assignment in admin portal when enabled, organization administrators can configure role mapping rules based on identity provider (idp) groups. this is useful for enterprises that manage user roles in their idp (e.g., okta, azur multiple roles by default, a user has exactly one role per organization. enabling multiple roles allows users to hold several roles simultaneously: organization api key permissions when enabled, you can control which specific permissions are available to organization-scoped api keys. this lets you create narrowly-scoped api keys that can only perform certain actions within an or auth configuration data model managing auth configuration via the dashboard navigate to authorization > configuration in the dashboard sidebar each setting is displayed as a card with a title, description, and toggle switch a badge shows the current state: \"enabled\" or \"disab api endpoints the configplugin exposes 2 auth configuration endpoints: get auth configuration save auth configuration database storage auth configuration is stored inside the dashboardconfig singleton row — the same row that stores branding and other dashboard settings. the authconfiguration key holds the configuration object: using auth configuration programmatically via the dashboard api client how settings affect behavior multiple roles disabled (default) multiple roles enabled security considerations principle of least privilege — only enable settings that your application needs. multiple roles and api key permissions expand the authorization surface. troubleshooting \"configuration not persisting\" auth configuration is stored in the dashboardconfig singleton. if changes aren't persisting, check that the convex backend is running and that your user has admin privileges. \"multiple roles not working\" ensure the multipleroles setting is enabled. when disabled, assigning a new role replaces the existing one. \"toggle reverted unexpectedly\" the dashboard uses optimistic updates — if the backend save fails, the toggle reverts. check the browser console for error details and ensure the convex backend is reachable. what's next roles & permissions — define roles and check permissions resource types — define what can be protected api keys — programmatic access with scoped permissions"
  },
  {
    "slug": "bot-protection",
    "title": "Bot Protection SDK (Next.js)",
    "description": "Integrate bot detection providers (Vercel BotID, Cloudflare Turnstile, reCAPTCHA, hCaptcha) into your Next.js app using the @banata-auth/nextjs/bot-protection package.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "Installation",
        "anchor": "installation",
        "snippet": "The bot protection utilities ship with @banata-auth/nextjs — no additional installation needed:"
      },
      {
        "level": 2,
        "text": "Quick Start",
        "anchor": "quick-start",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Option 1: Direct Provider (Vercel BotID)",
        "anchor": "option-1-direct-provider-vercel-botid",
        "snippet": "Use this when you have botid installed and want to wire it up directly:"
      },
      {
        "level": 3,
        "text": "Option 2: Config-Aware (Dashboard-Managed Credentials)",
        "anchor": "option-2-config-aware-dashboard-managed-credentials",
        "snippet": "Use this when you want admins to configure bot protection through the Radar dashboard page:"
      },
      {
        "level": 2,
        "text": "Configuring Bot Protection in the Dashboard",
        "anchor": "configuring-bot-protection-in-the-dashboard",
        "snippet": "Navigate to Radar in the dashboard sidebar Click Enable protection Go to the Configuration tab Toggle Bot detection on Under Bot Detection Provider, select your provider:"
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
        "snippet": "Wraps a Next.js route handler with bot protection. Only requests matching protected paths are verified."
      },
      {
        "level": 3,
        "text": "createBotIdVerifier(checkBotIdFn)",
        "anchor": "createbotidverifiercheckbotidfn",
        "snippet": "Factory for creating a Vercel BotID verifier:"
      },
      {
        "level": 3,
        "text": "createConfigAwareVerifier(options)",
        "anchor": "createconfigawareverifieroptions",
        "snippet": "Factory for creating a verifier that reads credentials from the Banata Auth config API:"
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
        "snippet": "Fields: API Key How it works: Invisible challenge runs automatically on Vercel deployments. The checkBotId() function verifies the challenge server-side."
      },
      {
        "level": 3,
        "text": "Cloudflare Turnstile",
        "anchor": "cloudflare-turnstile",
        "snippet": "Fields: Site Key, Secret Key How it works: Client sends a Turnstile token in the cf-turnstile-response or x-turnstile-token header. Server verifies against Cloudflare's siteverify API."
      },
      {
        "level": 3,
        "text": "Google reCAPTCHA",
        "anchor": "google-recaptcha",
        "snippet": "Fields: Site Key, Secret Key How it works: Client sends a reCAPTCHA v3 token in the x-recaptcha-token or g-recaptcha-response header. Server verifies and checks the score (threshold: 0.5)."
      },
      {
        "level": 3,
        "text": "hCaptcha",
        "anchor": "hcaptcha",
        "snippet": "Fields: Site Key, Secret Key How it works: Client sends an hCaptcha token in the x-hcaptcha-token or h-captcha-response header. Server verifies against hCaptcha's siteverify API."
      },
      {
        "level": 2,
        "text": "Server-Side Plugin",
        "anchor": "server-side-plugin",
        "snippet": "For server-side protection at the Better Auth plugin level (before the route handler), use the banataProtection plugin:"
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
        "snippet": "Fail-open by default — If the bot detection service is unavailable, requests are allowed through. This prevents legitimate users from being locked out. Set failOpen: false for stricter enforcement."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Radar & Bot Protection — Configure detection rules and provider credentials in the dashboard Settings — Project-level configuration Domains — Configure custom domains for auth services"
      }
    ],
    "searchText": "bot protection sdk (next.js) integrate bot detection providers (vercel botid, cloudflare turnstile, recaptcha, hcaptcha) into your next.js app using the @banata-auth/nextjs/bot-protection package. installation the bot protection utilities ship with @banata-auth/nextjs — no additional installation needed: quick start option 1: direct provider (vercel botid) use this when you have botid installed and want to wire it up directly: option 2: config-aware (dashboard-managed credentials) use this when you want admins to configure bot protection through the radar dashboard page: configuring bot protection in the dashboard navigate to radar in the dashboard sidebar click enable protection go to the configuration tab toggle bot detection on under bot detection provider, select your provider: api reference withbotprotection(handler, config) wraps a next.js route handler with bot protection. only requests matching protected paths are verified. createbotidverifier(checkbotidfn) factory for creating a vercel botid verifier: createconfigawareverifier(options) factory for creating a verifier that reads credentials from the banata auth config api: supported providers vercel botid fields: api key how it works: invisible challenge runs automatically on vercel deployments. the checkbotid() function verifies the challenge server-side. cloudflare turnstile fields: site key, secret key how it works: client sends a turnstile token in the cf-turnstile-response or x-turnstile-token header. server verifies against cloudflare's siteverify api. google recaptcha fields: site key, secret key how it works: client sends a recaptcha v3 token in the x-recaptcha-token or g-recaptcha-response header. server verifies and checks the score (threshold: 0.5). hcaptcha fields: site key, secret key how it works: client sends an hcaptcha token in the x-hcaptcha-token or h-captcha-response header. server verifies against hcaptcha's siteverify api. server-side plugin for server-side protection at the better auth plugin level (before the route handler), use the banataprotection plugin: architecture security considerations fail-open by default — if the bot detection service is unavailable, requests are allowed through. this prevents legitimate users from being locked out. set failopen: false for stricter enforcement. what's next radar & bot protection — configure detection rules and provider credentials in the dashboard settings — project-level configuration domains — configure custom domains for auth services"
  },
  {
    "slug": "deploy",
    "title": "Deploy",
    "description": "Production deployment guide — security hardening, monitoring, scaling, and a pre-launch checklist for Banata Auth.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "Deployment Architecture",
        "anchor": "deployment-architecture",
        "snippet": "In production, Banata Auth has two main components:"
      },
      {
        "level": 2,
        "text": "Step 1: Convex Production Deployment",
        "anchor": "step-1-convex-production-deployment",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Create a Production Deployment",
        "anchor": "create-a-production-deployment",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Set Production Environment Variables",
        "anchor": "set-production-environment-variables",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 2: Next.js Production Deployment",
        "anchor": "step-2-nextjs-production-deployment",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Vercel (Recommended)",
        "anchor": "vercel-recommended",
        "snippet": "Connect your repo to Vercel Set environment variables in the Vercel dashboard:"
      },
      {
        "level": 3,
        "text": "Cloudflare Pages",
        "anchor": "cloudflare-pages",
        "snippet": "Set up a Cloudflare Pages project Configure the same environment variables Build command: next build Output directory: .next"
      },
      {
        "level": 3,
        "text": "Self-Hosted",
        "anchor": "self-hosted",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Step 3: Update OAuth Callback URLs",
        "anchor": "step-3-update-oauth-callback-urls",
        "snippet": "Update every OAuth provider's callback URLs to your production domain:"
      },
      {
        "level": 2,
        "text": "Security Hardening",
        "anchor": "security-hardening",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Session Security",
        "anchor": "session-security",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Auth Secret",
        "anchor": "auth-secret",
        "snippet": "Generate with openssl rand -base64 32 (minimum 32 bytes) Never share between environments Never commit to source control Rotate periodically (note: this invalidates all existing sessions)"
      },
      {
        "level": 3,
        "text": "HTTPS",
        "anchor": "https",
        "snippet": "Production requires HTTPS. The Secure cookie flag is set automatically in production, meaning: Session cookies are only sent over HTTPS HTTP connections cannot authenticate"
      },
      {
        "level": 3,
        "text": "Rate Limiting",
        "anchor": "rate-limiting",
        "snippet": "Built-in rate limits protect against brute force attacks:"
      },
      {
        "level": 3,
        "text": "Trusted Origins",
        "anchor": "trusted-origins",
        "snippet": "Limit which origins can make authenticated requests:"
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
        "snippet": "The Convex Dashboard provides:"
      },
      {
        "level": 3,
        "text": "Audit Logs",
        "anchor": "audit-logs",
        "snippet": "Banata Auth automatically logs 30 auth events. Use these for security monitoring:"
      },
      {
        "level": 3,
        "text": "Webhook Delivery",
        "anchor": "webhook-delivery",
        "snippet": "Monitor webhook delivery via the admin dashboard or SDK:"
      },
      {
        "level": 3,
        "text": "External Monitoring",
        "anchor": "external-monitoring",
        "snippet": "Set up webhooks to send events to your monitoring system:"
      },
      {
        "level": 2,
        "text": "Scaling",
        "anchor": "scaling",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Convex (Backend)",
        "anchor": "convex-backend",
        "snippet": "Convex handles scaling automatically: Serverless functions — Scale to zero, scale to thousands Database — Automatically sharded and replicated No cold starts — Functions are always warm"
      },
      {
        "level": 3,
        "text": "Next.js (Frontend)",
        "anchor": "nextjs-frontend",
        "snippet": "For the Next.js app: Vercel — Automatic global edge deployment Self-hosted — Use a load balancer with multiple instances Session cookies are stateless on the Next.js side (stored in Convex), so any in"
      },
      {
        "level": 2,
        "text": "Backup & Recovery",
        "anchor": "backup-recovery",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Data Backup",
        "anchor": "data-backup",
        "snippet": "Convex provides automatic backups and point-in-time recovery. For additional protection:"
      },
      {
        "level": 3,
        "text": "Secret Rotation",
        "anchor": "secret-rotation",
        "snippet": "To rotate the BETTER_AUTH_SECRET:"
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
        "snippet": "[ ] BETTER_AUTH_SECRET is set to a unique production value [ ] SITE_URL matches your production domain (with https://) [ ] All NEXT_PUBLIC_* variables point to production Convex deployment"
      },
      {
        "level": 3,
        "text": "Security",
        "anchor": "security",
        "snippet": "[ ] HTTPS is enabled (required for secure cookies) [ ] BETTER_AUTH_SECRET is different from development [ ] No development/test credentials in production"
      },
      {
        "level": 3,
        "text": "Auth Methods",
        "anchor": "auth-methods",
        "snippet": "[ ] Email/password sign-up flow works end-to-end [ ] Email verification emails are received [ ] Password reset emails are received [ ] Social OAuth flows complete successfully"
      },
      {
        "level": 3,
        "text": "Monitoring",
        "anchor": "monitoring",
        "snippet": "[ ] Convex dashboard accessible [ ] Audit logs are being recorded [ ] Webhook endpoints are registered and receiving events [ ] Error alerting is configured"
      },
      {
        "level": 3,
        "text": "Compliance",
        "anchor": "compliance",
        "snippet": "[ ] Audit logging is active (always-on by default) [ ] Data retention policy defined [ ] Privacy policy updated to reflect auth data collection [ ] Cookie consent banner added (if required by jurisdic"
      },
      {
        "level": 2,
        "text": "Post-Launch",
        "anchor": "post-launch",
        "snippet": "After launching:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Environment Variables — Complete variable reference Webhooks — Set up event monitoring Audit Logs — Configure compliance logging"
      }
    ],
    "searchText": "deploy production deployment guide — security hardening, monitoring, scaling, and a pre-launch checklist for banata auth. deployment architecture in production, banata auth has two main components: step 1: convex production deployment create a production deployment set production environment variables step 2: next.js production deployment vercel (recommended) connect your repo to vercel set environment variables in the vercel dashboard: cloudflare pages set up a cloudflare pages project configure the same environment variables build command: next build output directory: .next self-hosted step 3: update oauth callback urls update every oauth provider's callback urls to your production domain: security hardening session security auth secret generate with openssl rand -base64 32 (minimum 32 bytes) never share between environments never commit to source control rotate periodically (note: this invalidates all existing sessions) https production requires https. the secure cookie flag is set automatically in production, meaning: session cookies are only sent over https http connections cannot authenticate rate limiting built-in rate limits protect against brute force attacks: trusted origins limit which origins can make authenticated requests: monitoring convex dashboard the convex dashboard provides: audit logs banata auth automatically logs 30 auth events. use these for security monitoring: webhook delivery monitor webhook delivery via the admin dashboard or sdk: external monitoring set up webhooks to send events to your monitoring system: scaling convex (backend) convex handles scaling automatically: serverless functions — scale to zero, scale to thousands database — automatically sharded and replicated no cold starts — functions are always warm next.js (frontend) for the next.js app: vercel — automatic global edge deployment self-hosted — use a load balancer with multiple instances session cookies are stateless on the next.js side (stored in convex), so any in backup & recovery data backup convex provides automatic backups and point-in-time recovery. for additional protection: secret rotation to rotate the better_auth_secret: pre-launch checklist environment [ ] better_auth_secret is set to a unique production value [ ] site_url matches your production domain (with https://) [ ] all next_public_* variables point to production convex deployment security [ ] https is enabled (required for secure cookies) [ ] better_auth_secret is different from development [ ] no development/test credentials in production auth methods [ ] email/password sign-up flow works end-to-end [ ] email verification emails are received [ ] password reset emails are received [ ] social oauth flows complete successfully monitoring [ ] convex dashboard accessible [ ] audit logs are being recorded [ ] webhook endpoints are registered and receiving events [ ] error alerting is configured compliance [ ] audit logging is active (always-on by default) [ ] data retention policy defined [ ] privacy policy updated to reflect auth data collection [ ] cookie consent banner added (if required by jurisdic post-launch after launching: what's next environment variables — complete variable reference webhooks — set up event monitoring audit logs — configure compliance logging"
  },
  {
    "slug": "domains",
    "title": "Domains",
    "description": "Configure custom domains for authentication services, email delivery, admin portal, and hosted AuthKit UI.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "How Domains Work",
        "anchor": "how-domains-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Default Domains",
        "anchor": "default-domains",
        "snippet": "Default domains are seeded automatically when you first visit the Domains page in the dashboard. They cannot be deleted but their values can be edited."
      },
      {
        "level": 2,
        "text": "Domain Data Model",
        "anchor": "domain-data-model",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Managing Domains via the Dashboard",
        "anchor": "managing-domains-via-the-dashboard",
        "snippet": "Navigate to Domains in the dashboard sidebar Default domains are pre-populated on first visit Click the pencil icon on any domain to edit its value inline"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 3 domain management endpoints:"
      },
      {
        "level": 3,
        "text": "List Domains",
        "anchor": "list-domains",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save (Upsert) a Domain",
        "anchor": "save-upsert-a-domain",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Delete a Domain",
        "anchor": "delete-a-domain",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Domains are stored in the domainConfig table in Convex:"
      },
      {
        "level": 2,
        "text": "Using Domains Programmatically",
        "anchor": "using-domains-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": "The dashboard uses these functions internally. If you're building custom admin tooling, you can call them the same way:"
      },
      {
        "level": 2,
        "text": "Custom Domain Setup",
        "anchor": "custom-domain-setup",
        "snippet": "When you change a domain value (e.g., switching from auth.banata.dev to auth.mycompany.com), you also need to configure DNS and SSL:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Admin-only access — All domain endpoints require admin authentication. Non-admin users cannot view or modify domain configuration. Default domains are protected — Built-in default domains (Email, Admi"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Authentication required\"",
        "anchor": "authentication-required",
        "snippet": "You must be signed in as an admin to access domain configuration. Check that your session is valid and your user has role: \"admin\"."
      },
      {
        "level": 3,
        "text": "\"Domain value not taking effect\"",
        "anchor": "domain-value-not-taking-effect",
        "snippet": "Domain values stored in the dashboard are configuration records — they don't automatically update DNS or SSL certificates. You need to separately configure DNS records and ensure the domain resolves c"
      },
      {
        "level": 3,
        "text": "\"Default domains missing\"",
        "anchor": "default-domains-missing",
        "snippet": "Default domains are seeded on first visit to the Domains page. If they're missing, navigate to Domains in the dashboard and the 4 defaults will be created automatically."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Redirects — Configure redirect URIs for authentication flows Environment Variables — Configure required environment variables Deploying to Production — Full deployment guide"
      }
    ],
    "searchText": "domains configure custom domains for authentication services, email delivery, admin portal, and hosted authkit ui. how domains work default domains default domains are seeded automatically when you first visit the domains page in the dashboard. they cannot be deleted but their values can be edited. domain data model managing domains via the dashboard navigate to domains in the dashboard sidebar default domains are pre-populated on first visit click the pencil icon on any domain to edit its value inline api endpoints the configplugin exposes 3 domain management endpoints: list domains save (upsert) a domain delete a domain database storage domains are stored in the domainconfig table in convex: using domains programmatically via the dashboard api client the dashboard uses these functions internally. if you're building custom admin tooling, you can call them the same way: custom domain setup when you change a domain value (e.g., switching from auth.banata.dev to auth.mycompany.com), you also need to configure dns and ssl: security considerations admin-only access — all domain endpoints require admin authentication. non-admin users cannot view or modify domain configuration. default domains are protected — built-in default domains (email, admi troubleshooting \"authentication required\" you must be signed in as an admin to access domain configuration. check that your session is valid and your user has role: \"admin\". \"domain value not taking effect\" domain values stored in the dashboard are configuration records — they don't automatically update dns or ssl certificates. you need to separately configure dns records and ensure the domain resolves c \"default domains missing\" default domains are seeded on first visit to the domains page. if they're missing, navigate to domains in the dashboard and the 4 defaults will be created automatically. what's next redirects — configure redirect uris for authentication flows environment variables — configure required environment variables deploying to production — full deployment guide"
  },
  {
    "slug": "env-vars",
    "title": "Environment Variables",
    "description": "Complete reference for every environment variable used by Banata Auth — Convex backend, Next.js frontend, and OAuth providers.",
    "section": "Configuration",
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
        "snippet": "These are set on the Convex deployment using npx convex env set. They're available to Convex functions via process.env."
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
        "snippet": "Set these only for the providers you've enabled in socialProviders:"
      },
      {
        "level": 3,
        "text": "Email Provider",
        "anchor": "email-provider",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Passkey (WebAuthn)",
        "anchor": "passkey-webauthn",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Listing All Convex Variables",
        "anchor": "listing-all-convex-variables",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Next.js Environment Variables (.env.local)",
        "anchor": "nextjs-environment-variables-envlocal",
        "snippet": "These are set in your .env.local file and are available to your Next.js app."
      },
      {
        "level": 3,
        "text": "Core",
        "anchor": "core",
        "snippet": ""
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
        "snippet": "For local Convex development (npx convex dev):"
      },
      {
        "level": 3,
        "text": "NEXT_PUBLIC_ Prefix",
        "anchor": "nextpublic-prefix",
        "snippet": "Variables starting with NEXT_PUBLIC_ are embedded in the client-side JavaScript bundle and visible to users. Never put secrets in NEXT_PUBLIC_ variables."
      },
      {
        "level": 2,
        "text": "Dashboard-Specific Variables",
        "anchor": "dashboard-specific-variables",
        "snippet": "The admin dashboard (apps/dashboard) uses additional variables:"
      },
      {
        "level": 2,
        "text": "Production Checklist",
        "anchor": "production-checklist",
        "snippet": "Before deploying to production, verify:"
      },
      {
        "level": 2,
        "text": "Template .env.local",
        "anchor": "template-envlocal",
        "snippet": "Copy this template for new projects:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Deploy — Production deployment guide Quick Start — Set up a new project from scratch Convex — Backend configuration reference"
      }
    ],
    "searchText": "environment variables complete reference for every environment variable used by banata auth — convex backend, next.js frontend, and oauth providers. quick reference --- convex environment variables these are set on the convex deployment using npx convex env set. they're available to convex functions via process.env. core social oauth providers set these only for the providers you've enabled in socialproviders: email provider passkey (webauthn) listing all convex variables next.js environment variables (.env.local) these are set in your .env.local file and are available to your next.js app. core example .env.local local development for local convex development (npx convex dev): next_public_ prefix variables starting with next_public_ are embedded in the client-side javascript bundle and visible to users. never put secrets in next_public_ variables. dashboard-specific variables the admin dashboard (apps/dashboard) uses additional variables: production checklist before deploying to production, verify: template .env.local copy this template for new projects: what's next deploy — production deployment guide quick start — set up a new project from scratch convex — backend configuration reference"
  },
  {
    "slug": "invitations",
    "title": "Invitations",
    "description": "Complete invitation lifecycle — sending, accepting, expiring, and revoking organization invitations.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How Invitations Work",
        "anchor": "how-invitations-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Invitation Data Model",
        "anchor": "invitation-data-model",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Status Lifecycle",
        "anchor": "status-lifecycle",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "The invitation email callback is part of the email configuration:"
      },
      {
        "level": 3,
        "text": "Callback Parameters",
        "anchor": "callback-parameters",
        "snippet": "The sendInvitationEmail callback receives an object with:"
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Send an Invitation",
        "anchor": "send-an-invitation",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List Pending Invitations",
        "anchor": "list-pending-invitations",
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
        "text": "Invitation Acceptance Page",
        "anchor": "invitation-acceptance-page",
        "snippet": "Build a page at /invite/[id] that handles invitation acceptance:"
      },
      {
        "level": 2,
        "text": "Server-Side Management (Admin SDK)",
        "anchor": "server-side-management-admin-sdk",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Expiration",
        "anchor": "expiration",
        "snippet": "Invitations expire after 7 days (604,800 seconds), as defined in @banata-auth/shared:"
      },
      {
        "level": 2,
        "text": "Bulk Invitations",
        "anchor": "bulk-invitations",
        "snippet": "To invite multiple users at once, iterate over the emails:"
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
        "text": "Invitation Email Not Sent",
        "anchor": "invitation-email-not-sent",
        "snippet": "Check that sendInvitationEmail is configured in your email callbacks Check the Convex function logs for errors in the email sending Make sure authMethods.organization is true"
      },
      {
        "level": 3,
        "text": "\"Invitation Already Pending\"",
        "anchor": "invitation-already-pending",
        "snippet": "An invitation with the same email already exists for this organization. Either: Wait for it to expire (7 days) Revoke the existing invitation first, then send a new one"
      },
      {
        "level": 3,
        "text": "\"Organization Membership Limit Reached\"",
        "anchor": "organization-membership-limit-reached",
        "snippet": "The organization has reached the membershipLimit (default: 100). Increase it in your config:"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Roles & Permissions — Control what members can do within an organization Organizations — Full organization management guide Webhooks — Get notified about invitation events"
      }
    ],
    "searchText": "invitations complete invitation lifecycle — sending, accepting, expiring, and revoking organization invitations. how invitations work invitation data model status lifecycle configuration the invitation email callback is part of the email configuration: callback parameters the sendinvitationemail callback receives an object with: client-side api send an invitation list pending invitations accept an invitation revoke an invitation invitation acceptance page build a page at /invite/[id] that handles invitation acceptance: server-side management (admin sdk) expiration invitations expire after 7 days (604,800 seconds), as defined in @banata-auth/shared: bulk invitations to invite multiple users at once, iterate over the emails: audit events --- troubleshooting invitation email not sent check that sendinvitationemail is configured in your email callbacks check the convex function logs for errors in the email sending make sure authmethods.organization is true \"invitation already pending\" an invitation with the same email already exists for this organization. either: wait for it to expire (7 days) revoke the existing invitation first, then send a new one \"organization membership limit reached\" the organization has reached the membershiplimit (default: 100). increase it in your config: what's next roles & permissions — control what members can do within an organization organizations — full organization management guide webhooks — get notified about invitation events"
  },
  {
    "slug": "notifications",
    "title": "Notifications",
    "description": "Real-time system notifications for critical auth events — user creation, password changes, MFA enrollment, and more.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How Notifications Work",
        "anchor": "how-notifications-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Important Events",
        "anchor": "important-events",
        "snippet": "Notifications filter the audit log to these high-signal event types:"
      },
      {
        "level": 2,
        "text": "Notification Data Model",
        "anchor": "notification-data-model",
        "snippet": "Each notification is an audit event with this structure:"
      },
      {
        "level": 2,
        "text": "Viewing Notifications in the Dashboard",
        "anchor": "viewing-notifications-in-the-dashboard",
        "snippet": "Navigate to Notifications in the dashboard sidebar Recent important events are displayed as a list"
      },
      {
        "level": 3,
        "text": "Notification Display",
        "anchor": "notification-display",
        "snippet": "Each notification row shows:"
      },
      {
        "level": 3,
        "text": "Empty State",
        "anchor": "empty-state",
        "snippet": "When no important events have occurred, the page shows:"
      },
      {
        "level": 2,
        "text": "Backend: No Separate Endpoints",
        "anchor": "backend-no-separate-endpoints",
        "snippet": "Notifications reuse the existing audit log endpoint — no additional backend endpoints are needed:"
      },
      {
        "level": 2,
        "text": "Customizing Important Events",
        "anchor": "customizing-important-events",
        "snippet": "The set of important events is defined in the dashboard page source. To customize which events appear as notifications, modify the IMPORTANT_ACTIONS array:"
      },
      {
        "level": 2,
        "text": "Relative Time Formatting",
        "anchor": "relative-time-formatting",
        "snippet": "Notifications display timestamps as human-readable relative time:"
      },
      {
        "level": 2,
        "text": "Notifications vs. Audit Logs",
        "anchor": "notifications-vs-audit-logs",
        "snippet": "For comprehensive event querying, filtering, and export, use Audit Logs."
      },
      {
        "level": 2,
        "text": "Using the Audit Log API for Notifications",
        "anchor": "using-the-audit-log-api-for-notifications",
        "snippet": "If you're building a custom notification UI outside the dashboard, use the audit log SDK methods:"
      },
      {
        "level": 2,
        "text": "Webhook-Based Notifications",
        "anchor": "webhook-based-notifications",
        "snippet": "For real-time push notifications (email, Slack, PagerDuty), use Webhooks instead of polling the audit log:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Admin-only access — The notifications page and the underlying audit log endpoint require admin authentication. No sensitive data exposed — Notifications show event types, actor identities, and timesta"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"No notifications\" but events are occurring",
        "anchor": "no-notifications-but-events-are-occurring",
        "snippet": "Check that the events match the IMPORTANT_ACTIONS list. Common auth events like session.created are intentionally excluded — they're too frequent to be useful as notifications."
      },
      {
        "level": 3,
        "text": "\"Failed to load notifications\"",
        "anchor": "failed-to-load-notifications",
        "snippet": "The audit log endpoint may be unreachable. Check that the Convex backend is running and that your session is valid."
      },
      {
        "level": 3,
        "text": "\"Timestamps showing 'Invalid Date'\"",
        "anchor": "timestamps-showing-invalid-date",
        "snippet": "Ensure the audit events have valid occurredAt timestamps. This can happen if custom audit events are created with malformed date strings."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Audit Logs — Full audit trail with filtering, search, and export Webhooks — Push notifications for auth events Radar & Bot Protection — Monitor and block suspicious activity"
      }
    ],
    "searchText": "notifications real-time system notifications for critical auth events — user creation, password changes, mfa enrollment, and more. how notifications work important events notifications filter the audit log to these high-signal event types: notification data model each notification is an audit event with this structure: viewing notifications in the dashboard navigate to notifications in the dashboard sidebar recent important events are displayed as a list notification display each notification row shows: empty state when no important events have occurred, the page shows: backend: no separate endpoints notifications reuse the existing audit log endpoint — no additional backend endpoints are needed: customizing important events the set of important events is defined in the dashboard page source. to customize which events appear as notifications, modify the important_actions array: relative time formatting notifications display timestamps as human-readable relative time: notifications vs. audit logs for comprehensive event querying, filtering, and export, use audit logs. using the audit log api for notifications if you're building a custom notification ui outside the dashboard, use the audit log sdk methods: webhook-based notifications for real-time push notifications (email, slack, pagerduty), use webhooks instead of polling the audit log: security considerations admin-only access — the notifications page and the underlying audit log endpoint require admin authentication. no sensitive data exposed — notifications show event types, actor identities, and timesta troubleshooting \"no notifications\" but events are occurring check that the events match the important_actions list. common auth events like session.created are intentionally excluded — they're too frequent to be useful as notifications. \"failed to load notifications\" the audit log endpoint may be unreachable. check that the convex backend is running and that your session is valid. \"timestamps showing 'invalid date'\" ensure the audit events have valid occurredat timestamps. this can happen if custom audit events are created with malformed date strings. what's next audit logs — full audit trail with filtering, search, and export webhooks — push notifications for auth events radar & bot protection — monitor and block suspicious activity"
  },
  {
    "slug": "organizations-overview",
    "title": "Organizations",
    "description": "Multi-tenant workspaces with members, roles, invitations, and organization switching — the foundation for B2B SaaS.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "Enable organizations in your BanataAuthConfig:"
      },
      {
        "level": 3,
        "text": "Organization Config Options",
        "anchor": "organization-config-options",
        "snippet": "---"
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
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Client-Side API",
        "anchor": "client-side-api",
        "snippet": ""
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
        "snippet": "When a user belongs to multiple organizations, they switch between them:"
      },
      {
        "level": 3,
        "text": "Get Active Organization",
        "anchor": "get-active-organization",
        "snippet": ""
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
        "snippet": "Returns the current active organization:"
      },
      {
        "level": 3,
        "text": "useBanataAuth()",
        "anchor": "usebanataauth",
        "snippet": "The full context includes organization data:"
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
        "text": "Invitation Management",
        "anchor": "invitation-management",
        "snippet": "See the dedicated Invitations guide for the complete invitation lifecycle."
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
        "text": "Server-Side Management (Admin SDK)",
        "anchor": "server-side-management-admin-sdk",
        "snippet": "Use the SDK to manage organizations from your backend:"
      },
      {
        "level": 2,
        "text": "Organization Switcher Component",
        "anchor": "organization-switcher-component",
        "snippet": "A common UI pattern is an organization switcher in the navigation:"
      },
      {
        "level": 2,
        "text": "Database Tables",
        "anchor": "database-tables",
        "snippet": "Organizations use these Convex tables:"
      },
      {
        "level": 2,
        "text": "Audit Events",
        "anchor": "audit-events",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Invitations — Complete invitation lifecycle and flows Roles & Permissions — Fine-grained access control within organizations Webhooks — Get notified about organization events"
      }
    ],
    "searchText": "organizations multi-tenant workspaces with members, roles, invitations, and organization switching — the foundation for b2b saas. configuration enable organizations in your banataauthconfig: organization config options --- data model organization member invitation client-side api create an organization list user's organizations set active organization when a user belongs to multiple organizations, they switch between them: get active organization update an organization delete an organization react hooks useorganization() returns the current active organization: usebanataauth() the full context includes organization data: member management list members add a member update member role remove a member invitation management see the dedicated invitations guide for the complete invitation lifecycle. send an invitation accept an invitation revoke an invitation server-side management (admin sdk) use the sdk to manage organizations from your backend: organization switcher component a common ui pattern is an organization switcher in the navigation: database tables organizations use these convex tables: audit events --- what's next invitations — complete invitation lifecycle and flows roles & permissions — fine-grained access control within organizations webhooks — get notified about organization events"
  },
  {
    "slug": "radar",
    "title": "Radar (Dashboard Feature)",
    "description": "AI-powered bot detection with configurable providers (Vercel BotID, Cloudflare Turnstile, reCAPTCHA, hCaptcha), impossible travel detection, device fingerprinting, and rate limiting.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "How Radar Works",
        "anchor": "how-radar-works",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Supported Bot Detection Providers",
        "anchor": "supported-bot-detection-providers",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Configuring a Provider",
        "anchor": "configuring-a-provider",
        "snippet": "Navigate to Radar in the dashboard sidebar Click Enable protection if not already enabled Go to the Configuration tab Toggle Bot detection on Under Bot Detection Provider, select your provider from th"
      },
      {
        "level": 2,
        "text": "Using Bot Protection in Your App",
        "anchor": "using-bot-protection-in-your-app",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Option 1: Config-Aware (Recommended)",
        "anchor": "option-1-config-aware-recommended",
        "snippet": "Reads provider credentials from the dashboard configuration automatically:"
      },
      {
        "level": 3,
        "text": "Option 2: Direct Provider (Vercel BotID)",
        "anchor": "option-2-direct-provider-vercel-botid",
        "snippet": "For Vercel deployments with BotID installed directly:"
      },
      {
        "level": 2,
        "text": "Detection Rules",
        "anchor": "detection-rules",
        "snippet": "Radar provides 4 configurable detection rules that work alongside bot providers:"
      },
      {
        "level": 3,
        "text": "Detection Rule Defaults",
        "anchor": "detection-rule-defaults",
        "snippet": "When Radar is first enabled, it ships with sensible defaults:"
      },
      {
        "level": 2,
        "text": "Radar Configuration Data Model",
        "anchor": "radar-configuration-data-model",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Managing Radar via the Dashboard",
        "anchor": "managing-radar-via-the-dashboard",
        "snippet": "Navigate to Radar in the dashboard sidebar"
      },
      {
        "level": 3,
        "text": "Enabling Radar",
        "anchor": "enabling-radar",
        "snippet": "The Radar page shows a hero card with feature highlights when disabled:"
      },
      {
        "level": 3,
        "text": "Configuring Detection Rules",
        "anchor": "configuring-detection-rules",
        "snippet": "Click the Configuration tab Toggle individual detection rules on or off using the switches Changes are saved to the backend immediately with optimistic updates"
      },
      {
        "level": 3,
        "text": "Configuring Bot Detection Provider",
        "anchor": "configuring-bot-detection-provider",
        "snippet": "In the Configuration tab, scroll to Bot Detection Provider Select a provider from the dropdown (BotID, Turnstile, reCAPTCHA, hCaptcha) A description and docs link appear for the selected provider"
      },
      {
        "level": 3,
        "text": "Overview Tab",
        "anchor": "overview-tab",
        "snippet": "The Overview tab shows detection statistics (total detections, allowed, challenged, blocked) and a timeline chart. These populate with data once Radar is active in production."
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 2 Radar endpoints:"
      },
      {
        "level": 3,
        "text": "Get Radar Config",
        "anchor": "get-radar-config",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save Radar Config",
        "anchor": "save-radar-config",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Radar configuration is stored as a singleton row in the radarConfig table:"
      },
      {
        "level": 2,
        "text": "Using Radar Programmatically",
        "anchor": "using-radar-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Combining Radar with Rate Limiting",
        "anchor": "combining-radar-with-rate-limiting",
        "snippet": "Radar's rate limiting detection rule works alongside Banata Auth's built-in rate limiting (configured in BanataAuthConfig). The two are complementary:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Defense in depth — Radar provides multiple layers (bot providers, detection rules, rate limiting). Enable all layers in production. Provider flexibility — Not tied to a single provider. Switch provide"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Bot detected. Access denied.\" (403)",
        "anchor": "bot-detected-access-denied-403",
        "snippet": "The bot provider flagged the request as automated. This can happen if: The request is from an automated script without browser context The provider's client-side widget didn't load (check your layout/"
      },
      {
        "level": 3,
        "text": "\"Detection stats showing all zeros\"",
        "anchor": "detection-stats-showing-all-zeros",
        "snippet": "Detection statistics populate once Radar is active in production and receives real traffic. In development, all requests pass through without recording statistics."
      },
      {
        "level": 3,
        "text": "\"Radar enabled but no protection\"",
        "anchor": "radar-enabled-but-no-protection",
        "snippet": "Check that: A bot provider is selected in the Radar configuration Credentials are saved for the selected provider Your route handler uses withBotProtection() with either createConfigAwareVerifier() or"
      },
      {
        "level": 3,
        "text": "\"Credentials not taking effect\"",
        "anchor": "credentials-not-taking-effect",
        "snippet": "The config-aware verifier caches the radar config for 1 minute by default. Wait up to 1 minute after saving credentials, or set cacheTtlMs: 0 for immediate effect (not recommended in production)."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Bot Protection Package — Full API reference for @banata-auth/nextjs/bot-protection Settings — Project-level configuration Audit Logs — Track security events and suspicious activity"
      }
    ],
    "searchText": "radar (dashboard feature) ai-powered bot detection with configurable providers (vercel botid, cloudflare turnstile, recaptcha, hcaptcha), impossible travel detection, device fingerprinting, and rate limiting. how radar works supported bot detection providers configuring a provider navigate to radar in the dashboard sidebar click enable protection if not already enabled go to the configuration tab toggle bot detection on under bot detection provider, select your provider from th using bot protection in your app option 1: config-aware (recommended) reads provider credentials from the dashboard configuration automatically: option 2: direct provider (vercel botid) for vercel deployments with botid installed directly: detection rules radar provides 4 configurable detection rules that work alongside bot providers: detection rule defaults when radar is first enabled, it ships with sensible defaults: radar configuration data model managing radar via the dashboard navigate to radar in the dashboard sidebar enabling radar the radar page shows a hero card with feature highlights when disabled: configuring detection rules click the configuration tab toggle individual detection rules on or off using the switches changes are saved to the backend immediately with optimistic updates configuring bot detection provider in the configuration tab, scroll to bot detection provider select a provider from the dropdown (botid, turnstile, recaptcha, hcaptcha) a description and docs link appear for the selected provider overview tab the overview tab shows detection statistics (total detections, allowed, challenged, blocked) and a timeline chart. these populate with data once radar is active in production. api endpoints the configplugin exposes 2 radar endpoints: get radar config save radar config database storage radar configuration is stored as a singleton row in the radarconfig table: using radar programmatically via the dashboard api client combining radar with rate limiting radar's rate limiting detection rule works alongside banata auth's built-in rate limiting (configured in banataauthconfig). the two are complementary: security considerations defense in depth — radar provides multiple layers (bot providers, detection rules, rate limiting). enable all layers in production. provider flexibility — not tied to a single provider. switch provide troubleshooting \"bot detected. access denied.\" (403) the bot provider flagged the request as automated. this can happen if: the request is from an automated script without browser context the provider's client-side widget didn't load (check your layout/ \"detection stats showing all zeros\" detection statistics populate once radar is active in production and receives real traffic. in development, all requests pass through without recording statistics. \"radar enabled but no protection\" check that: a bot provider is selected in the radar configuration credentials are saved for the selected provider your route handler uses withbotprotection() with either createconfigawareverifier() or \"credentials not taking effect\" the config-aware verifier caches the radar config for 1 minute by default. wait up to 1 minute after saving credentials, or set cachettlms: 0 for immediate effect (not recommended in production). what's next bot protection package — full api reference for @banata-auth/nextjs/bot-protection settings — project-level configuration audit logs — track security events and suspicious activity"
  },
  {
    "slug": "redirects",
    "title": "Redirects",
    "description": "Configure redirect URIs, sign-in/sign-out endpoints, and Admin Portal callback URLs for authentication flows.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "How Redirects Work",
        "anchor": "how-redirects-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Redirect Settings",
        "anchor": "redirect-settings",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Application Redirects",
        "anchor": "application-redirects",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Admin Portal Redirects",
        "anchor": "admin-portal-redirects",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Redirect Data Model",
        "anchor": "redirect-data-model",
        "snippet": "The entire redirect configuration is stored as a flat key-value map:"
      },
      {
        "level": 2,
        "text": "Managing Redirects via the Dashboard",
        "anchor": "managing-redirects-via-the-dashboard",
        "snippet": "Navigate to Redirects in the dashboard sidebar Each redirect setting is displayed as a card"
      },
      {
        "level": 3,
        "text": "Editing Single-Value Redirects",
        "anchor": "editing-single-value-redirects",
        "snippet": "Click Edit on any single-value redirect card Enter the URL in the inline input field Press Enter to save or Escape to cancel Changes are saved to the backend immediately"
      },
      {
        "level": 3,
        "text": "Editing Multi-Value Redirects",
        "anchor": "editing-multi-value-redirects",
        "snippet": "Multi-value fields (Redirect URIs, Sign-out redirects) support multiple URLs:"
      },
      {
        "level": 3,
        "text": "Admin Portal Redirects",
        "anchor": "admin-portal-redirects",
        "snippet": "Click Edit Admin Portal redirects to switch all 5 Admin Portal fields to edit mode simultaneously Update the values as needed Click Save to persist all changes or Cancel to revert"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 2 redirect endpoints:"
      },
      {
        "level": 3,
        "text": "Get Redirects",
        "anchor": "get-redirects",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save Redirects",
        "anchor": "save-redirects",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Redirects are stored as a singleton row in the redirectConfig table in Convex:"
      },
      {
        "level": 2,
        "text": "Using Redirects Programmatically",
        "anchor": "using-redirects-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Redirect Validation",
        "anchor": "redirect-validation",
        "snippet": "When configuring redirects, follow these rules:"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "anchor": "security-considerations",
        "snippet": "Open redirect prevention — Only redirect to URIs that are explicitly configured. Banata Auth does not allow dynamic redirect targets. Admin-only access — Redirect configuration requires admin authenti"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "anchor": "troubleshooting",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "\"Redirect URI mismatch\"",
        "anchor": "redirect-uri-mismatch",
        "snippet": "The URL your client is requesting doesn't match any configured redirect URI. Check the Redirect URIs field in the dashboard and ensure the requested URL is in the list (exact match, including trailing"
      },
      {
        "level": 3,
        "text": "\"Not configured\" showing for all fields",
        "anchor": "not-configured-showing-for-all-fields",
        "snippet": "Redirect configuration is empty until you save at least one value. Navigate to Redirects in the dashboard and configure the fields you need."
      },
      {
        "level": 3,
        "text": "\"Changes not persisting\"",
        "anchor": "changes-not-persisting",
        "snippet": "Redirect configuration is saved to the backend on every edit. If changes aren't persisting, check that you have admin privileges and that the Convex backend is running."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Domains — Configure custom domains for auth services Email & Password — Authentication flow that uses password reset redirects Social OAuth — OAuth flows that use redirect URIs"
      }
    ],
    "searchText": "redirects configure redirect uris, sign-in/sign-out endpoints, and admin portal callback urls for authentication flows. how redirects work redirect settings application redirects admin portal redirects --- redirect data model the entire redirect configuration is stored as a flat key-value map: managing redirects via the dashboard navigate to redirects in the dashboard sidebar each redirect setting is displayed as a card editing single-value redirects click edit on any single-value redirect card enter the url in the inline input field press enter to save or escape to cancel changes are saved to the backend immediately editing multi-value redirects multi-value fields (redirect uris, sign-out redirects) support multiple urls: admin portal redirects click edit admin portal redirects to switch all 5 admin portal fields to edit mode simultaneously update the values as needed click save to persist all changes or cancel to revert api endpoints the configplugin exposes 2 redirect endpoints: get redirects save redirects database storage redirects are stored as a singleton row in the redirectconfig table in convex: using redirects programmatically via the dashboard api client redirect validation when configuring redirects, follow these rules: security considerations open redirect prevention — only redirect to uris that are explicitly configured. banata auth does not allow dynamic redirect targets. admin-only access — redirect configuration requires admin authenti troubleshooting \"redirect uri mismatch\" the url your client is requesting doesn't match any configured redirect uri. check the redirect uris field in the dashboard and ensure the requested url is in the list (exact match, including trailing \"not configured\" showing for all fields redirect configuration is empty until you save at least one value. navigate to redirects in the dashboard and configure the fields you need. \"changes not persisting\" redirect configuration is saved to the backend on every edit. if changes aren't persisting, check that you have admin privileges and that the convex backend is running. what's next domains — configure custom domains for auth services email & password — authentication flow that uses password reset redirects social oauth — oauth flows that use redirect uris"
  },
  {
    "slug": "resource-types",
    "title": "Resource Types",
    "description": "Define custom resource types for fine-grained authorization — scope permissions to specific resources in your application.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How Resource Types Work",
        "anchor": "how-resource-types-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Resource Type Data Model",
        "anchor": "resource-type-data-model",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "The slug Convention",
        "anchor": "the-slug-convention",
        "snippet": "Resource type slugs are used as the prefix in permission strings:"
      },
      {
        "level": 2,
        "text": "Creating Resource Types",
        "anchor": "creating-resource-types",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard",
        "anchor": "via-the-dashboard",
        "snippet": "Navigate to Authorization > Resource Types in the dashboard sidebar Click Create resource type Enter a Name (e.g., \"Document\") — the slug is auto-generated from the name"
      },
      {
        "level": 3,
        "text": "Via the API",
        "anchor": "via-the-api",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Managing Resource Types",
        "anchor": "managing-resource-types",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List All Resource Types",
        "anchor": "list-all-resource-types",
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
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The configPlugin exposes 3 resource type endpoints:"
      },
      {
        "level": 3,
        "text": "Duplicate Slug Prevention",
        "anchor": "duplicate-slug-prevention",
        "snippet": "The create endpoint enforces unique slugs. If you attempt to create a resource type with a slug that already exists, the API returns a CONFLICT error:"
      },
      {
        "level": 2,
        "text": "Database Storage",
        "anchor": "database-storage",
        "snippet": "Resource types are stored in the resourceType table in Convex:"
      },
      {
        "level": 2,
        "text": "Using Resource Types Programmatically",
        "anchor": "using-resource-types-programmatically",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Dashboard API Client",
        "anchor": "via-the-dashboard-api-client",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Connecting Resource Types to Permissions",
        "anchor": "connecting-resource-types-to-permissions",
        "snippet": "Once you've defined resource types, use them to build your permission model:"
      },
      {
        "level": 3,
        "text": "Step 1: Define Resource Types",
        "anchor": "step-1-define-resource-types",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 2: Define Actions per Resource",
        "anchor": "step-2-define-actions-per-resource",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 3: Create Permission Strings",
        "anchor": "step-3-create-permission-strings",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 4: Assign Permissions to Roles",
        "anchor": "step-4-assign-permissions-to-roles",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Step 5: Check Permissions at Runtime",
        "anchor": "step-5-check-permissions-at-runtime",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Common Resource Type Patterns",
        "anchor": "common-resource-type-patterns",
        "snippet": ""
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
        "snippet": "Use singular nouns — document not documents. The slug represents a _type_, not a collection. Keep slugs short — They appear in every permission string. doc is fine; documentation-file-resource is exce"
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
        "snippet": "Slugs must be unique. Either use a different slug or delete the existing resource type first."
      },
      {
        "level": 3,
        "text": "\"Resource types not appearing\"",
        "anchor": "resource-types-not-appearing",
        "snippet": "Ensure you're signed in as an admin. The list endpoint requires admin authentication."
      },
      {
        "level": 3,
        "text": "\"Deleted resource type still referenced in permissions\"",
        "anchor": "deleted-resource-type-still-referenced-in-permissions",
        "snippet": "Deleting a resource type doesn't cascade to permission definitions. Manually update any roles that reference permissions with the deleted resource type's slug."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Roles & Permissions — Assign permissions to roles using resource type slugs Auth Configuration — Configure authorization behavior Organizations — Multi-tenant workspaces where authorization is applied"
      }
    ],
    "searchText": "resource types define custom resource types for fine-grained authorization — scope permissions to specific resources in your application. how resource types work resource type data model the slug convention resource type slugs are used as the prefix in permission strings: creating resource types via the dashboard navigate to authorization > resource types in the dashboard sidebar click create resource type enter a name (e.g., \"document\") — the slug is auto-generated from the name via the api managing resource types list all resource types delete a resource type api endpoints the configplugin exposes 3 resource type endpoints: duplicate slug prevention the create endpoint enforces unique slugs. if you attempt to create a resource type with a slug that already exists, the api returns a conflict error: database storage resource types are stored in the resourcetype table in convex: using resource types programmatically via the dashboard api client connecting resource types to permissions once you've defined resource types, use them to build your permission model: step 1: define resource types step 2: define actions per resource step 3: create permission strings step 4: assign permissions to roles step 5: check permissions at runtime common resource type patterns b2b saas developer tool content platform --- best practices use singular nouns — document not documents. the slug represents a _type_, not a collection. keep slugs short — they appear in every permission string. doc is fine; documentation-file-resource is exce troubleshooting \"a resource type with this slug already exists\" slugs must be unique. either use a different slug or delete the existing resource type first. \"resource types not appearing\" ensure you're signed in as an admin. the list endpoint requires admin authentication. \"deleted resource type still referenced in permissions\" deleting a resource type doesn't cascade to permission definitions. manually update any roles that reference permissions with the deleted resource type's slug. what's next roles & permissions — assign permissions to roles using resource type slugs auth configuration — configure authorization behavior organizations — multi-tenant workspaces where authorization is applied"
  },
  {
    "slug": "roles-permissions",
    "title": "Roles & Permissions",
    "description": "Super-admin-first RBAC with dynamic custom roles, built-in permissions, and project-scoped permission catalogs.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Role Model",
        "anchor": "role-model",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Visible default role",
        "anchor": "visible-default-role",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Reserved role slugs",
        "anchor": "reserved-role-slugs",
        "snippet": "The following role slugs are reserved:"
      },
      {
        "level": 2,
        "text": "Permission Model",
        "anchor": "permission-model",
        "snippet": "Permissions are project-scoped and shared by all organizations in that project."
      },
      {
        "level": 2,
        "text": "Bootstrap Behavior",
        "anchor": "bootstrap-behavior",
        "snippet": "When a project is created (or default project is ensured):"
      },
      {
        "level": 2,
        "text": "Dashboard Management",
        "anchor": "dashboard-management",
        "snippet": "Use:"
      },
      {
        "level": 2,
        "text": "SDK (@banata-auth/sdk)",
        "anchor": "sdk-banata-authsdk",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Roles",
        "anchor": "roles",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Permissions",
        "anchor": "permissions",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Assign or Revoke Roles",
        "anchor": "assign-or-revoke-roles",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Permission Checks",
        "anchor": "permission-checks",
        "snippet": "Permission checks use { resource, action } shape."
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "Role and permission management endpoints:"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "anchor": "best-practices",
        "snippet": "Keep super_admin limited to trusted org owners. Prefer capability-based roles (for example sandbox_operator, billing_viewer) over generic titles. Keep permissions granular and explicit (resource.actio"
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Organizations Auth Configuration Resource Types"
      }
    ],
    "searchText": "roles & permissions super-admin-first rbac with dynamic custom roles, built-in permissions, and project-scoped permission catalogs. role model visible default role reserved role slugs the following role slugs are reserved: permission model permissions are project-scoped and shared by all organizations in that project. bootstrap behavior when a project is created (or default project is ensured): dashboard management use: sdk (@banata-auth/sdk) roles permissions assign or revoke roles permission checks permission checks use { resource, action } shape. api endpoints role and permission management endpoints: best practices keep super_admin limited to trusted org owners. prefer capability-based roles (for example sandbox_operator, billing_viewer) over generic titles. keep permissions granular and explicit (resource.actio what's next organizations auth configuration resource types"
  },
  {
    "slug": "scim",
    "title": "Directory Sync (SCIM)",
    "description": "Automated user provisioning and deprovisioning via SCIM 2.0 directory synchronization.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "Overview",
        "anchor": "overview",
        "snippet": "Directory Sync enables automated user provisioning and deprovisioning between your identity provider (IdP) and Banata Auth using the SCIM 2.0 protocol. When an employee is added, updated, or removed i"
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
        "snippet": "Each SCIM directory is tied to a specific organization in Banata Auth. This means every organization your customers belong to can have its own directory connection, keeping user provisioning scoped an"
      },
      {
        "level": 3,
        "text": "Push-Based Synchronization",
        "anchor": "push-based-synchronization",
        "snippet": "Banata Auth exposes a SCIM 2.0-compliant endpoint for each directory. The IdP is configured to push user and group changes to this endpoint. Whenever a change occurs in the IdP (a new hire, a terminat"
      },
      {
        "level": 3,
        "text": "Authentication",
        "anchor": "authentication",
        "snippet": "All SCIM endpoints are authenticated using a bearer token. Each directory has its own unique token, generated at the time of directory creation. The IdP must include this token in the Authorization he"
      },
      {
        "level": 3,
        "text": "Supported SCIM Events",
        "anchor": "supported-scim-events",
        "snippet": "Banata Auth processes the following SCIM operations:"
      },
      {
        "level": 2,
        "text": "Dashboard Setup",
        "anchor": "dashboard-setup",
        "snippet": ""
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
        "snippet": "After creating the directory, Banata Auth will display:"
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
        "snippet": "The Banata Auth SDK provides methods for managing SCIM directories programmatically."
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
        "level": 3,
        "text": "Rotate Bearer Token",
        "anchor": "rotate-bearer-token",
        "snippet": "If a bearer token is compromised or needs to be rotated:"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Create a SCIM Directory",
        "anchor": "create-a-scim-directory",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "List All Directories",
        "anchor": "list-all-directories",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Directory Object",
        "anchor": "directory-object",
        "snippet": "Each SCIM directory is represented by the following object:"
      },
      {
        "level": 2,
        "text": "SCIM Events",
        "anchor": "scim-events",
        "snippet": "When the IdP pushes changes to the SCIM endpoint, Banata Auth processes each operation and triggers the corresponding internal action. The table below summarizes the supported events and their effects"
      },
      {
        "level": 3,
        "text": "Webhooks for SCIM Events",
        "anchor": "webhooks-for-scim-events",
        "snippet": "You can subscribe to SCIM-related events via webhooks to trigger custom logic in your application when directory changes occur. The following webhook event types are available:"
      }
    ],
    "searchText": "directory sync (scim) automated user provisioning and deprovisioning via scim 2.0 directory synchronization. overview directory sync enables automated user provisioning and deprovisioning between your identity provider (idp) and banata auth using the scim 2.0 protocol. when an employee is added, updated, or removed i how it works directories and organizations each scim directory is tied to a specific organization in banata auth. this means every organization your customers belong to can have its own directory connection, keeping user provisioning scoped an push-based synchronization banata auth exposes a scim 2.0-compliant endpoint for each directory. the idp is configured to push user and group changes to this endpoint. whenever a change occurs in the idp (a new hire, a terminat authentication all scim endpoints are authenticated using a bearer token. each directory has its own unique token, generated at the time of directory creation. the idp must include this token in the authorization he supported scim events banata auth processes the following scim operations: dashboard setup step 1: navigate to directory sync open the banata auth dashboard and navigate to the directory sync section under your project settings. this page lists all configured scim directories across your organizations. step 2: create a directory click create directory and fill in the required fields: step 3: copy the scim endpoint and bearer token after creating the directory, banata auth will display: step 4: configure your identity provider use the scim endpoint url and bearer token to configure provisioning in your idp. the exact steps vary by provider: sdk usage the banata auth sdk provides methods for managing scim directories programmatically. initialize the client list scim directories retrieve all configured scim directories across your project: get a specific directory retrieve details about a single directory by its id: create a directory delete a directory rotate bearer token if a bearer token is compromised or needs to be rotated: api endpoints create a scim directory list all directories directory object each scim directory is represented by the following object: scim events when the idp pushes changes to the scim endpoint, banata auth processes each operation and triggers the corresponding internal action. the table below summarizes the supported events and their effects webhooks for scim events you can subscribe to scim-related events via webhooks to trigger custom logic in your application when directory changes occur. the following webhook event types are available:"
  },
  {
    "slug": "settings",
    "title": "Settings",
    "description": "Configure your Banata Auth project name, auth method overview, team management, and danger zone.",
    "section": "Configuration",
    "headings": [
      {
        "level": 2,
        "text": "Settings Sub-Pages",
        "anchor": "settings-sub-pages",
        "snippet": "Navigating to /settings automatically redirects to /settings/general."
      },
      {
        "level": 2,
        "text": "General Settings",
        "anchor": "general-settings",
        "snippet": "The General page manages your project identity."
      },
      {
        "level": 3,
        "text": "Project Identity",
        "anchor": "project-identity",
        "snippet": "Project name — A human-readable name for your project (max 100 characters). Shown in the dashboard header. Description — An optional description of your project (max 500 characters)."
      },
      {
        "level": 3,
        "text": "Client ID",
        "anchor": "client-id",
        "snippet": "A read-only identifier for your project. This is derived from the appName in your BanataAuthConfig and is used by SDKs to identify which Banata Auth instance to connect to. You can copy it to your cli"
      },
      {
        "level": 3,
        "text": "Saving",
        "anchor": "saving",
        "snippet": "Changes to project name and description are persisted to the backend when you click Save changes. The save button is disabled when there are no unsaved changes."
      },
      {
        "level": 2,
        "text": "Auth Overview",
        "anchor": "auth-overview",
        "snippet": "A read-only dashboard showing the current state of your authentication configuration. This page does not allow editing — it links to the appropriate configuration pages for changes."
      },
      {
        "level": 3,
        "text": "What's Displayed",
        "anchor": "whats-displayed",
        "snippet": "Summary stats — Count of enabled auth methods, social providers, and features Authentication Methods — All 9 methods (Email & Password, Magic Link, Email OTP, Passkey, Two-Factor Auth, Organizations, "
      },
      {
        "level": 2,
        "text": "Team",
        "anchor": "team",
        "snippet": "Team management is coming soon. Currently the page shows:"
      },
      {
        "level": 2,
        "text": "Danger Zone",
        "anchor": "danger-zone",
        "snippet": "Contains destructive, irreversible actions that affect your entire project."
      },
      {
        "level": 3,
        "text": "Reset Configuration",
        "anchor": "reset-configuration",
        "snippet": "Resets all dashboard configuration to defaults: Branding settings Email configuration Detection rules (Radar) All custom configuration"
      },
      {
        "level": 3,
        "text": "Delete Project",
        "anchor": "delete-project",
        "snippet": "Permanently deletes the project and all associated data: Users and sessions Organizations and memberships API keys and webhooks All configuration"
      },
      {
        "level": 2,
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The settings backend uses the configPlugin with project config endpoints:"
      },
      {
        "level": 3,
        "text": "Get Project Config",
        "anchor": "get-project-config",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Save Project Config",
        "anchor": "save-project-config",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Data Model",
        "anchor": "data-model",
        "snippet": "Project configuration is stored as a singleton row in the projectConfig table:"
      },
      {
        "level": 2,
        "text": "Using Settings Programmatically",
        "anchor": "using-settings-programmatically",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Radar & Bot Protection — Configure bot detection with provider credentials Bot Protection Package — Integrate bot detection in your Next.js app Domains — Configure custom domains for auth services"
      }
    ],
    "searchText": "settings configure your banata auth project name, auth method overview, team management, and danger zone. settings sub-pages navigating to /settings automatically redirects to /settings/general. general settings the general page manages your project identity. project identity project name — a human-readable name for your project (max 100 characters). shown in the dashboard header. description — an optional description of your project (max 500 characters). client id a read-only identifier for your project. this is derived from the appname in your banataauthconfig and is used by sdks to identify which banata auth instance to connect to. you can copy it to your cli saving changes to project name and description are persisted to the backend when you click save changes. the save button is disabled when there are no unsaved changes. auth overview a read-only dashboard showing the current state of your authentication configuration. this page does not allow editing — it links to the appropriate configuration pages for changes. what's displayed summary stats — count of enabled auth methods, social providers, and features authentication methods — all 9 methods (email & password, magic link, email otp, passkey, two-factor auth, organizations,  team team management is coming soon. currently the page shows: danger zone contains destructive, irreversible actions that affect your entire project. reset configuration resets all dashboard configuration to defaults: branding settings email configuration detection rules (radar) all custom configuration delete project permanently deletes the project and all associated data: users and sessions organizations and memberships api keys and webhooks all configuration api endpoints the settings backend uses the configplugin with project config endpoints: get project config save project config data model project configuration is stored as a singleton row in the projectconfig table: using settings programmatically what's next radar & bot protection — configure bot detection with provider credentials bot protection package — integrate bot detection in your next.js app domains — configure custom domains for auth services"
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
        "text": "How It Works",
        "anchor": "how-it-works",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Connection Model",
        "anchor": "connection-model",
        "snippet": "SSO connections are always tied to an organization. This means:"
      },
      {
        "level": 3,
        "text": "Domain-Based Routing",
        "anchor": "domain-based-routing",
        "snippet": "When a user initiates SSO login, Banata Auth uses the email domain to determine which identity provider to route them to:"
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
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Creating an SSO Connection",
        "anchor": "creating-an-sso-connection",
        "snippet": "Navigate to the SSO section in the Banata Auth dashboard. Click Create Connection. Select the organization that this connection belongs to. Choose the protocol: SAML 2.0 or OIDC."
      },
      {
        "level": 3,
        "text": "Configuring SAML 2.0",
        "anchor": "configuring-saml-20",
        "snippet": "After creating the connection, you need to exchange metadata with the IdP:"
      },
      {
        "level": 3,
        "text": "Configuring OIDC",
        "anchor": "configuring-oidc",
        "snippet": "For OIDC connections, provide the following from the IdP:"
      },
      {
        "level": 2,
        "text": "SDK Usage",
        "anchor": "sdk-usage",
        "snippet": "Use the Banata Auth SDK to manage SSO connections programmatically."
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
        "text": "API Endpoints",
        "anchor": "api-endpoints",
        "snippet": "The following API endpoints are available for SSO operations:"
      },
      {
        "level": 3,
        "text": "POST /sso/register",
        "anchor": "post-ssoregister",
        "snippet": "Create a new SSO connection for an organization."
      },
      {
        "level": 3,
        "text": "POST /sso/sign-in",
        "anchor": "post-ssosign-in",
        "snippet": "Initiate SSO login for a user. Returns a redirect URL pointing to the appropriate IdP."
      },
      {
        "level": 3,
        "text": "POST /sso/list-providers",
        "anchor": "post-ssolist-providers",
        "snippet": "List all SSO connections for the current project."
      },
      {
        "level": 2,
        "text": "Connection Types",
        "anchor": "connection-types",
        "snippet": "Each protocol requires different configuration fields. The table below summarizes what each type expects:"
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
        "snippet": "SSO connections are scoped to the project they belong to. A connection created in one project cannot be accessed or used by another project, even within the same account. This ensures tenant isolation"
      },
      {
        "level": 3,
        "text": "Domain Verification",
        "anchor": "domain-verification",
        "snippet": "When domains are associated with an SSO connection, Banata Auth enforces that only users with matching email domains are routed through that connection. This prevents unauthorized domain claims and en"
      },
      {
        "level": 3,
        "text": "Signature Validation",
        "anchor": "signature-validation",
        "snippet": "For SAML connections, Banata Auth validates the XML signature on every assertion using the X.509 certificate provided during setup. Assertions with invalid, expired, or missing signatures are rejected"
      },
      {
        "level": 3,
        "text": "Additional Safeguards",
        "anchor": "additional-safeguards",
        "snippet": "Replay protection — SAML assertions include a unique ID and timestamp. Banata Auth rejects assertions that have already been consumed or that fall outside the allowed time window."
      }
    ],
    "searchText": "single sign-on (sso) enterprise sso with saml 2.0 and openid connect (oidc) for organization-level authentication. supported protocols banata auth supports the two industry-standard sso protocols: how it works connection model sso connections are always tied to an organization. this means: domain-based routing when a user initiates sso login, banata auth uses the email domain to determine which identity provider to route them to: just-in-time (jit) provisioning when a user authenticates via sso for the first time and no matching account exists, banata auth automatically: dashboard setup creating an sso connection navigate to the sso section in the banata auth dashboard. click create connection. select the organization that this connection belongs to. choose the protocol: saml 2.0 or oidc. configuring saml 2.0 after creating the connection, you need to exchange metadata with the idp: configuring oidc for oidc connections, provide the following from the idp: sdk usage use the banata auth sdk to manage sso connections programmatically. initialize the client list sso connections retrieve all sso connections for your project: get a specific connection fetch details for a single connection by id: create a connection initiate sso login redirect the user to their idp for authentication: api endpoints the following api endpoints are available for sso operations: post /sso/register create a new sso connection for an organization. post /sso/sign-in initiate sso login for a user. returns a redirect url pointing to the appropriate idp. post /sso/list-providers list all sso connections for the current project. connection types each protocol requires different configuration fields. the table below summarizes what each type expects: saml 2.0 oidc fields marked as provided by banata auth (acsurl, spentityid) are generated when the connection is created and must be configured in the idp. security project scoping sso connections are scoped to the project they belong to. a connection created in one project cannot be accessed or used by another project, even within the same account. this ensures tenant isolation domain verification when domains are associated with an sso connection, banata auth enforces that only users with matching email domains are routed through that connection. this prevents unauthorized domain claims and en signature validation for saml connections, banata auth validates the xml signature on every assertion using the x.509 certificate provided during setup. assertions with invalid, expired, or missing signatures are rejected additional safeguards replay protection — saml assertions include a unique id and timestamp. banata auth rejects assertions that have already been consumed or that fall outside the allowed time window."
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
        "snippet": "The Vault uses AES-256-GCM (Galois/Counter Mode) authenticated encryption with the following process:"
      },
      {
        "level": 2,
        "text": "What Gets Encrypted",
        "anchor": "what-gets-encrypted",
        "snippet": "The Vault automatically encrypts sensitive data stored by Banata Auth's internal subsystems:"
      },
      {
        "level": 2,
        "text": "Configuration",
        "anchor": "configuration",
        "snippet": "The Vault is enabled by default when BETTER_AUTH_SECRET is set in your environment. No additional configuration is required."
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
        "text": "Data Model",
        "anchor": "data-model",
        "snippet": ""
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
        "snippet": "Verify the context parameter matches the value used during encryption Ensure BETTER_AUTH_SECRET has not been changed since encryption Check that the secret has not been corrupted (GCM will reject tamp"
      },
      {
        "level": 3,
        "text": "\"Vault secret not found\"",
        "anchor": "vault-secret-not-found",
        "snippet": "Confirm the secretId is correct (should start with vsec_) The secret may have been deleted Check organization scoping — secrets scoped to one org are not visible to another"
      },
      {
        "level": 3,
        "text": "\"BETTER_AUTH_SECRET is required\"",
        "anchor": "betterauthsecret-is-required",
        "snippet": "Set the BETTER_AUTH_SECRET environment variable in your deployment. It must be at least 32 characters."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "SDK Reference — Complete API reference for all Vault methods Audit Logs — Monitor Vault access events Environment Variables — Configure BETTER_AUTH_SECRET and other secrets"
      }
    ],
    "searchText": "vault & encryption application-level encryption for sensitive data with key management and field-level encryption support. how it works the vault uses aes-256-gcm (galois/counter mode) authenticated encryption with the following process: what gets encrypted the vault automatically encrypts sensitive data stored by banata auth's internal subsystems: configuration the vault is enabled by default when better_auth_secret is set in your environment. no additional configuration is required. requirements better_auth_secret must be at least 32 characters use a cryptographically random value (e.g., openssl rand -base64 48) store it in your deployment's environment variables, not in source control sdk usage encrypting data store a secret in the vault: decrypting data retrieve and decrypt a stored secret: listing secrets list vault secrets (metadata only — encrypted values are never returned in list responses): deleting a secret permanently remove a secret from the vault: key rotation rotate the vault encryption key. this re-encrypts all existing secrets with a new key derived from the current better_auth_secret: data model envelope encryption the vault uses envelope encryption to balance security and performance: security best practices protect better_auth_secret — this is the root of all vault encryption. use a secrets manager (aws secrets manager, vercel env vars, etc.) and never commit it to source control. audit events --- troubleshooting \"decryption failed\" verify the context parameter matches the value used during encryption ensure better_auth_secret has not been changed since encryption check that the secret has not been corrupted (gcm will reject tamp \"vault secret not found\" confirm the secretid is correct (should start with vsec_) the secret may have been deleted check organization scoping — secrets scoped to one org are not visible to another \"better_auth_secret is required\" set the better_auth_secret environment variable in your deployment. it must be at least 32 characters. what's next sdk reference — complete api reference for all vault methods audit logs — monitor vault access events environment variables — configure better_auth_secret and other secrets"
  },
  {
    "slug": "webhooks",
    "title": "Webhooks",
    "description": "Event-driven webhooks with HMAC-SHA256 signatures, automatic retries, and delivery tracking.",
    "section": "Enterprise",
    "headings": [
      {
        "level": 2,
        "text": "How Webhooks Work",
        "anchor": "how-webhooks-work",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Setting Up Webhooks",
        "anchor": "setting-up-webhooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Via the Admin Dashboard",
        "anchor": "via-the-admin-dashboard",
        "snippet": "Navigate to Settings > Webhooks Click Add Endpoint Enter the Endpoint URL (e.g., https://myapp.com/api/webhooks/banata) Select which events to subscribe to"
      },
      {
        "level": 3,
        "text": "Via the Admin SDK",
        "anchor": "via-the-admin-sdk",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Webhook Payload",
        "anchor": "webhook-payload",
        "snippet": "Every webhook delivery sends a POST request with a JSON body:"
      },
      {
        "level": 3,
        "text": "Headers",
        "anchor": "headers",
        "snippet": "---"
      },
      {
        "level": 2,
        "text": "Signing & Verification",
        "anchor": "signing-verification",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Signature Format",
        "anchor": "signature-format",
        "snippet": "The Webhook-Signature header uses this format:"
      },
      {
        "level": 3,
        "text": "Signing Process (Server-Side)",
        "anchor": "signing-process-server-side",
        "snippet": "The webhook system signs payloads as follows:"
      },
      {
        "level": 3,
        "text": "Signing Secret Format",
        "anchor": "signing-secret-format",
        "snippet": "Webhook secrets are prefixed with whsec_ for identification:"
      },
      {
        "level": 2,
        "text": "Verifying Webhooks",
        "anchor": "verifying-webhooks",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using the SDK (Recommended)",
        "anchor": "using-the-sdk-recommended",
        "snippet": "The SDK provides an async constructEvent method that verifies the signature:"
      },
      {
        "level": 3,
        "text": "Manual Verification",
        "anchor": "manual-verification",
        "snippet": "If you need to verify signatures without the SDK:"
      },
      {
        "level": 2,
        "text": "Retry Policy",
        "anchor": "retry-policy",
        "snippet": "Failed webhook deliveries are automatically retried with exponential backoff:"
      },
      {
        "level": 3,
        "text": "Retry Best Practices",
        "anchor": "retry-best-practices",
        "snippet": "Return 200 quickly — Process webhooks asynchronously. Return 200 immediately and process the event in a background job. Implement idempotency — Use the Webhook-Id header to deduplicate. Store processe"
      },
      {
        "level": 2,
        "text": "Available Events",
        "anchor": "available-events",
        "snippet": "The webhook system can deliver notifications for 30+ auth events:"
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
        "text": "Webhook Endpoint Handler Example",
        "anchor": "webhook-endpoint-handler-example",
        "snippet": "Complete Next.js API route handler:"
      },
      {
        "level": 2,
        "text": "Delivery Monitoring",
        "anchor": "delivery-monitoring",
        "snippet": "Webhook deliveries are tracked in the webhookDelivery table. You can view delivery status, response codes, and retry history through:"
      },
      {
        "level": 3,
        "text": "Delivery Record",
        "anchor": "delivery-record",
        "snippet": ""
      },
      {
        "level": 2,
        "text": "Testing Webhooks Locally",
        "anchor": "testing-webhooks-locally",
        "snippet": "During development, your local server isn't publicly accessible. Use a tunnel:"
      },
      {
        "level": 3,
        "text": "Using ngrok",
        "anchor": "using-ngrok",
        "snippet": ""
      },
      {
        "level": 3,
        "text": "Using the Convex Dashboard",
        "anchor": "using-the-convex-dashboard",
        "snippet": "Convex function logs show webhook dispatch activity. Check the logs at dashboard.convex.dev to debug delivery issues."
      },
      {
        "level": 2,
        "text": "Security Best Practices",
        "anchor": "security-best-practices",
        "snippet": "Always verify signatures — Never process a webhook without verifying the HMAC signature. Check timestamp freshness — Reject webhooks with timestamps older than 5 minutes to prevent replay attacks."
      },
      {
        "level": 2,
        "text": "What's Next",
        "anchor": "whats-next",
        "snippet": "Audit Logs — Comprehensive event logging SDK Reference — Complete SDK API reference Deploy — Production deployment with webhook monitoring"
      }
    ],
    "searchText": "webhooks event-driven webhooks with hmac-sha256 signatures, automatic retries, and delivery tracking. how webhooks work setting up webhooks via the admin dashboard navigate to settings > webhooks click add endpoint enter the endpoint url (e.g., https://myapp.com/api/webhooks/banata) select which events to subscribe to via the admin sdk webhook payload every webhook delivery sends a post request with a json body: headers --- signing & verification signature format the webhook-signature header uses this format: signing process (server-side) the webhook system signs payloads as follows: signing secret format webhook secrets are prefixed with whsec_ for identification: verifying webhooks using the sdk (recommended) the sdk provides an async constructevent method that verifies the signature: manual verification if you need to verify signatures without the sdk: retry policy failed webhook deliveries are automatically retried with exponential backoff: retry best practices return 200 quickly — process webhooks asynchronously. return 200 immediately and process the event in a background job. implement idempotency — use the webhook-id header to deduplicate. store processe available events the webhook system can deliver notifications for 30+ auth events: user events session events organization events security events --- webhook endpoint handler example complete next.js api route handler: delivery monitoring webhook deliveries are tracked in the webhookdelivery table. you can view delivery status, response codes, and retry history through: delivery record testing webhooks locally during development, your local server isn't publicly accessible. use a tunnel: using ngrok using the convex dashboard convex function logs show webhook dispatch activity. check the logs at dashboard.convex.dev to debug delivery issues. security best practices always verify signatures — never process a webhook without verifying the hmac signature. check timestamp freshness — reject webhooks with timestamps older than 5 minutes to prevent replay attacks. what's next audit logs — comprehensive event logging sdk reference — complete sdk api reference deploy — production deployment with webhook monitoring"
  }
];
