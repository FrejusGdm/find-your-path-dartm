/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as advice from "../advice.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as clear_opportunities from "../clear_opportunities.js";
import type * as conversations from "../conversations.js";
import type * as messages from "../messages.js";
import type * as opportunities from "../opportunities.js";
import type * as savedOpportunities from "../savedOpportunities.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  advice: typeof advice;
  analytics: typeof analytics;
  auth: typeof auth;
  clear_opportunities: typeof clear_opportunities;
  conversations: typeof conversations;
  messages: typeof messages;
  opportunities: typeof opportunities;
  savedOpportunities: typeof savedOpportunities;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
