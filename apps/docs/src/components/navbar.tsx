import Link from "next/link";
import { Github } from "lucide-react";
import { Logo } from "./logo";
import { DocsSearch } from "./docs-search";

export function Navbar() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
				<div className="flex h-14 items-center justify-between">
					{/* Left: Logo */}
					<Link href="/" className="flex items-center gap-2.5">
						<Logo size={24} />
					</Link>

					{/* Center: Nav links (desktop) */}
					<nav className="hidden md:flex items-center gap-6">
						<Link
							href="/docs"
							className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
						>
							Docs
						</Link>
						<Link
							href="/docs/quickstart"
							className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
						>
							Quick Start
						</Link>
						<Link
							href="/docs/sdk"
							className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
						>
							API Reference
						</Link>
						<Link
							href="https://github.com/Banata-Labs/banata-auth"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<Github className="size-[18px]" />
						</Link>
					</nav>

					{/* Right: Search + CTA (desktop) */}
					<div className="hidden md:flex items-center gap-3">
						<DocsSearch />
						<Link
							href="/docs/quickstart"
							className="text-[13px] font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
						>
							Get Started
						</Link>
					</div>

					{/* Mobile: Search only */}
					<div className="md:hidden">
						<DocsSearch />
					</div>
				</div>
			</div>
		</header>
	);
}
