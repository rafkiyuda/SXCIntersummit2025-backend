require("dotenv").config();
const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("Seeding database...");

  // 1. Statuses
  const statuses = [
    { id: 1, code: "0", description: "Peserta REGISTERED Data Diri BELUM LENGKAP" },
    { id: 2, code: "1", description: "Peserta REGISTERED Data Diri LENGKAP" },
    { id: 3, code: "2", description: "Proof of Promotion VALID" },
    { id: 4, code: "3", description: "Proof of Promotion TIDAK VALID" },
    { id: 5, code: "4", description: "Proof of Promotion VALID Payment VALID" },
    { id: 6, code: "5", description: "Proof of Promotion VALID Payment TIDAK VALID" },
    { id: 7, code: "6", description: "Proof of Promotion TIDAK VALID Payment VALID" },
    { id: 8, code: "7", description: "Proof of Promotion TIDAK VALID Payment TIDAK VALID" },
    { id: 9, code: "8", description: "BUFFER/Buat Project Tanda Submission Tim Sudah Direview" },
    { id: 10, code: "9", description: "TIDAK LOLOS ke Semifinal" },
    { id: 11, code: "10", description: "LOLOS ke Semifinal" },
    { id: 12, code: "11", description: "TIDAK LOLOS ke Final" },
    { id: 13, code: "12", description: "LOLOS ke Final" },
    { id: 14, code: "13", description: "Jumlah Peserta Mencukupi" },
    { id: 15, code: "14", description: "Team Tidak Valid" },
  ];

  for (const st of statuses) {
    await prisma.status.upsert({
      where: { id: st.id },
      update: { code: st.code, description: st.description },
      create: st,
    });
  }
  console.log("Statuses seeded.");

  // 2. Divisions
  const divisions = [
    { id: 1, name: "BMC" },
    { id: 2, name: "IBCC" },
    { id: 3, name: "IBPC" },
    { id: 4, name: "BCL" },
    { id: 5, name: "CHAMBERS" },
    { id: 6, name: "COMPANYVISIT" },
    { id: 7, name: "IC" },
    { id: 8, name: "IT" },
    { id: 9, name: "PO" },
  ];

  for (const div of divisions) {
    await prisma.division.upsert({
      where: { id: div.id },
      update: { name: div.name },
      create: div,
    });
  }
  console.log("Divisions seeded.");

  // 3. Programs
  const programs = [
    { id: 1, name: "BMC", type: "COMPETITION" },
    { id: 2, name: "IBPC", type: "COMPETITION" },
    { id: 3, name: "IBCC", type: "COMPETITION" },
    { id: 4, name: "BCL", type: "EVENT" },
    { id: 5, name: "CHAMBERS", type: "EVENT" },
    { id: 6, name: "COMPANYVISIT", type: "EVENT" },
    { id: 7, name: "IC", type: "EVENT" },
  ];

  for (const pr of programs) {
    await prisma.program.upsert({
      where: { id: pr.id },
      update: { name: pr.name, type: pr.type },
      create: pr,
    });
  }
  console.log("Programs seeded.");

  // 4. Dummy User
  const hashedPassword = await bcrypt.hash("password123", 10);
  const dummyUser = await prisma.user.upsert({
    where: { email: "dummy@user.com" },
    update: {
      name: "Dummy User",
      password: hashedPassword,
      status: 1,
      role: "USER",
    },
    create: {
      name: "Dummy User",
      email: "dummy@user.com",
      password: hashedPassword,
      status: 1,
      role: "USER",
    },
  });
  console.log("Dummy user created:", dummyUser.email);

  // 5. Dummy Admin (Staff)
  const dummyStaff = await prisma.staff.upsert({
    where: { email: "dummy@admin.com" },
    update: {
      name: "Dummy Admin",
      password: hashedPassword,
      role: "ADMIN",
      divisionId: 8, // IT
    },
    create: {
      name: "Dummy Admin",
      email: "dummy@admin.com",
      password: hashedPassword,
      role: "ADMIN",
      divisionId: 8, // IT
    },
  });
  console.log("Dummy staff created:", dummyStaff.email);

  console.log("Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
