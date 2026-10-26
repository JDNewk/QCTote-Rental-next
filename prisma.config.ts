import { defineConfig } from "prisma/config";

// Migrations live in netlify/database/migrations so Netlify applies them
// automatically on each deploy. The connection string is only needed for
// CLI commands that talk to the database; `prisma generate` works without it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "netlify/database/migrations",
  },
  datasource: {
    url: process.env.NETLIFY_DB_URL ?? "",
  },
});
