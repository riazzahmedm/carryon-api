import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.deliveryCategory.createMany({
    data: [
      { id: "DOCUMENTS", label: "Documents" },
      { id: "CLOTHING", label: "Clothing" },
      { id: "BOOKS", label: "Books" }
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
