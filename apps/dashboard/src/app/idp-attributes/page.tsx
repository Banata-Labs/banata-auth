import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Code2, UserCog } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// ORIGINAL IMPLEMENTATION (restore when SSO plugin is available)
// ──────────────────────────────────────────────────────────────────────
// "use client";
//
// import { useEffect, useState, useCallback } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from "@/components/ui/dialog";
// import { Eye, Trash2 } from "lucide-react";
//
// interface IdpAttribute {
// 	id: string;
// 	name: string;
// 	key: string;
// 	description: string;
// 	isDefault: boolean;
// }
//
// const PREDEFINED_ATTRIBUTES: IdpAttribute[] = [
// 	{ id: "idp_id", name: "IdP ID", key: "idp_id", description: "Identity provider unique identifier", isDefault: true },
// 	{ id: "first_name", name: "First Name", key: "first_name", description: "User's first name", isDefault: true },
// 	{ id: "last_name", name: "Last Name", key: "last_name", description: "User's last name", isDefault: true },
// 	{ id: "email", name: "Email", key: "email", description: "User's email address", isDefault: true },
// 	{ id: "groups", name: "Groups", key: "groups", description: "Group memberships from the IdP", isDefault: true },
// 	{ id: "raw_attributes", name: "Raw Attributes", key: "raw_attributes", description: "Raw SAML/OIDC attribute payload", isDefault: true },
// 	{ id: "custom_attributes", name: "Custom Attributes", key: "custom_attributes", description: "Mapped custom attribute values", isDefault: true },
// ];
//
// const STORAGE_KEY = "banata-idp-attributes";
//
// export default function IdpAttributesPage() {
// 	const [customAttributes, setCustomAttributes] = useState<IdpAttribute[]>([]);
// 	const [newName, setNewName] = useState("");
// 	const [newKey, setNewKey] = useState("");
// 	const [newDescription, setNewDescription] = useState("");
//
// 	const loadCustom = useCallback(() => {
// 		try {
// 			const raw = localStorage.getItem(STORAGE_KEY);
// 			if (raw) setCustomAttributes(JSON.parse(raw) as IdpAttribute[]);
// 		} catch { /* ignore */ }
// 	}, []);
//
// 	useEffect(() => { loadCustom(); }, [loadCustom]);
//
// 	const saveCustom = (attrs: IdpAttribute[]) => {
// 		setCustomAttributes(attrs);
// 		localStorage.setItem(STORAGE_KEY, JSON.stringify(attrs));
// 	};
//
// 	const addAttribute = () => {
// 		if (!newName.trim() || !newKey.trim()) return;
// 		const attr: IdpAttribute = {
// 			id: `custom_${Date.now()}`,
// 			name: newName.trim(),
// 			key: newKey.trim(),
// 			description: newDescription.trim(),
// 			isDefault: false,
// 		};
// 		saveCustom([...customAttributes, attr]);
// 		setNewName("");
// 		setNewKey("");
// 		setNewDescription("");
// 	};
//
// 	const removeAttribute = (id: string) => {
// 		saveCustom(customAttributes.filter((a) => a.id !== id));
// 	};
//
// 	const allAttributes = [...PREDEFINED_ATTRIBUTES, ...customAttributes];
//
// 	// Example SAML payload for the viewer dialog
// 	const examplePayload = JSON.stringify(
// 		Object.fromEntries(allAttributes.map((a) => [a.key, `<value for ${a.name}>` ])),
// 		null,
// 		2,
// 	);
//
// 	return (
// 		<div className="grid gap-6">
// 			<div>
// 				<h1 className="text-2xl font-semibold tracking-tight">
// 					IdP Attributes
// 				</h1>
// 				<p className="mt-1 text-sm text-muted-foreground">
// 					Manage attribute mappings from identity providers during SSO
// 					authentication.
// 				</p>
// 			</div>
//
// 			{/* Attribute table */}
// 			<Card className="gap-0 overflow-hidden py-0">
// 				<CardContent className="px-0">
// 					<Table>
// 						<TableHeader>
// 							<TableRow>
// 								<TableHead>Name</TableHead>
// 								<TableHead>Key</TableHead>
// 								<TableHead>Description</TableHead>
// 								<TableHead className="w-24">Type</TableHead>
// 								<TableHead className="w-16" />
// 							</TableRow>
// 						</TableHeader>
// 						<TableBody>
// 							{allAttributes.map((attr) => (
// 								<TableRow key={attr.id}>
// 									<TableCell className="font-medium">
// 										{attr.name}
// 									</TableCell>
// 									<TableCell className="font-mono text-xs">
// 										{attr.key}
// 									</TableCell>
// 									<TableCell className="text-sm text-muted-foreground">
// 										{attr.description}
// 									</TableCell>
// 									<TableCell>
// 										<Badge variant={attr.isDefault ? "default" : "secondary"}>
// 											{attr.isDefault ? "Default" : "Custom"}
// 										</Badge>
// 									</TableCell>
// 									<TableCell>
// 										{!attr.isDefault && (
// 											<Button
// 												variant="ghost"
// 												size="icon"
// 												onClick={() => removeAttribute(attr.id)}
// 											>
// 												<Trash2 className="size-4" />
// 											</Button>
// 										)}
// 									</TableCell>
// 								</TableRow>
// 							))}
// 						</TableBody>
// 					</Table>
// 				</CardContent>
// 			</Card>
//
// 			{/* Add custom attribute */}
// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="text-sm">
// 						Add Custom Attribute
// 					</CardTitle>
// 				</CardHeader>
// 				<CardContent>
// 					<form
// 						onSubmit={(e) => {
// 							e.preventDefault();
// 							addAttribute();
// 						}}
// 						className="grid grid-cols-1 gap-3 sm:grid-cols-4"
// 					>
// 						<Input
// 							value={newName}
// 							onChange={(e) => setNewName(e.target.value)}
// 							placeholder="Display name"
// 							required
// 						/>
// 						<Input
// 							value={newKey}
// 							onChange={(e) => setNewKey(e.target.value)}
// 							placeholder="Attribute key"
// 							required
// 						/>
// 						<Input
// 							value={newDescription}
// 							onChange={(e) =>
// 								setNewDescription(e.target.value)
// 							}
// 							placeholder="Description (optional)"
// 						/>
// 						<Button type="submit">Add Attribute</Button>
// 					</form>
// 				</CardContent>
// 			</Card>
//
// 			{/* Payload viewer dialog */}
// 			<Dialog>
// 				<DialogTrigger asChild>
// 					<Button variant="outline" className="w-fit">
// 						<Eye className="mr-2 size-4" />
// 						View Example Payload
// 					</Button>
// 				</DialogTrigger>
// 				<DialogContent className="max-w-lg">
// 					<DialogHeader>
// 						<DialogTitle>Example IdP Payload</DialogTitle>
// 					</DialogHeader>
// 					<pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
// 						{examplePayload}
// 					</pre>
// 				</DialogContent>
// 			</Dialog>
// 		</div>
// 	);
// }
// ──────────────────────────────────────────────────────────────────────

export default function IdpAttributesPage() {
	return (
		<div className="grid gap-6">
			<div>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-semibold tracking-tight">IdP Attributes</h1>
					<Badge variant="secondary">Coming Soon</Badge>
				</div>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage attribute mappings from identity providers during SSO authentication.
				</p>
			</div>

			<Card className="border-dashed">
				<CardHeader className="items-center text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<UserCog className="size-6 text-muted-foreground" />
					</div>
					<CardTitle className="text-base">Identity Provider Attributes</CardTitle>
					<CardDescription className="max-w-md">
						Map custom attributes from identity provider responses to your user profiles. Configure
						predefined and custom attribute mappings for enterprise SSO connections.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<UserCog className="size-4 text-muted-foreground" />
							<span className="text-sm">Attribute Mapping</span>
						</div>
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<Code2 className="size-4 text-muted-foreground" />
							<span className="text-sm">Custom Attributes</span>
						</div>
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<ArrowLeftRight className="size-4 text-muted-foreground" />
							<span className="text-sm">Field Transform</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						This feature depends on SSO Connections and will be available when enterprise SSO
						launches.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
