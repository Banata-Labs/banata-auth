/**
 * API route for rendering email template blocks to HTML.
 *
 * Accepts a JSON body with `blocks`, `branding`, `variables`, and `previewText`,
 * then uses `@react-email/render` to convert the React Email component tree
 * into a final HTML string.
 *
 * This runs on the Next.js server (Node.js runtime) where React rendering
 * works properly — unlike the Convex runtime which has no React/JSX support.
 */

import { type EmailBrandingProps, EmailTemplateRenderer } from "@/components/email-block-renderer";
import type { EmailBlock } from "@banata-auth/shared";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";

interface RenderRequest {
	blocks: EmailBlock[];
	branding?: EmailBrandingProps;
	variables?: Record<string, string>;
	previewText?: string;
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RenderRequest;

		if (!body.blocks || !Array.isArray(body.blocks)) {
			return NextResponse.json({ error: "blocks must be an array" }, { status: 400 });
		}

		const html = await render(
			EmailTemplateRenderer({
				blocks: body.blocks,
				branding: body.branding ?? {},
				variables: body.variables,
				previewText: body.previewText,
			}),
		);

		return NextResponse.json({ html });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Render failed";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
