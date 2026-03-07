/**
 * Type augmentation for next/navigation.
 *
 * Next.js 16 uses `export * from './dist/client/components/navigation'`
 * in its top-level `navigation.d.ts`. In monorepo setups with
 * `moduleResolution: "bundler"`, TypeScript's standalone `tsc --noEmit`
 * sometimes fails to resolve individual named exports through the
 * re-export chain.
 *
 * This file re-declares the hooks we use so `tsc --noEmit` passes.
 * The Next.js TypeScript plugin handles this at dev/build time.
 */

declare module "next/navigation" {
	export function useRouter(): {
		push: (href: string, options?: { scroll?: boolean }) => void;
		replace: (href: string, options?: { scroll?: boolean }) => void;
		refresh: () => void;
		prefetch: (href: string) => void;
		back: () => void;
		forward: () => void;
	};

	export function useParams<
		T extends Record<string, string | string[]> = Record<string, string | string[]>,
	>(): T;

	export function useSearchParams(): URLSearchParams;

	export function usePathname(): string;

	export function useSelectedLayoutSegment(
		parallelRoutesKey?: string,
	): string | null;

	export function useSelectedLayoutSegments(
		parallelRoutesKey?: string,
	): string[];

	export function redirect(url: string, type?: "replace" | "push"): never;
	export function permanentRedirect(
		url: string,
		type?: "replace" | "push",
	): never;
	export function notFound(): never;

	export type ReadonlyURLSearchParams = URLSearchParams;
}
