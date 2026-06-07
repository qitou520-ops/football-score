import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@football.com" },
    update: {},
    create: {
      email: "admin@football.com",
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });

  await prisma.adSlot.upsert({
    where: { name: "homepage-top-default" },
    update: {},
    create: {
      name: "homepage-top-default",
      title: "首页顶部广告",
      position: "homepage-top",
      provider: "custom",
      htmlCode: "",
      linkUrl: "https://example.com",
      active: false,
      priority: 1,
    },
  });

  console.log("Seed completed. Admin: admin@football.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
