"use client";

import {
	type DashboardProject,
	ensureDefaultProject,
	listProjects,
	setActiveScope,
} from "@/lib/dashboard-api";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectEnvironmentContextValue {
	/** All projects available to the user. */
	projects: DashboardProject[];
	/** The currently active project. */
	activeProject: DashboardProject | null;
	/** Whether initial data is still loading. */
	isLoading: boolean;
	/** Error that occurred during loading, if any. */
	error: string | null;
	/** Switch to a different project by ID. */
	setActiveProjectId: (id: string) => void;
	/** Refresh all project data from the backend. */
	refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// localStorage keys for persisting selection
// ---------------------------------------------------------------------------

const PROJECT_STORAGE_KEY = "banata-active-project-id";

function getStoredId(key: string): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(key);
}

function storeId(key: string, value: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, value);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ProjectEnvironmentContext = createContext<ProjectEnvironmentContextValue>({
	projects: [],
	activeProject: null,
	isLoading: true,
	error: null,
	setActiveProjectId: () => {},
	refresh: async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProjectEnvironmentProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [projects, setProjects] = useState<DashboardProject[]>([]);
	const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() =>
		getStoredId(PROJECT_STORAGE_KEY),
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Derived: active project
	const activeProject = useMemo(
		() => projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null,
		[projects, activeProjectId],
	);

	// Load projects + bootstrap if needed
	const loadProjects = useCallback(async (): Promise<DashboardProject[]> => {
		try {
			// First try to load existing projects
			const result = await listProjects();
			if (result.length > 0) return result;

			// No projects exist — bootstrap default
			const bootstrapped = await ensureDefaultProject();
			if (bootstrapped?.project) {
				return [bootstrapped.project];
			}
			return [];
		} catch (err) {
			console.error("[ProjectEnvironmentProvider] Failed to load projects:", err);
			throw err;
		}
	}, []);

	// Main refresh function
	const refresh = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const loadedProjects = await loadProjects();
			setProjects(loadedProjects);

			if (loadedProjects.length > 0) {
				// Determine which project to activate
				const storedProjectId = getStoredId(PROJECT_STORAGE_KEY);
				const targetProject =
					loadedProjects.find((p) => p.id === storedProjectId) ?? loadedProjects[0]!;

				setActiveProjectIdState(targetProject.id);
				storeId(PROJECT_STORAGE_KEY, targetProject.id);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load projects");
		} finally {
			setIsLoading(false);
		}
	}, [loadProjects]);

	// Sync the module-level scope injector whenever the active project changes
	useEffect(() => {
		setActiveScope(activeProject?.id ?? null);
	}, [activeProject]);

	// Initial load on mount
	useEffect(() => {
		refresh();
	}, [refresh]);

	// When activeProjectId changes externally
	const setActiveProjectId = useCallback((id: string) => {
		setActiveProjectIdState(id);
		storeId(PROJECT_STORAGE_KEY, id);
	}, []);

	const value = useMemo<ProjectEnvironmentContextValue>(
		() => ({
			projects,
			activeProject,
			isLoading,
			error,
			setActiveProjectId,
			refresh,
		}),
		[projects, activeProject, isLoading, error, setActiveProjectId, refresh],
	);

	return (
		<ProjectEnvironmentContext.Provider value={value}>
			{children}
		</ProjectEnvironmentContext.Provider>
	);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useProjectEnvironment(): ProjectEnvironmentContextValue {
	return useContext(ProjectEnvironmentContext);
}

export function useActiveProject(): DashboardProject | null {
	return useContext(ProjectEnvironmentContext).activeProject;
}

/**
 * Returns the active project ID string (or null).
 * Add this to useEffect dependency arrays to trigger re-fetch on project switch.
 */
export function useActiveProjectId(): string | null {
	return useContext(ProjectEnvironmentContext).activeProject?.id ?? null;
}
