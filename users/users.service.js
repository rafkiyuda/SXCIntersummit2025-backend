const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");

async function getProfile(id) {
  return await prisma.user.findUnique({
    where: { id: id },
    select: {
      name: true,
      email: true,
      birthdate: true,
      domicile: true,
      institution: true,
      institution_name: true,
      major: true,
      wa_number: true,
      line_id: true,
      insta_acc: true,
      status: true,
      Submission: {
        where: { type: "IDCARD" },
        select: {
          Files: {
            select: {
              filePath: true,
            },
          },
        },
      },
    },
  });
}

async function updateProfile(id, data) {
  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });
  ({ id, role, institution } = updatedUser);
  accountType = "user";
  division = null;
  const token = jwt.sign(
    { id, role, accountType, division, institution },
    secret,
    { expiresIn }
  );

  return { user: updatedUser, token };
}

async function checkProfile(id) {
  const user = id;
  const existUser = await prisma.user.findUnique({
    where: { id: user },
    select: {
      name: true,
      email: true,
      birthdate: true,
      domicile: true,
      institution: true,
      institution_name: true,
      major: true,
      wa_number: true,
      line_id: true,
      insta_acc: true,
      Submission: {
        where: { type: "IDCARD" },
        select: {
          Files: {
            select: {
              filePath: true,
            },
          },
        },
      },
    },
  });

  if (!existUser) {
    res.status(404).json({ message: "user not found" });
  }

  return existUser;
}

async function updateStatus(userId, code) {
  const statusID = await prisma.status.findUnique({
    where: { code: code },
  });
  if (!statusID) {
    return res
      .status(404)
      .json({ message: `Status dengan code 1 tidak ditemukan` });
  }
  return await prisma.user.update({
    where: { id: userId },
    data: { status: statusID.id }, // ganti sesuai nama field dan kode status yang Anda inginkan
  });
}

async function deleteIdcard(id) {
  const userSubmission = await prisma.Submission.findFirst({
    where: {
      userId: id,
      type: "IDCARD",
    },
  });

  await prisma.SubmissionFile.deleteMany({
    where: { submissionId: userSubmission.id },
  });

  return await prisma.Submission.deleteMany({
    where: { id: userSubmission.id },
  });
}

async function getUserSeminar(userId) {
  return await prisma.seminarReg.findMany({
    where: { userId: userId },
    select: {
      programId: true,
      type: true,
      program: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });
}

async function getUserTeam(userId) {
  return await prisma.teamMember.findMany({
    where: { userId: userId },
    select: {
      teamId: true,
    },
  });
}

async function getProgrambyTeamId(teamId) {
  console.log(teamId);
  if (teamId === undefined) {
    return [];
  }
  return await prisma.team.findMany({
    where: { id: teamId },
    select: {
      programId: true,
      programcode: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });
}

async function findProgramByName(name) {
  return await prisma.program.findUnique({
    where: { name: name },
    select: {
      id: true,
    },
  });
}

async function findReferral(code) {
  return await prisma.referral.findFirst({
    where: { code: code },
    select: {
      id: true,
      code: true,
    },
  });
}

async function verifyReferral(programId, referralId) {
  return await prisma.programReferral.findFirst({
    where: {
      programId: programId,
      referralId: referralId,
    },
  });
}

async function relUserReferral(userId, referralId) {
  return await prisma.userReferral.create({
    data: {
      userId: userId,
      referralId: referralId,
    },
  });
}

module.exports = {
  getProfile,
  updateProfile,
  checkProfile,
  updateStatus,
  deleteIdcard,
  findProgramByName,
  verifyReferral,
  relUserReferral,
  findReferral,
  getUserSeminar,
  getUserTeam,
  getProgrambyTeamId,
};
