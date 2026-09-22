const prisma = require("../../config/db");
const crypto = require("crypto");
const { sendEmail } = require("../../utils/SendEmail");
const { composeEmail } = require("../../constants/email");

function generateTeamCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function isCodeUnique(code) {
  const exists = await prisma.team.findUnique({ where: { code } });
  return !exists;
}

const findProgramByName = async (name) => {
  return await prisma.program.findFirst({ where: { name } });
};

const checkLeader = async (userId, programId) => {
  const existing = await prisma.team.findFirst({
    where: { leaderId: userId, programId },
    select: { id: true },
  });
  return !!existing;
};

const checkAlreadyMember = async (userId, programId) => {
  return await prisma.TeamMember.findFirst({
    where: { userId, team: { programId } },
    include: { team: true },
  });
};

const checkTeamName = async (name) => {
  return await prisma.team.findFirst({ where: { name } });
};

const findMember = async (userId, teamId) => {
  return await prisma.TeamMember.findFirst({ where: { userId, teamId } });
};

const findTeamByCode = async (code, programId) => {
  return await prisma.team.findUnique({
    where: { code: code, programId: programId },
  });
};

async function teamLimitCheck(teamId, capacity) {
  const count = await prisma.TeamMember.count({ where: { teamId } });
  return count < capacity;
}

async function joinTeam(userId, teamId) {
  return await prisma.TeamMember.create({
    data: {
      userId: userId,
      teamId: teamId,
      role: "MEMBER",
    },
  });
}

const createTeam = async (data) => {
  return await prisma.team.create({ data });
};

async function getTeamMembers(teamId) {
  return await prisma.teamMember.findMany({
    where: { teamId: teamId },
    select: {
      role: true,
      user: {
        select: { id: true, name: true, email: true, institution: true },
      },
    },
  });
}

async function getTeamDetail(teamId) {
  return await prisma.team.findUnique({ where: { id: teamId } });
}

async function joinIndvidual(data) {
  return await prisma.tempIndividu.create({ data });
}

async function getAnnouncement(userId) {
  const division = 3; // IBPC
  return await prisma.notification.findMany({
    where: { userId, purpose: "ANNOUNCEMENT", staff: { divisionId: division } },
    select: { id: true, title: true, message: true, createdAt: true },
  });
}

async function alreadyRead(userId, notifId) {
  return await prisma.notification.updateMany({
    where: { userId, id: notifId },
    data: { isRead: true },
  });
}

async function sendEmailRegistIBPC(userId, teamName) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const html = await composeEmail({
    title: "Welcome to International Business Plan Competition (IBPC)", // Judul untuk <title> tag dan header email
    bodyBlocks: [
      { type: "paragraph", text: `Dear ${teamName},` },
      {
        type: "paragraph",
        text: "Thank you for registering! We are delighted to confirm your team registration in the International Business Plan Competition (IBPC) at SxC International Summit 2025. ✅",
      },
      {
        type: "paragraph",
        text: "You are now officially registered as a participant in this year’s competition, joining an inspiring community of future innovators and entrepreneurs. 🚀",
      },
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
        text: "Important:",
      },
      {
        type: "list",
        items: [
          "Kindly make a copy of the file before editing.",
          "Please use this template for your submission to ensure consistency.",
          "You will also receive further details on the competition timeline, mentoring, and coaching sessions via email. Make sure to check your inbox regularly for updates.",
        ],
      },

      {
        type: "paragraph",
        text: "Should you have any questions, feel free to contact us:<br/> <b>📞 Chika (08817968217) <br/>📞 Pavita (081298852907)</b>",
      },
      {
        type: "paragraph",
        text: "We look forward to seeing your ideas shine at the competition!",
      },
      {
        type: "paragraph",
        text: "Warm regards, <br/>International Business Plan Competition (IBPC)<br/>SxC International Summit 2025 Team",
      },
    ],
  });
  return await sendEmail(
    user.email,
    "Registration Confirmation – IBPC SxC International Summit 2025 🎉",
    html
  );
}

async function sendEmailCaseIBPC(userId, caseLink) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const html = `<p>Link Case IBCC </br> <strong>${caseLink}</strong></p>`;
  return await sendEmail(user.email, "Link Case IBCC", html);
}

async function deleteUserfromTeam(userId, teamId) {
  return await prisma.teamMember.deleteMany({
    where: { userId, teamId },
  });
}

async function deleteTeam(teamId) {
  await prisma.TeamMember.deleteMany({ where: { teamId: teamId } });
  return await prisma.team.deleteMany({
    where: { id: teamId },
  });
}

async function changeTeamStatus(teamId, status) {
  return await prisma.team.update({
    where: { id: teamId },
    data: { status: status },
  });
}

module.exports = {
  generateTeamCode,
  isCodeUnique,
  findProgramByName,
  checkLeader,
  checkAlreadyMember,
  checkTeamName,
  findMember,
  findTeamByCode,
  teamLimitCheck,
  joinTeam,
  createTeam,
  getTeamMembers,
  joinIndvidual,
  getAnnouncement,
  alreadyRead,
  sendEmailRegistIBPC,
  deleteUserfromTeam,
  deleteTeam,
  changeTeamStatus,
  getTeamDetail,
};
