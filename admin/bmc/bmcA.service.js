const { submitType } = require("@prisma/client");
const prisma = require("../../config/db");

exports.getAllBMCTeams = async (page, limit) => {
  const program = 1;
  const teams = await prisma.team.findMany({
    where: { programId: program },
    include: {
      leader: {
        select: {
          name: true,
        },
      },
      submissionTeam: {
        orderBy: { submittedAt: "desc" },
        select: {
          submittedAt: true,
          type: true,
          Files: {
            select: {
              filePath: true,
            },
          },
        },
      },
      statuscode: {
        select: {
          code: true,
        },
      },
      TeamMember: {
        select: {
          teamId: true, // minimal ID untuk menghitung jumlah member nanti
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
                where: { type: "IDCARD" },
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
      },
    },
    //skip: (page - 1) * limit,
    //take: limit,
  });

  const result = teams.map((team) => {
    const lastSubmission =
      team.submissionTeam.length > 0 ? team.submissionTeam[0] : null;
    const memberCount = team.TeamMember.length;
    const teamMembers = team.TeamMember.map((m) => m.user);
    const membersIdcard = team.TeamMember.map((m) => m.user.Submission);

    return {
      id: team.id,
      name: team.name,
      leader: team.leader.name,
      statusCode: team.statuscode.code,
      lastSubmission,
      teamMembers,
      membersIdcard,
      memberCount,
    };
  });

  return result;
};

exports.getGeneralVerif = async (page, limit) => {
  const program = 1;
  return prisma.team.findMany({
    where: { programId: program },
    include: {
      leader: {
        select: {
          name: true,
        },
      },
      submissionTeam: {
        select: {
          type: true,
          Files: {
            select: {
              filePath: true,
            },
          },
        },
      },
      statuscode: {
        select: {
          code: true,
        },
      },
    },
    //skip: (page - 1) * limit,
    //take: limit,
  });
};

exports.updateTeamStatus = async (teamIds, status) => {
  const statusID = await prisma.status.findUnique({
    where: { code: status },
  });
  if (!statusID) {
    return res
      .status(404)
      .json({ message: `Status dengan code ${status} tidak ditemukan` });
  }
  return await prisma.team.updateMany({
    where: { id: { in: teamIds } },
    data: {
      status: statusID.id,
    },
  });
};

exports.getAllBMCParticipants = async (page, limit) => {
  const program = 1;
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

exports.updateParticipantStatus = async (userIds, status) => {
  const statusID = await prisma.status.findUnique({
    where: { code: status },
  });
  if (!statusID) {
    return res
      .status(404)
      .json({ message: `Status dengan code ${status} tidak ditemukan` });
  }
  const result = await prisma.User.updateMany({
    where: {
      id: { in: userIds },
    },
    data: {
      status: statusID.id,
    },
  });

  return result; // Berisi jumlah yang diupdate
};

exports.postAnnouncementToTeamMembers = async (
  status,
  message,
  title,
  staffId
) => {
  const team = await prisma.team.findMany({
    where: { status },
  });

  const teamId = team.teamId;
  const members = await prisma.TeamMember.findMany({
    where: { teamId: teamId },
  });

  await Promise.all(
    members.map((member) =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          title: title,
          message: message,
          purpose: "ANNOUNCEMENT",
          staffId: staffId,
        },
      })
    )
  );
};

exports.postNotificationToAll = async (message, title, staffId) => {
  const users = await prisma.user.findMany();
  await Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title: title,
          message: message,
          purpose: "NOTIFICATION",
          staffId: staffId,
        },
      })
    )
  );
};

exports.searchTeam = async (keyword) => {
  return await prisma.team.findMany({
    where: {
      OR: [{ name: { contains: keyword } }, { code: { contains: keyword } }],
      programcode: { name: "BMC" },
    },
    include: {
      submissionTeam: {
        select: {
          type: true,
          Files: {
            select: { filePath: true },
          },
        },
      },
      statuscode: true,
    },
  });
};
