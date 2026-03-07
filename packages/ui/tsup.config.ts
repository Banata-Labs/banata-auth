import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: [
		"@banata-auth/shared",
		"react",
		"react-dom",
		"@radix-ui/react-dialog",
		"@radix-ui/react-dropdown-menu",
		"@radix-ui/react-label",
		"@radix-ui/react-select",
		"@radix-ui/react-separator",
		"@radix-ui/react-slot",
		"@radix-ui/react-tabs",
		"@radix-ui/react-toast",
		"@radix-ui/react-tooltip",
		"class-variance-authority",
		"clsx",
		"lucide-react",
		"tailwind-merge",
	],
});
