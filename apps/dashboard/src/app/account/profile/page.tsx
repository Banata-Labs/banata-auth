"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Skeleton,
	SkeletonCard,
	SkeletonHeader,
	SkeletonInput,
	SkeletonListRow,
} from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import {
	AlertTriangle,
	Check,
	ExternalLink,
	LinkIcon,
	Loader2,
	Mail,
	Pencil,
	Trash2,
	Unlink,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ConnectedAccount {
	id: string;
	providerId: string;
	accountId: string;
	scopes: string[];
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

export default function ProfilePage() {
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user;

	// Edit state
	const [editing, setEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [editImage, setEditImage] = useState("");
	const [saving, setSaving] = useState(false);

	// Email change state
	const [changingEmail, setChangingEmail] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [savingEmail, setSavingEmail] = useState(false);

	// Connected accounts
	const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
	const [loadingAccounts, setLoadingAccounts] = useState(true);

	// Delete account
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [deleting, setDeleting] = useState(false);

	// Image upload ref
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load connected accounts
	useEffect(() => {
		authClient
			.listAccounts()
			.then((res: { data?: unknown }) => {
				if (res.data) {
					setAccounts(res.data as ConnectedAccount[]);
				}
			})
			.catch(() => {
				// silently fail - accounts may not be available
			})
			.finally(() => setLoadingAccounts(false));
	}, []);

	// Sync edit state with session
	useEffect(() => {
		if (user) {
			setEditName(user.name ?? "");
			setEditImage(user.image ?? "");
		}
	}, [user]);

	const startEditing = () => {
		setEditing(true);
		setEditName(user?.name ?? "");
		setEditImage(user?.image ?? "");
	};

	const cancelEditing = () => {
		setEditing(false);
		setEditName(user?.name ?? "");
		setEditImage(user?.image ?? "");
	};

	const handleSaveProfile = useCallback(async () => {
		setSaving(true);
		try {
			const res = await authClient.updateUser({
				name: editName,
				image: editImage || undefined,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to update profile");
			} else {
				toast.success("Profile updated");
				setEditing(false);
			}
		} catch {
			toast.error("Failed to update profile");
		} finally {
			setSaving(false);
		}
	}, [editName, editImage]);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Image must be smaller than 2MB");
			return;
		}
		const reader = new FileReader();
		reader.onloadend = () => {
			setEditImage(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleChangeEmail = useCallback(async () => {
		if (!newEmail) return;
		setSavingEmail(true);
		try {
			const res = await authClient.changeEmail({
				newEmail,
				callbackURL: window.location.href,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to change email");
			} else {
				toast.success("Verification email sent to your new address");
				setChangingEmail(false);
				setNewEmail("");
			}
		} catch {
			toast.error("Failed to change email");
		} finally {
			setSavingEmail(false);
		}
	}, [newEmail]);

	const handleUnlinkAccount = useCallback(async (providerId: string) => {
		try {
			const res = await authClient.unlinkAccount({ providerId });
			if (res.error) {
				toast.error(res.error.message ?? "Failed to unlink account");
			} else {
				setAccounts((prev) => prev.filter((a) => a.providerId !== providerId));
				toast.success(`${providerId} account unlinked`);
			}
		} catch {
			toast.error("Failed to unlink account");
		}
	}, []);

	const handleLinkSocial = useCallback(async (provider: string) => {
		try {
			await authClient.linkSocial({
				provider,
				callbackURL: window.location.href,
			});
		} catch {
			toast.error(`Failed to link ${provider} account`);
		}
	}, []);

	const handleDeleteAccount = useCallback(async () => {
		setDeleting(true);
		try {
			const res = await authClient.deleteUser({
				callbackURL: "/sign-in",
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to delete account");
			} else {
				toast.success("Account deletion initiated. Check your email for confirmation.");
			}
		} catch {
			toast.error("Failed to delete account");
		} finally {
			setDeleting(false);
		}
	}, []);

	if (isPending) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				{/* Avatar + info card */}
				<SkeletonCard lines={0}>
					<div className="flex items-center gap-4">
						<Skeleton className="size-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
					</div>
				</SkeletonCard>
				{/* Email card */}
				<SkeletonCard lines={1} />
				{/* Connected accounts card */}
				<SkeletonCard lines={0}>
					<div className="space-y-3">
						<SkeletonListRow />
						<SkeletonListRow />
					</div>
				</SkeletonCard>
				{/* Delete account card */}
				<SkeletonCard lines={0}>
					<SkeletonInput width="w-[200px]" />
				</SkeletonCard>
			</div>
		);
	}

	if (!user) return null;

	const userInitial = (user.name ?? "U").charAt(0).toUpperCase();
	const socialAccounts = accounts.filter((a) => a.providerId !== "credential");
	const hasPassword = accounts.some((a) => a.providerId === "credential");

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your personal information, connected accounts, and account settings.
				</p>
			</div>

			{/* Profile Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm">Personal Information</CardTitle>
						{!editing && (
							<Button variant="outline" size="sm" onClick={startEditing}>
								<Pencil className="size-3.5" />
								Edit
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{editing ? (
						<div className="space-y-4">
							{/* Avatar upload */}
							<div className="flex items-center gap-4">
								<div className="relative">
									<Avatar className="size-16">
										{editImage ? (
											<img
												src={editImage}
												alt={editName}
												className="size-full rounded-full object-cover"
											/>
										) : (
											<AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
												{editName.charAt(0).toUpperCase() || userInitial}
											</AvatarFallback>
										)}
									</Avatar>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
									>
										<Upload className="size-3" />
									</button>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleImageUpload}
								/>
								{editImage && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setEditImage("")}
										className="text-muted-foreground"
									>
										<X className="size-3.5" />
										Remove
									</Button>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="edit-name">Display name</Label>
								<Input
									id="edit-name"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="Your name"
								/>
							</div>

							<div className="flex gap-2">
								<Button onClick={handleSaveProfile} disabled={saving} size="sm">
									{saving ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Check className="size-3.5" />
											Save
										</>
									)}
								</Button>
								<Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-4">
							<Avatar className="size-16">
								{user.image ? (
									<img
										src={user.image}
										alt={user.name ?? ""}
										className="size-full rounded-full object-cover"
									/>
								) : (
									<AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
										{userInitial}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="space-y-1">
								<p className="text-sm font-medium">{user.name}</p>
								<p className="text-xs text-muted-foreground">{user.email}</p>
								<div className="flex items-center gap-2">
									{user.emailVerified ? (
										<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
											<Check className="mr-0.5 size-2.5" />
											Verified
										</Badge>
									) : (
										<Badge variant="secondary" className="text-[10px] text-amber-400">
											Unverified
										</Badge>
									)}
									{(user as { role?: string }).role && (
										<Badge variant="outline" className="text-[10px] capitalize">
											{(user as { role?: string }).role}
										</Badge>
									)}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Email Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm">Email Address</CardTitle>
							<CardDescription>
								{user.email}
								{user.emailVerified ? " (verified)" : " (unverified)"}
							</CardDescription>
						</div>
						{!changingEmail && (
							<Button variant="outline" size="sm" onClick={() => setChangingEmail(true)}>
								<Mail className="size-3.5" />
								Change email
							</Button>
						)}
					</div>
				</CardHeader>
				{changingEmail && (
					<CardContent>
						<div className="space-y-3">
							<div className="grid gap-2">
								<Label htmlFor="new-email">New email address</Label>
								<Input
									id="new-email"
									type="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									placeholder="new@example.com"
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								A verification email will be sent to your new address. Your email will not change
								until you verify it.
							</p>
							<div className="flex gap-2">
								<Button onClick={handleChangeEmail} disabled={savingEmail || !newEmail} size="sm">
									{savingEmail ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Sending...
										</>
									) : (
										"Send verification"
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setChangingEmail(false);
										setNewEmail("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			{/* Connected Accounts */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Connected Accounts</CardTitle>
					<CardDescription>Manage your linked social accounts and sign-in methods.</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingAccounts ? (
						<div className="space-y-3">
							<SkeletonListRow />
							<SkeletonListRow />
						</div>
					) : (
						<div className="space-y-3">
							{/* Credential account */}
							<div className="flex items-center justify-between rounded-lg border px-4 py-3">
								<div className="flex items-center gap-3">
									<Mail className="size-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium">Email & Password</p>
										<p className="text-xs text-muted-foreground">
											{hasPassword ? "Password set" : "No password — set one in Security"}
										</p>
									</div>
								</div>
								<Badge
									className={
										hasPassword
											? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
											: "text-muted-foreground"
									}
									variant={hasPassword ? "default" : "secondary"}
								>
									{hasPassword ? "Connected" : "Not set"}
								</Badge>
							</div>

							{/* Social accounts */}
							{socialAccounts.map((account) => (
								<div
									key={account.id}
									className="flex items-center justify-between rounded-lg border px-4 py-3"
								>
									<div className="flex items-center gap-3">
										<ExternalLink className="size-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium capitalize">{account.providerId}</p>
											<p className="text-xs text-muted-foreground">{account.accountId}</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-red-400"
										onClick={() => handleUnlinkAccount(account.providerId)}
									>
										<Unlink className="size-3.5" />
										Unlink
									</Button>
								</div>
							))}

							{/* Link new account */}
							<Separator />
							<div className="flex flex-wrap gap-2 pt-1">
								<p className="text-xs text-muted-foreground w-full mb-1">Link a new account:</p>
								{["github", "google"].map((provider) => {
									const alreadyLinked = socialAccounts.some((a) => a.providerId === provider);
									return (
										<Button
											key={provider}
											variant="outline"
											size="sm"
											disabled={alreadyLinked}
											onClick={() => handleLinkSocial(provider)}
											className="capitalize"
										>
											<LinkIcon className="size-3.5" />
											{alreadyLinked ? `${provider} linked` : `Link ${provider}`}
										</Button>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Account */}
			<Card className="border-red-500/20">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="size-4 text-red-400" />
						<CardTitle className="text-sm text-red-400">Delete Account</CardTitle>
					</div>
					<CardDescription>
						Permanently delete your account and all associated data. This action cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="grid gap-2">
							<Label htmlFor="delete-account-confirm" className="text-xs text-muted-foreground">
								Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
							</Label>
							<Input
								id="delete-account-confirm"
								value={deleteConfirm}
								onChange={(e) => setDeleteConfirm(e.target.value)}
								placeholder="DELETE"
								className="max-w-[200px]"
							/>
						</div>
						<Button
							variant="destructive"
							size="sm"
							disabled={deleteConfirm !== "DELETE" || deleting}
							onClick={handleDeleteAccount}
						>
							{deleting ? (
								<>
									<Loader2 className="size-3.5 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="size-3.5" />
									Delete my account
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
