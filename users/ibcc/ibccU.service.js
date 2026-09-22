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
  return await prisma.team.findUnique({ where: { code, programId } });
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
        select: {
          id: true,
          name: true,
          email: true,
          institution: true,
          status: true,
        },
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
  const division = 2; // IBCC
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

async function sendEmailRegistIBCC(userId, teamName) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const html = await composeEmail({
    title: "Welcome to International Business Case Competition (IBCC)", // Judul untuk <title> tag dan header email
    bodyBlocks: [
      { type: "paragraph", text: `Dear ${teamName},` },
      {
        type: "paragraph",
        text: "Congratulations! 🎉\nYour team's registration for the <b>SxC International Summit 2025-International Business Case Competition</b> has been successfully confirmed.. We are so excited to have you as one of our competitors who will start the journey from the <b>Preliminary Stage</b>.",
      },
      {
        type: "paragraph",
        text: "Here’s the <b>Preliminary Stages Timeline</b> you need to note:",
      },
      {
        type: "list",
        items: [
          "<b>Case 1 Release</b>: 28 September 2025",
          "<b>Submission Phase</b>: 28 September – 25 October 2025",
          "<b>Preliminary Scoring Phase</b>: 26 October – 1 November 2025",
          "<b>SemiFinalist Announcement</b>: 2 November 2025",
        ],
      },
      {
        type: "paragraph",
        text: "While waiting for the case release, don’t forget to stay connected with us through our social media for updates and exciting content:",
      },
      {
        type: "list",
        items: ["Instagram: @sxcintersummit", "TikTok: @intersummitsxc"],
      },
      {
        type: "paragraph",
        text: "For any questions, feel free to reach out to our official contacts:<br/><b>Contact Persons (IBCC):</b>",
      },
      {
        type: "paragraph",
        text: "<b>Salma</b>",
      },
      {
        type: "list",
        items: ["WhatsApp: +62 857 7173 0530", "Line ID: suhailahsalmaa"],
      },
      {
        type: "paragraph",
        text: "<b>Intan</b>",
      },
      {
        type: "list",
        items: ["WhatsApp: +62 818 0808 4043", "Line ID: intancv"],
      },
      {
        type: "paragraph",
        text: "We are truly excited to have you on board, and this is just the beginning of your journey in the competition. Get ready to showcase your best ideas starting from the preliminary stage!",
      },
      { type: "paragraph", text: "Best regards," },
      { type: "paragraph", text: "<b>SxC International Summit 2025 Team</b>" },
      {
        type: "paragraph",
        text: "International Business Case Competition Committee",
      },
    ],
  });
  return await sendEmail(
    user.email,
    "[Confirmation] – Successful Registration of StudentsxCEOs InterSummit 2025 International Business Case Competition",
    html
  );
}

async function sendEmailCaseIBCC(userId, caseLink) {
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
  sendEmailRegistIBCC,
  deleteUserfromTeam,
  deleteTeam,
  changeTeamStatus,
  getTeamDetail,
};
