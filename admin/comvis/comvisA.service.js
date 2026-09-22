const prisma = require("../../config/db");

// *** IMPORTANT: Company Visit programId = 6 ***
const programCode = 6;

// fetch participants for ComVis (sorted by company)
exports.getParticipants = async (page, limit) => {
  return await prisma.seminarReg.findMany({
    where: { programId: programCode },
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
            where: { type: { in: ["IDCARD", "TASK", "PROMOTION", "PAYMENT"] } },
            select: {
              type: true,
              Files: {
                select: { filePath: true },
              },
            },
          },
        },
      },
    },
    orderBy: { user: { institution_name: "asc" } }, // urut berdasarkan nama institusi/perusahaan
    skip: (page - 1) * limit,
    take: limit,
  });
};

// get additional form answers
exports.getEventFeedback = async () => {
  const feedback = await prisma.addForm.findMany();
  const hearFrom = await prisma.hearFrom.findMany();
  return { feedback, hearFrom };
};

// send announcement to ComVis participants
exports.postAnnouncementToParticipants = async (message, title, staffId) => {
  const participants = await prisma.seminarReg.findMany({
    where: { programId: programCode },
  });

  const userIds = participants.map((p) => p.userId);

  await Promise.all(
    userIds.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          title,
          message,
          purpose: "ANNOUNCEMENT",
          staffId,
        },
      })
    )
  );
};

// send notification to all users
exports.postNotificationToAll = async (message, title, staffId) => {
  const users = await prisma.user.findMany();
  await Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          purpose: "NOTIFICATION",
          staffId,
        },
      })
    )
  );
};
