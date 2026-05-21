import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizationRoles = sqliteTable(
	"organization_roles",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id").notNull(),
		userId: text("user_id").notNull(),
		role: text("role").notNull(),
		createdAt: integer("created_at", { mode: "number" }).notNull(),
		updatedAt: integer("updated_at", { mode: "number" }).notNull(),
	},
	(table) => ({
		organizationUserIdx: uniqueIndex("organization_roles_org_user_idx").on(
			table.organizationId,
			table.userId,
		),
	}),
);

export const tickets = sqliteTable("tickets", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull(),
	priority: text("priority").notNull(),
	createdByUserId: text("created_by_user_id").notNull(),
	createdByName: text("created_by_name").notNull(),
	createdByImage: text("created_by_image"),
	assigneeUserId: text("assignee_user_id"),
	assigneeName: text("assignee_name"),
	assigneeImage: text("assignee_image"),
	createdAt: integer("created_at", { mode: "number" }).notNull(),
	updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});

export const ticketComments = sqliteTable("ticket_comments", {
	id: text("id").primaryKey(),
	ticketId: text("ticket_id")
		.notNull()
		.references(() => tickets.id, { onDelete: "cascade" }),
	authorUserId: text("author_user_id").notNull(),
	authorName: text("author_name").notNull(),
	authorImage: text("author_image"),
	body: text("body").notNull(),
	createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const ticketsRelations = relations(tickets, ({ many }) => ({
	comments: many(ticketComments),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
	ticket: one(tickets, {
		fields: [ticketComments.ticketId],
		references: [tickets.id],
	}),
}));

export const bootstrapStatements = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS organization_roles (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS organization_roles_org_user_idx
  ON organization_roles (organization_id, user_id);

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    created_by_name TEXT NOT NULL,
    created_by_image TEXT,
    assignee_user_id TEXT,
    assignee_name TEXT,
    assignee_image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_comments (
    id TEXT PRIMARY KEY NOT NULL,
    ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_user_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_image TEXT,
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;
