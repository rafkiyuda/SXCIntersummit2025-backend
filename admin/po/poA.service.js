const prisma = require("../../config/db");

// PO bisa lihat semua submission dari semua program
async function getAllBMC(page, limit, program) {
  const type = "IDCARD";
  const team = await prisma.team.findMany({
    where: { programId: program },
    select: {
      id: true,
    },
  });
  const teamIds = team.map((t) => t.id);
  return await prisma.TeamMember.findMany({
    where: { teamId: { in: teamIds } },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          birthdate: true,
          domicile: true,
          institution: true,
          institution_name: true,
          wa_number: true,
          line_id: true,
          insta_acc: true,
          Submission: {
            where: { type: type },
            select: {
              Files: {
                select: {
                  filePath: true,
                },
              },
            },
          },
        },
      },
    },
    //skip: (page - 1) * limit,
    //take: limit,
  });
}

module.exports = { getAllBMC };
