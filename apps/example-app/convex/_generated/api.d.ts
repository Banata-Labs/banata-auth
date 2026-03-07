/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authNode from "../authNode.js";
import type * as http from "../http.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authNode: typeof authNode;
  http: typeof http;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  banataAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  logoUrl?: string;
                  name: string;
                  ownerId: string;
                  slug: string;
                  updatedAt: number;
                };
                model: "project";
              }
            | {
                data: {
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt: number;
                  displayUsername?: string;
                  email: string;
                  emailVerified: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  metadata?: any;
                  name: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  projectId?: string;
                  role?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt: number;
                  username?: string;
                };
                model: "user";
              }
            | {
                data: {
                  activeOrganizationId?: string;
                  createdAt: number;
                  expiresAt: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  projectId?: string;
                  token: string;
                  updatedAt: number;
                  userAgent?: string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  accountId: string;
                  createdAt: number;
                  idToken?: string;
                  password?: string;
                  projectId?: string;
                  providerId: string;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scope?: string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt?: number;
                  expiresAt: number;
                  identifier: string;
                  projectId?: string;
                  updatedAt?: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: {
                  backupCodes: string;
                  createdAt: number;
                  projectId?: string;
                  secret: string;
                  updatedAt: number;
                  userId: string;
                };
                model: "twoFactor";
              }
            | {
                data: {
                  backedUp?: boolean;
                  counter: number;
                  createdAt: number;
                  credentialID: string;
                  deviceType?: string;
                  name?: string;
                  projectId?: string;
                  publicKey: string;
                  transports?: string;
                  userId: string;
                };
                model: "passkey";
              }
            | {
                data: {
                  createdAt: number;
                  privateKey: string;
                  projectId?: string;
                  publicKey: string;
                };
                model: "jwks";
              }
            | {
                data: {
                  count: number;
                  key: string;
                  lastRequest: number;
                  projectId?: string;
                };
                model: "rateLimit";
              }
            | {
                data: {
                  createdAt: number;
                  logo?: string;
                  metadata?: any;
                  name: string;
                  projectId?: string;
                  slug: string;
                  updatedAt: number;
                };
                model: "organization";
              }
            | {
                data: {
                  createdAt: number;
                  organizationId: string;
                  projectId?: string;
                  role: string;
                  updatedAt: number;
                  userId: string;
                };
                model: "member";
              }
            | {
                data: {
                  createdAt: number;
                  email: string;
                  expiresAt: number;
                  inviterId: string;
                  organizationId: string;
                  projectId?: string;
                  role: string;
                  status: string;
                };
                model: "invitation";
              }
            | {
                data: {
                  active?: boolean;
                  createdAt: number;
                  domain: string;
                  domainVerified?: boolean;
                  issuer: string;
                  name?: string;
                  oidcConfig?: any;
                  organizationId?: string;
                  projectId?: string;
                  providerId: string;
                  providerType: string;
                  samlConfig?: any;
                  updatedAt: number;
                  userId?: string;
                };
                model: "ssoProvider";
              }
            | {
                data: {
                  active?: boolean;
                  createdAt: number;
                  endpointUrl?: string;
                  lastSyncAt?: number;
                  lastSyncStatus?: string;
                  name?: string;
                  organizationId?: string;
                  projectId?: string;
                  provider?: string;
                  providerId: string;
                  scimToken?: string;
                  tokenHash?: string;
                  updatedAt: number;
                  userId?: string;
                };
                model: "scimProvider";
              }
            | {
                data: {
                  createdAt: number;
                  enabled?: boolean;
                  expiresAt?: number | null;
                  key: string;
                  lastRefillAt?: number | null;
                  lastRequest?: number | null;
                  metadata?: any;
                  name?: string;
                  permissions?: string;
                  prefix?: string | null;
                  projectId?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number | null;
                  refillInterval?: string | null;
                  remaining?: number | null;
                  requestCount?: number;
                  start?: string;
                  updatedAt: number;
                  userId: string;
                };
                model: "apikey";
              }
            | {
                data: {
                  action: string;
                  actorEmail?: string;
                  actorId: string;
                  actorMetadata?: any;
                  actorName?: string;
                  actorType: string;
                  changes?: string;
                  createdAt: number;
                  idempotencyKey?: string;
                  ipAddress?: string;
                  metadata?: any;
                  occurredAt: number;
                  organizationId?: string;
                  projectId?: string;
                  requestId?: string;
                  targets?: string;
                  userAgent?: string;
                  version?: number;
                };
                model: "auditEvent";
              }
            | {
                data: {
                  consecutiveFailures?: number;
                  createdAt: number;
                  enabled: boolean;
                  eventTypes?: string;
                  failureCount?: number;
                  lastDeliveryAt?: number;
                  lastDeliveryStatus?: string;
                  projectId?: string;
                  secret: string;
                  successCount?: number;
                  updatedAt: number;
                  url: string;
                };
                model: "webhookEndpoint";
              }
            | {
                data: {
                  attempt: number;
                  createdAt: number;
                  deliveredAt?: number;
                  endpointId: string;
                  errorMessage?: string;
                  eventType: string;
                  httpStatus?: number;
                  maxAttempts: number;
                  nextRetryAt?: number;
                  payload: string;
                  projectId?: string;
                  responseBody?: string;
                  status: string;
                };
                model: "webhookDelivery";
              }
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  isDefault?: boolean;
                  name: string;
                  permissions?: string;
                  projectId?: string;
                  slug: string;
                  updatedAt: number;
                };
                model: "roleDefinition";
              }
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  name: string;
                  projectId?: string;
                  slug: string;
                  updatedAt: number;
                };
                model: "permissionDefinition";
              }
            | {
                data: {
                  bgColor?: string;
                  borderRadius?: number;
                  createdAt: number;
                  customCss?: string;
                  darkMode?: boolean;
                  font?: string;
                  logoUrl?: string;
                  primaryColor?: string;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "brandingConfig";
              }
            | {
                data: {
                  blocksJson: string;
                  builtIn?: boolean;
                  builtInType?: string;
                  category: string;
                  createdAt: number;
                  description?: string;
                  name: string;
                  previewText?: string;
                  projectId?: string;
                  slug: string;
                  subject: string;
                  updatedAt: number;
                  variablesJson?: string;
                };
                model: "emailTemplate";
              }
            | {
                data: {
                  category: string;
                  createdAt: number;
                  description?: string;
                  emailType: string;
                  enabled: boolean;
                  name: string;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "emailConfig";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "dashboardConfig";
              }
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  domainKey: string;
                  isDefault?: boolean;
                  projectId?: string;
                  title: string;
                  updatedAt: number;
                  value: string;
                };
                model: "domainConfig";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "redirectConfig";
              }
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  name: string;
                  projectId?: string;
                  triggerEvent: string;
                  updatedAt: number;
                  webhookUrl: string;
                };
                model: "actionConfig";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "radarConfig";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "emailProviderConfig";
              }
            | {
                data: {
                  createdAt: number;
                  description?: string;
                  name: string;
                  projectId?: string;
                  slug: string;
                  updatedAt: number;
                };
                model: "resourceType";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "addonConfig";
              }
            | {
                data: {
                  configJson: string;
                  createdAt: number;
                  projectId?: string;
                  updatedAt: number;
                };
                model: "projectConfig";
              }
            | {
                data: {
                  context?: string;
                  createdAt: number;
                  encryptedValue: string;
                  iv: string;
                  metadata?: any;
                  name: string;
                  organizationId?: string;
                  projectId?: string;
                  updatedAt: number;
                  version: number;
                };
                model: "vaultSecret";
              }
            | {
                data: {
                  checkCount?: number;
                  createdAt: number;
                  domain: string;
                  expiresAt?: number;
                  lastCheckedAt?: number;
                  method: string;
                  organizationId: string;
                  projectId?: string;
                  state: string;
                  txtRecordName: string;
                  txtRecordValue: string;
                  updatedAt: number;
                  verifiedAt?: number;
                };
                model: "domainVerification";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "project";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "logoUrl"
                    | "ownerId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "projectId"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "role"
                    | "banned"
                    | "banReason"
                    | "banExpires"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "token"
                    | "expiresAt"
                    | "projectId"
                    | "ipAddress"
                    | "userAgent"
                    | "activeOrganizationId"
                    | "impersonatedBy"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "accountId"
                    | "providerId"
                    | "projectId"
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "idToken"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "secret"
                    | "backupCodes"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "name"
                    | "projectId"
                    | "credentialID"
                    | "publicKey"
                    | "counter"
                    | "transports"
                    | "deviceType"
                    | "backedUp"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "projectId"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "projectId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "organization";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "logo"
                    | "projectId"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "member";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "userId"
                    | "role"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitation";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "email"
                    | "role"
                    | "inviterId"
                    | "projectId"
                    | "status"
                    | "expiresAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ssoProvider";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "issuer"
                    | "domain"
                    | "name"
                    | "domainVerified"
                    | "projectId"
                    | "oidcConfig"
                    | "samlConfig"
                    | "providerType"
                    | "active"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "scimProvider";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "scimToken"
                    | "name"
                    | "provider"
                    | "projectId"
                    | "endpointUrl"
                    | "tokenHash"
                    | "active"
                    | "lastSyncAt"
                    | "lastSyncStatus"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apikey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "start"
                    | "prefix"
                    | "key"
                    | "userId"
                    | "projectId"
                    | "refillInterval"
                    | "refillAmount"
                    | "lastRefillAt"
                    | "enabled"
                    | "rateLimitEnabled"
                    | "rateLimitTimeWindow"
                    | "rateLimitMax"
                    | "remaining"
                    | "requestCount"
                    | "lastRequest"
                    | "expiresAt"
                    | "permissions"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditEvent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "version"
                    | "projectId"
                    | "actorType"
                    | "actorId"
                    | "actorName"
                    | "actorEmail"
                    | "actorMetadata"
                    | "targets"
                    | "organizationId"
                    | "ipAddress"
                    | "userAgent"
                    | "requestId"
                    | "changes"
                    | "idempotencyKey"
                    | "metadata"
                    | "occurredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookEndpoint";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "url"
                    | "secret"
                    | "projectId"
                    | "eventTypes"
                    | "enabled"
                    | "successCount"
                    | "failureCount"
                    | "consecutiveFailures"
                    | "lastDeliveryAt"
                    | "lastDeliveryStatus"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookDelivery";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "endpointId"
                    | "eventType"
                    | "projectId"
                    | "payload"
                    | "attempt"
                    | "maxAttempts"
                    | "status"
                    | "httpStatus"
                    | "responseBody"
                    | "errorMessage"
                    | "nextRetryAt"
                    | "deliveredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "roleDefinition";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "permissions"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "permissionDefinition";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "brandingConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "projectId"
                    | "primaryColor"
                    | "bgColor"
                    | "borderRadius"
                    | "darkMode"
                    | "customCss"
                    | "font"
                    | "logoUrl"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailTemplate";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "subject"
                    | "previewText"
                    | "category"
                    | "description"
                    | "blocksJson"
                    | "variablesJson"
                    | "builtIn"
                    | "builtInType"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "emailType"
                    | "name"
                    | "description"
                    | "enabled"
                    | "category"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "dashboardConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "domainKey"
                    | "title"
                    | "description"
                    | "value"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "redirectConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "actionConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "description"
                    | "triggerEvent"
                    | "webhookUrl"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "radarConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailProviderConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "resourceType";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "addonConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "vaultSecret";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "encryptedValue"
                    | "iv"
                    | "projectId"
                    | "context"
                    | "organizationId"
                    | "version"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainVerification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "domain"
                    | "projectId"
                    | "state"
                    | "method"
                    | "txtRecordName"
                    | "txtRecordValue"
                    | "verifiedAt"
                    | "expiresAt"
                    | "lastCheckedAt"
                    | "checkCount"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "project";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "logoUrl"
                    | "ownerId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "projectId"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "role"
                    | "banned"
                    | "banReason"
                    | "banExpires"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "token"
                    | "expiresAt"
                    | "projectId"
                    | "ipAddress"
                    | "userAgent"
                    | "activeOrganizationId"
                    | "impersonatedBy"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "accountId"
                    | "providerId"
                    | "projectId"
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "idToken"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "secret"
                    | "backupCodes"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "name"
                    | "projectId"
                    | "credentialID"
                    | "publicKey"
                    | "counter"
                    | "transports"
                    | "deviceType"
                    | "backedUp"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "projectId"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "projectId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "organization";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "logo"
                    | "projectId"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "member";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "userId"
                    | "role"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitation";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "email"
                    | "role"
                    | "inviterId"
                    | "projectId"
                    | "status"
                    | "expiresAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ssoProvider";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "issuer"
                    | "domain"
                    | "name"
                    | "domainVerified"
                    | "projectId"
                    | "oidcConfig"
                    | "samlConfig"
                    | "providerType"
                    | "active"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "scimProvider";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "scimToken"
                    | "name"
                    | "provider"
                    | "projectId"
                    | "endpointUrl"
                    | "tokenHash"
                    | "active"
                    | "lastSyncAt"
                    | "lastSyncStatus"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apikey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "start"
                    | "prefix"
                    | "key"
                    | "userId"
                    | "projectId"
                    | "refillInterval"
                    | "refillAmount"
                    | "lastRefillAt"
                    | "enabled"
                    | "rateLimitEnabled"
                    | "rateLimitTimeWindow"
                    | "rateLimitMax"
                    | "remaining"
                    | "requestCount"
                    | "lastRequest"
                    | "expiresAt"
                    | "permissions"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditEvent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "version"
                    | "projectId"
                    | "actorType"
                    | "actorId"
                    | "actorName"
                    | "actorEmail"
                    | "actorMetadata"
                    | "targets"
                    | "organizationId"
                    | "ipAddress"
                    | "userAgent"
                    | "requestId"
                    | "changes"
                    | "idempotencyKey"
                    | "metadata"
                    | "occurredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookEndpoint";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "url"
                    | "secret"
                    | "projectId"
                    | "eventTypes"
                    | "enabled"
                    | "successCount"
                    | "failureCount"
                    | "consecutiveFailures"
                    | "lastDeliveryAt"
                    | "lastDeliveryStatus"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookDelivery";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "endpointId"
                    | "eventType"
                    | "projectId"
                    | "payload"
                    | "attempt"
                    | "maxAttempts"
                    | "status"
                    | "httpStatus"
                    | "responseBody"
                    | "errorMessage"
                    | "nextRetryAt"
                    | "deliveredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "roleDefinition";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "permissions"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "permissionDefinition";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "brandingConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "projectId"
                    | "primaryColor"
                    | "bgColor"
                    | "borderRadius"
                    | "darkMode"
                    | "customCss"
                    | "font"
                    | "logoUrl"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailTemplate";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "subject"
                    | "previewText"
                    | "category"
                    | "description"
                    | "blocksJson"
                    | "variablesJson"
                    | "builtIn"
                    | "builtInType"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "emailType"
                    | "name"
                    | "description"
                    | "enabled"
                    | "category"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "dashboardConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "domainKey"
                    | "title"
                    | "description"
                    | "value"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "redirectConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "actionConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "description"
                    | "triggerEvent"
                    | "webhookUrl"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "radarConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailProviderConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "resourceType";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "addonConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectConfig";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "vaultSecret";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "encryptedValue"
                    | "iv"
                    | "projectId"
                    | "context"
                    | "organizationId"
                    | "version"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainVerification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "domain"
                    | "projectId"
                    | "state"
                    | "method"
                    | "txtRecordName"
                    | "txtRecordValue"
                    | "verifiedAt"
                    | "expiresAt"
                    | "lastCheckedAt"
                    | "checkCount"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model:
            | "project"
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "jwks"
            | "rateLimit"
            | "organization"
            | "member"
            | "invitation"
            | "ssoProvider"
            | "scimProvider"
            | "apikey"
            | "auditEvent"
            | "webhookEndpoint"
            | "webhookDelivery"
            | "roleDefinition"
            | "permissionDefinition"
            | "brandingConfig"
            | "emailTemplate"
            | "emailConfig"
            | "dashboardConfig"
            | "domainConfig"
            | "redirectConfig"
            | "actionConfig"
            | "radarConfig"
            | "emailProviderConfig"
            | "resourceType"
            | "addonConfig"
            | "projectConfig"
            | "vaultSecret"
            | "domainVerification";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model:
            | "project"
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "jwks"
            | "rateLimit"
            | "organization"
            | "member"
            | "invitation"
            | "ssoProvider"
            | "scimProvider"
            | "apikey"
            | "auditEvent"
            | "webhookEndpoint"
            | "webhookDelivery"
            | "roleDefinition"
            | "permissionDefinition"
            | "brandingConfig"
            | "emailTemplate"
            | "emailConfig"
            | "dashboardConfig"
            | "domainConfig"
            | "redirectConfig"
            | "actionConfig"
            | "radarConfig"
            | "emailProviderConfig"
            | "resourceType"
            | "addonConfig"
            | "projectConfig"
            | "vaultSecret"
            | "domainVerification";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "project";
                update: {
                  createdAt?: number;
                  description?: string;
                  logoUrl?: string;
                  name?: string;
                  ownerId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "logoUrl"
                    | "ownerId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "user";
                update: {
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt?: number;
                  displayUsername?: string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  metadata?: any;
                  name?: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  projectId?: string;
                  role?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt?: number;
                  username?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "projectId"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "role"
                    | "banned"
                    | "banReason"
                    | "banExpires"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  activeOrganizationId?: string;
                  createdAt?: number;
                  expiresAt?: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  projectId?: string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "token"
                    | "expiresAt"
                    | "projectId"
                    | "ipAddress"
                    | "userAgent"
                    | "activeOrganizationId"
                    | "impersonatedBy"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: string;
                  password?: string;
                  projectId?: string;
                  providerId?: string;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scope?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "accountId"
                    | "providerId"
                    | "projectId"
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "idToken"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  projectId?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  createdAt?: number;
                  projectId?: string;
                  secret?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "secret"
                    | "backupCodes"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: string;
                  projectId?: string;
                  publicKey?: string;
                  transports?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "name"
                    | "projectId"
                    | "credentialID"
                    | "publicKey"
                    | "counter"
                    | "transports"
                    | "deviceType"
                    | "backedUp"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  projectId?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "projectId"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: number;
                  key?: string;
                  lastRequest?: number;
                  projectId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "projectId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "organization";
                update: {
                  createdAt?: number;
                  logo?: string;
                  metadata?: any;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "logo"
                    | "projectId"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "member";
                update: {
                  createdAt?: number;
                  organizationId?: string;
                  projectId?: string;
                  role?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "userId"
                    | "role"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitation";
                update: {
                  createdAt?: number;
                  email?: string;
                  expiresAt?: number;
                  inviterId?: string;
                  organizationId?: string;
                  projectId?: string;
                  role?: string;
                  status?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "email"
                    | "role"
                    | "inviterId"
                    | "projectId"
                    | "status"
                    | "expiresAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ssoProvider";
                update: {
                  active?: boolean;
                  createdAt?: number;
                  domain?: string;
                  domainVerified?: boolean;
                  issuer?: string;
                  name?: string;
                  oidcConfig?: any;
                  organizationId?: string;
                  projectId?: string;
                  providerId?: string;
                  providerType?: string;
                  samlConfig?: any;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "issuer"
                    | "domain"
                    | "name"
                    | "domainVerified"
                    | "projectId"
                    | "oidcConfig"
                    | "samlConfig"
                    | "providerType"
                    | "active"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "scimProvider";
                update: {
                  active?: boolean;
                  createdAt?: number;
                  endpointUrl?: string;
                  lastSyncAt?: number;
                  lastSyncStatus?: string;
                  name?: string;
                  organizationId?: string;
                  projectId?: string;
                  provider?: string;
                  providerId?: string;
                  scimToken?: string;
                  tokenHash?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "scimToken"
                    | "name"
                    | "provider"
                    | "projectId"
                    | "endpointUrl"
                    | "tokenHash"
                    | "active"
                    | "lastSyncAt"
                    | "lastSyncStatus"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apikey";
                update: {
                  createdAt?: number;
                  enabled?: boolean;
                  expiresAt?: number | null;
                  key?: string;
                  lastRefillAt?: number | null;
                  lastRequest?: number | null;
                  metadata?: any;
                  name?: string;
                  permissions?: string;
                  prefix?: string | null;
                  projectId?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number | null;
                  refillInterval?: string | null;
                  remaining?: number | null;
                  requestCount?: number;
                  start?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "start"
                    | "prefix"
                    | "key"
                    | "userId"
                    | "projectId"
                    | "refillInterval"
                    | "refillAmount"
                    | "lastRefillAt"
                    | "enabled"
                    | "rateLimitEnabled"
                    | "rateLimitTimeWindow"
                    | "rateLimitMax"
                    | "remaining"
                    | "requestCount"
                    | "lastRequest"
                    | "expiresAt"
                    | "permissions"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditEvent";
                update: {
                  action?: string;
                  actorEmail?: string;
                  actorId?: string;
                  actorMetadata?: any;
                  actorName?: string;
                  actorType?: string;
                  changes?: string;
                  createdAt?: number;
                  idempotencyKey?: string;
                  ipAddress?: string;
                  metadata?: any;
                  occurredAt?: number;
                  organizationId?: string;
                  projectId?: string;
                  requestId?: string;
                  targets?: string;
                  userAgent?: string;
                  version?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "version"
                    | "projectId"
                    | "actorType"
                    | "actorId"
                    | "actorName"
                    | "actorEmail"
                    | "actorMetadata"
                    | "targets"
                    | "organizationId"
                    | "ipAddress"
                    | "userAgent"
                    | "requestId"
                    | "changes"
                    | "idempotencyKey"
                    | "metadata"
                    | "occurredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookEndpoint";
                update: {
                  consecutiveFailures?: number;
                  createdAt?: number;
                  enabled?: boolean;
                  eventTypes?: string;
                  failureCount?: number;
                  lastDeliveryAt?: number;
                  lastDeliveryStatus?: string;
                  projectId?: string;
                  secret?: string;
                  successCount?: number;
                  updatedAt?: number;
                  url?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "url"
                    | "secret"
                    | "projectId"
                    | "eventTypes"
                    | "enabled"
                    | "successCount"
                    | "failureCount"
                    | "consecutiveFailures"
                    | "lastDeliveryAt"
                    | "lastDeliveryStatus"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookDelivery";
                update: {
                  attempt?: number;
                  createdAt?: number;
                  deliveredAt?: number;
                  endpointId?: string;
                  errorMessage?: string;
                  eventType?: string;
                  httpStatus?: number;
                  maxAttempts?: number;
                  nextRetryAt?: number;
                  payload?: string;
                  projectId?: string;
                  responseBody?: string;
                  status?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "endpointId"
                    | "eventType"
                    | "projectId"
                    | "payload"
                    | "attempt"
                    | "maxAttempts"
                    | "status"
                    | "httpStatus"
                    | "responseBody"
                    | "errorMessage"
                    | "nextRetryAt"
                    | "deliveredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "roleDefinition";
                update: {
                  createdAt?: number;
                  description?: string;
                  isDefault?: boolean;
                  name?: string;
                  permissions?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "permissions"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "permissionDefinition";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "brandingConfig";
                update: {
                  bgColor?: string;
                  borderRadius?: number;
                  createdAt?: number;
                  customCss?: string;
                  darkMode?: boolean;
                  font?: string;
                  logoUrl?: string;
                  primaryColor?: string;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "projectId"
                    | "primaryColor"
                    | "bgColor"
                    | "borderRadius"
                    | "darkMode"
                    | "customCss"
                    | "font"
                    | "logoUrl"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailTemplate";
                update: {
                  blocksJson?: string;
                  builtIn?: boolean;
                  builtInType?: string;
                  category?: string;
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  previewText?: string;
                  projectId?: string;
                  slug?: string;
                  subject?: string;
                  updatedAt?: number;
                  variablesJson?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "subject"
                    | "previewText"
                    | "category"
                    | "description"
                    | "blocksJson"
                    | "variablesJson"
                    | "builtIn"
                    | "builtInType"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailConfig";
                update: {
                  category?: string;
                  createdAt?: number;
                  description?: string;
                  emailType?: string;
                  enabled?: boolean;
                  name?: string;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "emailType"
                    | "name"
                    | "description"
                    | "enabled"
                    | "category"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "dashboardConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainConfig";
                update: {
                  createdAt?: number;
                  description?: string;
                  domainKey?: string;
                  isDefault?: boolean;
                  projectId?: string;
                  title?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "domainKey"
                    | "title"
                    | "description"
                    | "value"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "redirectConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "actionConfig";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  triggerEvent?: string;
                  updatedAt?: number;
                  webhookUrl?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "description"
                    | "triggerEvent"
                    | "webhookUrl"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "radarConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailProviderConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "resourceType";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "addonConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "vaultSecret";
                update: {
                  context?: string;
                  createdAt?: number;
                  encryptedValue?: string;
                  iv?: string;
                  metadata?: any;
                  name?: string;
                  organizationId?: string;
                  projectId?: string;
                  updatedAt?: number;
                  version?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "encryptedValue"
                    | "iv"
                    | "projectId"
                    | "context"
                    | "organizationId"
                    | "version"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainVerification";
                update: {
                  checkCount?: number;
                  createdAt?: number;
                  domain?: string;
                  expiresAt?: number;
                  lastCheckedAt?: number;
                  method?: string;
                  organizationId?: string;
                  projectId?: string;
                  state?: string;
                  txtRecordName?: string;
                  txtRecordValue?: string;
                  updatedAt?: number;
                  verifiedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "domain"
                    | "projectId"
                    | "state"
                    | "method"
                    | "txtRecordName"
                    | "txtRecordValue"
                    | "verifiedAt"
                    | "expiresAt"
                    | "lastCheckedAt"
                    | "checkCount"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "project";
                update: {
                  createdAt?: number;
                  description?: string;
                  logoUrl?: string;
                  name?: string;
                  ownerId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "logoUrl"
                    | "ownerId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "user";
                update: {
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt?: number;
                  displayUsername?: string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  metadata?: any;
                  name?: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  projectId?: string;
                  role?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt?: number;
                  username?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "projectId"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "role"
                    | "banned"
                    | "banReason"
                    | "banExpires"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  activeOrganizationId?: string;
                  createdAt?: number;
                  expiresAt?: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  projectId?: string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "token"
                    | "expiresAt"
                    | "projectId"
                    | "ipAddress"
                    | "userAgent"
                    | "activeOrganizationId"
                    | "impersonatedBy"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: string;
                  password?: string;
                  projectId?: string;
                  providerId?: string;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scope?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "accountId"
                    | "providerId"
                    | "projectId"
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "idToken"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  projectId?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  createdAt?: number;
                  projectId?: string;
                  secret?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "secret"
                    | "backupCodes"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: string;
                  projectId?: string;
                  publicKey?: string;
                  transports?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "name"
                    | "projectId"
                    | "credentialID"
                    | "publicKey"
                    | "counter"
                    | "transports"
                    | "deviceType"
                    | "backedUp"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  projectId?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "projectId"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: number;
                  key?: string;
                  lastRequest?: number;
                  projectId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "projectId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "organization";
                update: {
                  createdAt?: number;
                  logo?: string;
                  metadata?: any;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "logo"
                    | "projectId"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "member";
                update: {
                  createdAt?: number;
                  organizationId?: string;
                  projectId?: string;
                  role?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "userId"
                    | "role"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitation";
                update: {
                  createdAt?: number;
                  email?: string;
                  expiresAt?: number;
                  inviterId?: string;
                  organizationId?: string;
                  projectId?: string;
                  role?: string;
                  status?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "email"
                    | "role"
                    | "inviterId"
                    | "projectId"
                    | "status"
                    | "expiresAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ssoProvider";
                update: {
                  active?: boolean;
                  createdAt?: number;
                  domain?: string;
                  domainVerified?: boolean;
                  issuer?: string;
                  name?: string;
                  oidcConfig?: any;
                  organizationId?: string;
                  projectId?: string;
                  providerId?: string;
                  providerType?: string;
                  samlConfig?: any;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "issuer"
                    | "domain"
                    | "name"
                    | "domainVerified"
                    | "projectId"
                    | "oidcConfig"
                    | "samlConfig"
                    | "providerType"
                    | "active"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "scimProvider";
                update: {
                  active?: boolean;
                  createdAt?: number;
                  endpointUrl?: string;
                  lastSyncAt?: number;
                  lastSyncStatus?: string;
                  name?: string;
                  organizationId?: string;
                  projectId?: string;
                  provider?: string;
                  providerId?: string;
                  scimToken?: string;
                  tokenHash?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "providerId"
                    | "scimToken"
                    | "name"
                    | "provider"
                    | "projectId"
                    | "endpointUrl"
                    | "tokenHash"
                    | "active"
                    | "lastSyncAt"
                    | "lastSyncStatus"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apikey";
                update: {
                  createdAt?: number;
                  enabled?: boolean;
                  expiresAt?: number | null;
                  key?: string;
                  lastRefillAt?: number | null;
                  lastRequest?: number | null;
                  metadata?: any;
                  name?: string;
                  permissions?: string;
                  prefix?: string | null;
                  projectId?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number | null;
                  refillInterval?: string | null;
                  remaining?: number | null;
                  requestCount?: number;
                  start?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "start"
                    | "prefix"
                    | "key"
                    | "userId"
                    | "projectId"
                    | "refillInterval"
                    | "refillAmount"
                    | "lastRefillAt"
                    | "enabled"
                    | "rateLimitEnabled"
                    | "rateLimitTimeWindow"
                    | "rateLimitMax"
                    | "remaining"
                    | "requestCount"
                    | "lastRequest"
                    | "expiresAt"
                    | "permissions"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditEvent";
                update: {
                  action?: string;
                  actorEmail?: string;
                  actorId?: string;
                  actorMetadata?: any;
                  actorName?: string;
                  actorType?: string;
                  changes?: string;
                  createdAt?: number;
                  idempotencyKey?: string;
                  ipAddress?: string;
                  metadata?: any;
                  occurredAt?: number;
                  organizationId?: string;
                  projectId?: string;
                  requestId?: string;
                  targets?: string;
                  userAgent?: string;
                  version?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "version"
                    | "projectId"
                    | "actorType"
                    | "actorId"
                    | "actorName"
                    | "actorEmail"
                    | "actorMetadata"
                    | "targets"
                    | "organizationId"
                    | "ipAddress"
                    | "userAgent"
                    | "requestId"
                    | "changes"
                    | "idempotencyKey"
                    | "metadata"
                    | "occurredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookEndpoint";
                update: {
                  consecutiveFailures?: number;
                  createdAt?: number;
                  enabled?: boolean;
                  eventTypes?: string;
                  failureCount?: number;
                  lastDeliveryAt?: number;
                  lastDeliveryStatus?: string;
                  projectId?: string;
                  secret?: string;
                  successCount?: number;
                  updatedAt?: number;
                  url?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "url"
                    | "secret"
                    | "projectId"
                    | "eventTypes"
                    | "enabled"
                    | "successCount"
                    | "failureCount"
                    | "consecutiveFailures"
                    | "lastDeliveryAt"
                    | "lastDeliveryStatus"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "webhookDelivery";
                update: {
                  attempt?: number;
                  createdAt?: number;
                  deliveredAt?: number;
                  endpointId?: string;
                  errorMessage?: string;
                  eventType?: string;
                  httpStatus?: number;
                  maxAttempts?: number;
                  nextRetryAt?: number;
                  payload?: string;
                  projectId?: string;
                  responseBody?: string;
                  status?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "endpointId"
                    | "eventType"
                    | "projectId"
                    | "payload"
                    | "attempt"
                    | "maxAttempts"
                    | "status"
                    | "httpStatus"
                    | "responseBody"
                    | "errorMessage"
                    | "nextRetryAt"
                    | "deliveredAt"
                    | "createdAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "roleDefinition";
                update: {
                  createdAt?: number;
                  description?: string;
                  isDefault?: boolean;
                  name?: string;
                  permissions?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "permissions"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "permissionDefinition";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "brandingConfig";
                update: {
                  bgColor?: string;
                  borderRadius?: number;
                  createdAt?: number;
                  customCss?: string;
                  darkMode?: boolean;
                  font?: string;
                  logoUrl?: string;
                  primaryColor?: string;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "projectId"
                    | "primaryColor"
                    | "bgColor"
                    | "borderRadius"
                    | "darkMode"
                    | "customCss"
                    | "font"
                    | "logoUrl"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailTemplate";
                update: {
                  blocksJson?: string;
                  builtIn?: boolean;
                  builtInType?: string;
                  category?: string;
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  previewText?: string;
                  projectId?: string;
                  slug?: string;
                  subject?: string;
                  updatedAt?: number;
                  variablesJson?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "subject"
                    | "previewText"
                    | "category"
                    | "description"
                    | "blocksJson"
                    | "variablesJson"
                    | "builtIn"
                    | "builtInType"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailConfig";
                update: {
                  category?: string;
                  createdAt?: number;
                  description?: string;
                  emailType?: string;
                  enabled?: boolean;
                  name?: string;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "emailType"
                    | "name"
                    | "description"
                    | "enabled"
                    | "category"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "dashboardConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainConfig";
                update: {
                  createdAt?: number;
                  description?: string;
                  domainKey?: string;
                  isDefault?: boolean;
                  projectId?: string;
                  title?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "domainKey"
                    | "title"
                    | "description"
                    | "value"
                    | "isDefault"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "redirectConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "actionConfig";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  triggerEvent?: string;
                  updatedAt?: number;
                  webhookUrl?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "description"
                    | "triggerEvent"
                    | "webhookUrl"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "radarConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "emailProviderConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "resourceType";
                update: {
                  createdAt?: number;
                  description?: string;
                  name?: string;
                  projectId?: string;
                  slug?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "slug"
                    | "description"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "addonConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectConfig";
                update: {
                  configJson?: string;
                  createdAt?: number;
                  projectId?: string;
                  updatedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "configJson"
                    | "projectId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "vaultSecret";
                update: {
                  context?: string;
                  createdAt?: number;
                  encryptedValue?: string;
                  iv?: string;
                  metadata?: any;
                  name?: string;
                  organizationId?: string;
                  projectId?: string;
                  updatedAt?: number;
                  version?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "encryptedValue"
                    | "iv"
                    | "projectId"
                    | "context"
                    | "organizationId"
                    | "version"
                    | "metadata"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "domainVerification";
                update: {
                  checkCount?: number;
                  createdAt?: number;
                  domain?: string;
                  expiresAt?: number;
                  lastCheckedAt?: number;
                  method?: string;
                  organizationId?: string;
                  projectId?: string;
                  state?: string;
                  txtRecordName?: string;
                  txtRecordValue?: string;
                  updatedAt?: number;
                  verifiedAt?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "organizationId"
                    | "domain"
                    | "projectId"
                    | "state"
                    | "method"
                    | "txtRecordName"
                    | "txtRecordValue"
                    | "verifiedAt"
                    | "expiresAt"
                    | "lastCheckedAt"
                    | "checkCount"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any
      >;
    };
  };
};
