import { getConnectionString } from "@netlify/database";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Created lazily so builds don't need a database connection.
export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: getConnectionString() });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
