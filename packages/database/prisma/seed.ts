import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL!;
  const password = process.env.SEED_ADMIN_PASSWORD!;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const passwordHash = await argon2.hash(password);

  await prisma.user.upsert({
    where: {
      email: email,
    },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email: email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log("Admin seeded");
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });