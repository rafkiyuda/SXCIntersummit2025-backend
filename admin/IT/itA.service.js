const prisma = require("../../config/db");

// === STAFF ===
exports.createStaff = async (data) => {
  return await prisma.staff.create({ data });
};

exports.getAllStaff = async (page, limit) => {
  return await prisma.staff.findMany({
    //skip: (page - 1) * limit,
    //take: limit,
  });
};

exports.updateStaff = async (id, data) => {
  return await prisma.staff.update({
    where: { id: id },
    data,
  });
};

exports.deleteStaff = async (id) => {
  return await prisma.staff.delete({
    where: { id: id },
  });
};

exports.findDivision = async (division) => {
  return await prisma.Division.findUnique({
    where: { name: division },
  });
};

exports.findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

exports.findStaffByEmail = async (email) => {
  return await prisma.staff.findUnique({ where: { email } });
};

// === REFERRAL ===
exports.createReferral = async (data) => {
  try {
    // 1. Buat entri ReferralCode utama
    const newReferralCode = await prisma.referral.create({
      data: {
        code: data.code,
        discount: data.discount,
        validUntil: data.validUntil,
      },
    });

    if (data.programIds && data.programIds.length > 0) {
      const referralProgramData = data.programIds.map((programId) => ({
        referralId: newReferralCode.id,
        programId: parseInt(programId),
      }));

      // Menggunakan createMany untuk efisiensi
      await prisma.programReferral.createMany({
        data: referralProgramData,
        skipDuplicates: true,
      });
    }

    return newReferralCode;
  } catch (error) {
    console.error("Error creating referral code:", error);
    throw new Error("Failed to create referral code.");
  }
};

exports.getAllReferral = async (page, limit) => {
  return await prisma.referral.findMany({
    include: {
      program: true, // Include related programs
    },
    //skip: (page - 1) * limit,
    //take: limit,
  });
};

exports.updateReferral = async (referralId, data) => {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. Update data referral utama (misal code, discount, validUntil)
      const updatedReferral = await prisma.referral.update({
        where: { id: referralId },
        data: {
          code: data.code,
          discount: data.discount,
          validUntil: data.validUntil,
        },
      });

      if (data.programIds && data.programIds.length > 0) {
        await prisma.programReferral.deleteMany({
          where: { referralId: referralId },
        });
        const referralProgramData = data.programIds.map((programId) => ({
          referralId: referralId,
          programId: parseInt(programId),
        }));
        await prisma.programReferral.createMany({
          data: referralProgramData,
          skipDuplicates: true,
        });
      }

      return updatedReferral;
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    throw new Error("Failed to update referral.");
  }
};

exports.deleteReferral = async (id) => {
  await prisma.programReferral.deleteMany({
    where: { referralId: id },
  });
  await prisma.userReferral.deleteMany({
    where: { referralId: id },
  });
  return await prisma.referral.delete({
    where: { id },
  });
};

exports.getTotalUserReferral = async () => {
  return await prisma.userReferral.count();
};

exports.findReferral = async (code) => {
  return await prisma.referral.findUnique({
    where: { code: code },
  });
};

exports.findProgram = async (names) => {
  return await prisma.program.findMany({
    where: { name: { in: names } },
  });
};

// ======= ACTIVITY LOG =======

exports.getAllStaffActivity = async (page, limit) => {
  return await prisma.activityLog.findMany({
    include: { staff: true },
    orderBy: { createdAt: "desc" },
    //skip: (page - 1) * limit,
    //take: limit,
  });
};
