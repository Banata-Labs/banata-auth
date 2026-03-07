import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { DocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="pt-14 min-h-screen">
				<div className="mx-auto max-w-7xl flex">
					{/* Left sidebar */}
					<DocsSidebar />

					{/* Main content */}
					<main className="flex-1 min-w-0 px-6 sm:px-8 lg:px-12 py-10 lg:ml-64">
						<article className="max-w-[72ch] mx-auto">{children}</article>
					</main>
				</div>
			</div>
		</>
	);
}
