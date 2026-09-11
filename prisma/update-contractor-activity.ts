import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const count = await prisma.$executeRaw`
      UPDATE "Contractor"
      SET "mostRecentlyActive" = CURRENT_TIMESTAMP -
        (RANDOM() * INTERVAL '15 days')
    `;

    console.log(`Updated mostRecentlyActive for ${count} contractors.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
