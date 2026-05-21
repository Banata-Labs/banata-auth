import { sqlite } from "./client";

sqlite.exec("DELETE FROM ticket_comments;");
sqlite.exec("DELETE FROM tickets;");
sqlite.exec("DELETE FROM organization_roles;");

console.log("Example app SQLite data cleared.");
