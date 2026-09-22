const { PrismaClient, regType } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendEmail } = require("../../utils/SendEmail");
const { composeEmail } = require("../../constants/email");

const findProgramByName = async (name) => {
  return await prisma.program.findFirst({
    where: { name },
  });
};

async function getAnnouncement(userId) {
  const division = 5; // Chambers division
  return await prisma.notification.findMany({
    where: {
      userId: userId,
      purpose: "ANNOUNCEMENT",
      staff: { divisionId: division },
    },
    select: {
      id: true,
      title: true,
      message: true,
    },
  });
}

async function alreadyRead(userId, notifId) {
  return await prisma.notification.updateMany({
    where: { userId: userId, id: notifId },
    data: {
      isRead: true,
    },
  });
}

async function userAnswer(data) {
  return await prisma.addForm.create({
    data: {
      userId: data.userId,
      programId: data.programId,
      registrationId: data.registrationId,
      commitment: data.commitment,
      consent: data.consent,
      concerns: data.concerns,
      linkedin: data.linkedin,
      question: data.question,
      specificMaterial: data.specificMaterial,
    },
  });
}

async function hearFrom(
  userId,
  programId,
  insta,
  fb,
  twit,
  friends,
  family,
  other
) {
  return await prisma.hearFrom.create({
    data: {
      userId,
      programId,
      instagram: insta,
      facebook: fb,
      twitter: twit,
      friends: friends,
      family: family,
      other: other,
    },
  });
}

async function joinSeminar(userId, programId, day) {
  return await prisma.seminarReg.create({
    data: {
      userId: userId,
      programId: programId,
      type: regType[day],
    },
  });
}

async function alreadyJoined(userId, programId, day) {
  return await prisma.seminarReg.findFirst({
    where: {
      userId,
      programId,
      type: regType[day],
    },
  });
}

async function cancelJoin(userId, programId, day) {
  return await prisma.seminarReg.deleteMany({
    where: {
      userId,
      programId,
      type: regType[day],
    },
  });
}

async function deleteUserAnswer(userId, programId, registrationId) {
  return await prisma.addForm.deleteMany({
    where: {
      userId: userId,
      programId: programId,
      registrationId: registrationId,
    },
  });
}

async function findUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

async function generateTicket(data) {
  const payload = JSON.stringify({
    id: data.id,
    name: data.name,
    program: data.program,
    timestamp: new Date().toISOString(),
  });
  return payload;
}

async function sendEmailChambers(userId, link, qrcode) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const html = await composeEmail({
    title: "Welcome to Chambers", // Judul untuk <title> tag dan header email
    bodyBlocks: [
      { type: "paragraph", text: `Dear ${user.name},` },
      {
        type: "paragraph",
        text: "Thank you for registering for Chambers 2025, a two-day offline career exploration event across Banking, Consulting, FMCG, and StartUp industries.",
      },
      {
        type: "paragraph",
        text: "Through expert-led sessions, career prep classes, CV & LinkedIn reviews, case studies, panel discussions, and networking spaces, you’ll gain practical insights and direct engagement with professionals to boost your career journey!",
      },

      {
        type: "paragraph",
        text: "To stay updated and receive all event information, please join our official WhatsApp Group here:",
      },
      {
        type: "paragraph",
        text: `${link}`,
      },
      {
        type: "paragraph",
        text: "We’re excited to see you at Chambers 2025 and can’t wait to start this journey together ",
      },
      { type: "paragraph", text: "Best regards," },
      {
        type: "paragraph",
        text: "<b>StudentsxCEOs International Summit 2025</b>",
      },
    ],
  });
  return await sendEmail(
    user.email,
    "[Confirmation] – Successful Registration of StudentsxCEOs InterSummit 2025 CHAMBERS",
    html
  );
}

async function testEmail(userId, qrcode) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const html = await composeEmail({
    title: "Welcome to Chambers",
    bodyBlocks: [
      { type: "paragraph", text: `Dear ${user.name},` },
      {
        type: "paragraph",
        text: "Thank you for registering for Chambers 2025, a two-day offline career exploration event across Banking, Consulting, FMCG, and StartUp industries.",
      },
      {
        type: "paragraph",
        text: "Through expert-led sessions, career prep classes, CV & LinkedIn reviews, case studies, panel discussions, and networking spaces, you’ll gain practical insights and direct engagement with professionals to boost your career journey!",
      },
      {
        type: "paragraph",
        text: "To stay updated and receive all event information, please join our official WhatsApp Group here:",
      },
      {
        type: "paragraph",
        text: "https://chat.whatsapp.com/KGk3wYJH8mY6m4b0gRk1bE",
      },
      {
        type: "image",
        src: qrcode,
        alt: "QR Code",
      },
      {
        type: "paragraph",
        text: "We’re excited to see you at Chambers 2025 and can’t wait to start this journey together ",
      },
      { type: "paragraph", text: "Best regards," },
      {
        type: "paragraph",
        text: "<b>StudentsxCEOs International Summit 2025</b>",
      },
    ],
  });
  return await sendEmail(user.email, "testing Email", html);
}

module.exports = {
  findProgramByName,
  findProgramByName,
  getAnnouncement,
  alreadyRead,
  sendEmailChambers,
  userAnswer,
  hearFrom,
  joinSeminar,
  alreadyJoined,
  cancelJoin,
  findUserById,
  deleteUserAnswer,
  generateTicket,
  testEmail,
};
