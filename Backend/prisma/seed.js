// seed.js
const prisma = require("./prismaClient")
const bcrypt = require("bcrypt");
async function main() {


  // Create an Admin user
  const hashedPassword = await bcrypt.hash("admin", 5);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "Admin",
      groupId: null,
    },
  });

  // Create Groups
  await prisma.group.createMany({
    data: [
      {
        name: "قسم الشكاوى",
      },
      {
        name: "قسم الإسكان",
      },
    ],
  });

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
