export { BanataAuthProvider, useBanataAuth } from "./provider";
export type {
  BanataAuthAdapter,
  BanataAuthContextValue,
  BanataAuthProviderProps,
} from "./provider";
export { useUser } from "./hooks/use-user";
export type { UseUserReturn } from "./hooks/use-user";
export { useSession } from "./hooks/use-session";
export type { UseSessionReturn } from "./hooks/use-session";
export { useOrganization } from "./hooks/use-organization";
export type { UseOrganizationReturn } from "./hooks/use-organization";
export { AuthBoundary } from "./components/auth-boundary";

// ── Auth UI Components ──────────────────────────────────────────────
export {
  AuthCard,
  SignInForm,
  SignUpForm,
  SocialButtons,
} from "./components/auth";
export type {
  AuthCardProps,
  AuthClientLike,
  SignInFormProps,
  SignUpFormProps,
  SocialButtonsProps,
  SocialProvider,
} from "./components/auth";
