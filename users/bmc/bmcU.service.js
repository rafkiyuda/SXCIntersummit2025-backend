const { join } = require("path");
const prisma = require("../../config/db");
const crypto = require("crypto");
const { sendEmail } = require("../../utils/SendEmail");

function generateTeamCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function isCodeUnique(code) {
  const exists = await prisma.team.findUnique({
    where: { code },
  });
  return !exists;
}

const findProgramByName = async (name) => {
  return await prisma.program.findFirst({
    where: { name },
  });
};

const checkTeamName = async (name) => {
  return await prisma.team.findFirst({
    where: { name: name },
  });
};

const checkLeader = async (userId, programId) => {
  const existingteam = await prisma.team.findFirst({
    where: {
      leaderId: userId,
      programId: programId,
    },
  });
  return existingteam ? true : false;
};

const checkAlreadyMember = async (userId, programId) => {
  return await prisma.TeamMember.findFirst({
    where: {
      userId: userId,
      team: {
        programcode: programId,
      },
    },
  });
};

const findMember = async (userId, teamId) => {
  return await prisma.TeamMember.findFirst({
    where: {
      userId: userId,
      teamId: teamId,
    },
  });
};

const findTeamByCode = async (code) => {
  return await prisma.team.findUnique({
    where: {
      code: code,
    },
  });
};

async function teamLimitCheck(teamId, capacity) {
  const count = await prisma.teamMember.count({
    where: { teamId },
  });

  if (count >= capacity) {
    // throw new Error('Team is full');
    return false;
  }
  return true;
}

async function joinTeam(userId, teamId) {
  const teamMember = await prisma.TeamMember.create({
    data: {
      userId: userId,
      teamId: teamId,
    },
  });
  return teamMember;
}

const createTeam = async (data) => {
  return await prisma.Team.create({ data });
};

async function getTeamMembers(userId) {
  const teamUser = await prisma.TeamMember.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!teamUser) {
    throw new Error("User is not a member of any team");
  }

  const UserteamId = teamUser.teamId;

  // Ambil semua anggota team berdasarkan teamId
  const members = await prisma.TeamMember.findMany({
    where: { teamId: UserteamId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          institution: true,
        },
      },
    },
  });

  return members;
}

async function joinIndvidual(data) {
  return await prisma.tempIndividu.create({ data });
}

async function getAnnouncement(userId) {
  return await prisma.notification.findMany({
    where: {
      userId: userId,
      purpose: "ANNOUNCEMENT",
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

async function sendLinkcanva(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const link =
    "https://www.canva.com/design/DAGucz3rJV0/X42rtHWQ7UYXGtuFCPYrsA/edit?utm_content=DAGucz3rJV0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton";
  const html = `<p>Link canva </br> <strong>${link}</strong></p>`;
  return await sendEmail(user.email, "Link Canva", html);
}

module.exports = {
  generateTeamCode,
  isCodeUnique,
  findProgramByName,
  findMember,
  checkTeamName,
  checkLeader,
  findProgramByName,
  teamLimitCheck,
  joinTeam,
  findTeamByCode,
  createTeam,
  getTeamMembers,
  joinIndvidual,
  getAnnouncement,
  alreadyRead,
  sendLinkcanva,
  checkAlreadyMember,
};
