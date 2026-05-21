import { buttonVariants } from "@/components/ui/button";
import { type HostedAuthMode, buildHostedAuthUrl } from "@/lib/hosted-ui-url";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface HostedAuthLinkProps {
	mode: HostedAuthMode;
	className?: string;
}

export function HostedAuthLink({ mode, className }: HostedAuthLinkProps) {
	const href = buildHostedAuthUrl(mode);
	if (!href) {
		return null;
	}

	return (
		<a
			className={cn(buttonVariants({ variant: "outline", className: "w-full gap-2" }), className)}
			href={href}
		>
			<ExternalLink className="size-4" aria-hidden="true" />
			{mode === "sign-up" ? "Hosted sign-up" : "Hosted sign-in"}
		</a>
	);
}
