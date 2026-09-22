const prisma = require("../../config/db");
// const prisma = require('../config/db');

// fetch semua peserta yang daftar BCL
exports.getParticipants = async (page, limit) => {
  const programCode = 4;
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
            where: { type: { in: ["IDCARD", "TASK", "PROMOTION"] } },
            select: {
              type: true,
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
};

// fetch hasil feedback peserta BCL
exports.getEventFeedback = async () => {
  const feedback = await prisma.addForm.findMany();
  const hearFrom = await prisma.hearFrom.findMany();
  return { feedback, hearFrom };
};

// ngirim announcement ke peserta BCL sesuai status
exports.postAnnouncementToParticipants = async (message, title, staffId) => {
  const programCode = 4;

  const participants = await prisma.seminarReg.findMany({
    where: { programId: programCode },
  });

  const userIds = participants.map((p) => p.userId);

  const members = await prisma.seminarReg.findMany({
    where: { userId: { in: userIds } },
  });

  await Promise.all(
    members.map((member) =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          title,
          message,
          purpose: "ANNOUNCEMENT",
          staffId,
        },
      })
    )
  );
};

// ngirim notifikasi ke semua user
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

exports.searchParticipant = async (keyword, page, limit) => {
  const programId = 4;
  return await prisma.seminarReg.findMany({
    where: {
      programId,
      user: {
        OR: [{ name: { contains: keyword } }, { email: { contains: keyword } }],
      },
    },
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
            where: { type: { in: ["IDCARD", "TASK", "PROMOTION"] } },
            select: {
              type: true,
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
};
