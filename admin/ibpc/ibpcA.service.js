const prisma = require("../../config/db");
const ExcelJS = require("exceljs");
const { sendEmail } = require("../../utils/SendEmail");
const { composeEmail } = require("../../constants/email");
const cron = require("node-cron");

exports.getAllIBPCTeams = async (page, limit) => {
  const program = 2;
  const teams = await prisma.team.findMany({
    where: { programId: program },
    include: {
      leader: {
        select: {
          name: true,
        },
      },
      submissionTeam: {
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
    // const lastSubmission =
    //   team.submissionTeam.length > 0 ? team.submissionTeam[0] : null;
    const memberCount = team.TeamMember.length;
    const teamMembers = team.TeamMember.map((m) => m.user);
    const membersIdcard = team.TeamMember.map((m) => m.user.Submission);

    return {
      id: team.id,
      name: team.name,
      leader: team.leader.name,
      statusCode: team.status,
      submissionTeam: team.submissionTeam,
      teamMembers,
      membersIdcard,
      memberCount,
    };
  });

  return result;
};

exports.getTeambyId = async (teamIds) => {
  return prisma.team.findMany({
    where: { id: { in: teamIds } },
  });
};

exports.getGeneralVerif = async (page, limit) => {
  const program = 2;
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
  // const statusID = await prisma.status.findUnique({
  //   where: { code: status },
  // });
  // if (!statusID) {
  //   return res
  //     .status(404)
  //     .json({ message: `Status dengan code ${status} tidak ditemukan` });
  // }
  return await prisma.team.updateMany({
    where: { id: { in: teamIds } },
    data: {
      status: status,
    },
  });
};

exports.getAllIBPCParticipants = async (page, limit) => {
  const program = 2;
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
      team: {
        select: {
          name: true,
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

// exports.getUserprogramById = async (userIds) => {
//   const programId = 3;
//   const program = await prisma.team.findMany({
//     where: { programId: programId },
//   });
//   return users.map((user) => user.program);
// };

exports.postAnnouncementToTeamMembers = async (
  status,
  message,
  title,
  staffId
) => {
  const program = 2;
  const team = await prisma.team.findMany({
    where: { status, programId: program },
  });

  const teamId = team.id;
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

/**
 * untuk post announcement ke all participants dia cuman butuh message, title, staffId udh gak butuh status lagi
 *
 */
exports.postAnnouncementToAll = async (message, title, staffId) => {
  const program = 3;
  const teams = await prisma.team.findMany({
    where: { programId: program },
  });
  const participant = await prisma.teamMember.findMany({
    where: { teamId: { in: teams.map((team) => team.id) } },
  });
  await Promise.all(
    participant.map((teamMember) =>
      prisma.notification.create({
        data: {
          userId: teamMember.userId,
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

exports.searchTeam = async (keyword, page, limit) => {
  const program = 2;
  const teams = await prisma.team.findMany({
    where: {
      OR: [{ name: { contains: keyword } }, { code: { contains: keyword } }],
      programId: program,
    },
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

exports.getTeambyStatus = async (status) => {
  const program = 2;
  return await prisma.team.findMany({
    where: { programId: program, status: status },
  });
};

exports.getAllIbpcData = async () => {
  const program = 2;
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
      team: {
        select: {
          name: true,
          submissionTeam: {
            select: {
              submittedAt: true,
              stage: true,
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

exports.exportDataToExcel = async () => {
  // 1. Ambil data dari database
  const data = await this.getAllIbpcData();

  // 2. Buat workbook baru
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("DataExport");

  // 3. Tambahkan header kolom
  worksheet.columns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Birthdate", key: "birthdate", width: 30 },
    { header: "Domicile", key: "domicile", width: 30 },
    { header: "Institution", key: "institution", width: 30 },
    { header: "Institution Name", key: "institution_name", width: 30 },
    { header: "ID card", key: "idcardFilePath", width: 30 },
    { header: "WhatsApp", key: "wa_number", width: 20 },
    { header: "Line ID", key: "line_id", width: 20 },
    { header: "Instagram", key: "insta_acc", width: 20 },
    { header: "Team Name", key: "team_name", width: 30 },
    { header: "Preelim Promotion ", key: "preelim_promo", width: 30 },
    { header: "Preelim Task ", key: "preelim_task", width: 30 },
    { header: "Semifinal Promotion ", key: "semifinal_promo", width: 30 },
    { header: "Semifinal Task ", key: "semifinal_task", width: 30 },
    { header: "Final Promotion ", key: "final_promo", width: 30 },
    // tambahkan kolom lain sesuai kebutuhan
    // sesuaikan dengan field data kamu
  ];

  // 4. Masukkan data per baris
  data.forEach((item) => {
    // Ambil filePath dari Submission bertipe "IDCARD"
    let idcardFilePath = "";
    if (item.user.Submission && item.user.Submission.length > 0) {
      // Ambil filePath file pertama jika ada
      if (
        item.user.Submission[0].Files &&
        item.user.Submission[0].Files.length > 0
      ) {
        idcardFilePath = item.user.Submission[0].Files[0].filePath;
      }
    }

    // Ambil filePath dari submissionTeam berdasarkan stage dan type
    submissionMap = {
      PREELIM_PROMOTION: "",
      PREELIM_TASK: "",
      SEMIFINAL_PROMOTION: "",
      SEMIFINAL_TASK: "",
      FINAL_PROMOTION: "",
    };

    item.team.submissionTeam.forEach((submission) => {
      const key = `${submission.stage}_${submission.type}`;
      if (submissionMap.hasOwnProperty(key)) {
        submissionMap[key] =
          submission.Files.length > 0 ? submission.Files[0].filePath : "";
      }
    });

    worksheet.addRow({
      name: item.user.name,
      email: item.user.email,
      birthdate: item.user.birthdate,
      domicile: item.user.domicile,
      institution: item.user.institution,
      institution_name: item.user.institution_name,
      idcardFilePath, // ini yang kita tambahkan sebagai kolom ID card
      wa_number: item.user.wa_number,
      line_id: item.user.line_id,
      insta_acc: item.user.insta_acc,
      team_name: item.team.name,
      preelim_promo: submissionMap.PREELIM_PROMOTION,
      preelim_task: submissionMap.PREELIM_TASK,
      semifinal_promo: submissionMap.SEMIFINAL_PROMOTION,
      semifinal_task: submissionMap.SEMIFINAL_TASK,
      final_promo: submissionMap.FINAL_PROMOTION,
    });
  });

  // 5. Export ke buffer XLSX
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer; // buffer ini yang nanti dikirim ke FE sebagai file
};

exports.getAllIBPCforEmail = async (page, limit) => {
  const program = 2;
  const type = "IDCARD";
  const team = await prisma.team.findMany({
    where: {
      programId: program,
      createdAt: { gt: new Date("2025-09-29T00:00:00Z") },
    },
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
      team: {
        select: {
          name: true,
        },
      },
    },
    //skip: (page - 1) * limit,
    //take: limit,
  });
};

// // dibawah ini adalah scheduler untuk mengirim email case ibpc di tanggal 29/09/2025
async function sendEmailCaseIBPC(teamName) {
  const emailSubject =
    "Business Model Canvas (BMC) Template – IBPC SxC International Summit 2025 📝";

  const emailTemplateHtml = await composeEmail({
    title: "Business Model Canvas (BMC) Template", // Judul untuk <title> tag dan header email
    bodyBlocks: [
      { type: "paragraph", text: `Dear ${teamName},` },
      {
        type: "paragraph",
        text: "As part of your participation in the International Business Plan Competition (IBPC) at SxC International Summit 2025, please find the official Business Model Canvas (BMC) template through the following link:",
      },
      {
        type: "paragraph",
        text: "👉 <a href='bit.ly/IntersummitIBPCtemplate'>Business Model Canvas (BMC) Template</a> <br/> bit.ly/IntersummitIBPCtemplate",
      },
      {
        type: "paragraph",
        text: "Important: <br/> Kindly make a copy of the file before editing. <br/> Please use this template for your submission to ensure consistency. <br/> You will also receive further details on the competition timeline, mentoring, and coaching sessions via email. Make sure to check your inbox regularly for updates.",
      },

      {
        type: "paragraph",
        text: "Should you have any questions, feel free to contact us:<br/> <b>📞 Chika (08817968217) <br/>📞 Pavita (081298852907)</b>",
      },
      {
        type: "paragraph",
        text: "We’re excited to see your innovative ideas take shape! 🚀",
      },
      { type: "paragraph", text: "Warm regards," },
      {
        type: "paragraph",
        text: "International Business Plan Competition (IBPC)",
      },
      { type: "paragraph", text: "<b>SxC International Summit 2025 Team</b>" },
    ],
  });
  return { emailSubject, emailTemplateHtml };
}

// // Jadwalkan pengiriman email
const scheduleString = "30 17 5 10 *"; // menyesuaikan 5 Okt jam 17 WIB

cron.schedule(
  scheduleString,
  async () => {
    console.log("Running scheduled email blast for IBPC participants...");

    try {
      const now = new Date();
      const year = now.getFullYear();

      if (year !== 2025) {
        console.log("Skipping email blast, not the year 2025.");
        return;
      }
      const participants = await this.getAllIBPCforEmail();
      for (const participant of participants) {
        const email = await sendEmailCaseIBPC(participant.team.name);
        const emailSubject = email.emailSubject;
        const htmlContent = email.emailTemplateHtml;
        await sendEmail(participant.user.email, emailSubject, htmlContent);
      }

      console.log(`Sent emails to ${participants.length} participants.`);
    } catch (error) {
      console.error("Error sending scheduled emails:", error);
    }
  },
  {
    timezone: "Asia/Jakarta",
  }
);

console.log("Cron scheduler set for 5 Oct 2025, 17:00 WIB");
