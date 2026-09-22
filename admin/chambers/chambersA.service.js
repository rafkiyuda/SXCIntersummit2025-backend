const prisma = require("../../config/db");
const ExcelJS = require("exceljs");
// sesuaikan programId sesuai yang ada di tabel Program (sxcinter25.sql)
const programCode = 5;

// fetch semua peserta Chambers (bisa sort by chosen day)
exports.getParticipants = async (page, limit, sort) => {
  const filter = { programId: programCode };

  if (sort) {
    filter.type = { in: [sort] };
  }

  return await prisma.seminarReg.findMany({
    where: filter,
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
            where: {
              AND: [
                { programId: programCode },
                { type: { in: ["IDCARD", "CV", "TASK", "PROMOTION"] } },
              ],
            },
            select: {
              event: true,
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

// fetch hasil feedback peserta Chambers
exports.getEventFeedback = async () => {
  const feedback = await prisma.addForm.findMany({
    where: { programId: programCode },
    select: {
      id: true,
      userId: true,
      linkedin: true,
      question: true,
      concerns: true,
      specificMaterial: true,
    },
  });
  const hearFrom = await prisma.hearFrom.findMany({
    where: { programId: programCode },
  });
  return { feedback, hearFrom };
};

// ngirim announcement ke peserta Chambers
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

// Search peserta Chambers by keyword
exports.searchParticipant = async (keyword, page, limit) => {
  return await prisma.seminarReg.findMany({
    where: {
      programId: programCode,
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

exports.getAllChambersData = async () => {
  return await prisma.seminarReg.findMany({
    where: { programId: programCode },
    include: {
      user: {
        select: {
          name: true,
          email: true,
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
      submission: {
        where: { type: { in: ["CV"] } },
        select: {
          type: true,
          Files: {
            select: { filePath: true },
          },
        },
      },
      addForm: {
        where: { programId: programCode },
        select: {
          userId: true,
          linkedin: true,
          question: true,
          concerns: true,
          specificMaterial: true,
        },
      },
    },
  });
};

exports.exportDataToExcel = async () => {
  // 1. Ambil data dari database
  const data = await this.getAllChambersData();

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
    { header: "CV", key: "cvFilePath", width: 30 },
    { header: "LinkedIn", key: "linkedin", width: 30 },
    { header: "Question", key: "question", width: 30 },
    { header: "Concerns", key: "concerns", width: 30 },
    { header: "Specific Material", key: "specificMaterial", width: 30 },
    // sesuaikan dengan field data kamu
  ];

  // 4. Masukkan data per baris
  data.forEach((item) => {
    // Ambil filePath dari Submission bertipe "CV"
    let cvFilePath = "";
    if (item.submission && item.submission.length > 0) {
      // Ambil filePath file pertama jika ada
      if (item.submission[0].Files && item.submission[0].Files.length > 0) {
        cvFilePath = item.submission[0].Files[0].filePath;
      }
    }

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
      cvFilePath, // ini yang kita tambahkan sebagai kolom CV
      linkedin: item.addForm[0]?.linkedin,
      question: item.addForm[0]?.question,
      concerns: item.addForm[0]?.concerns,
      specificMaterial: item.addForm[0]?.specificMaterial,
    });
  });

  // 5. Export ke buffer XLSX
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer; // buffer ini yang nanti dikirim ke FE sebagai file
};
