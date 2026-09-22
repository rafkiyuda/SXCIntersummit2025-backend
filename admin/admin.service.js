const prisma = require("../config/db");

async function getAllUsers() {
  return await prisma.user.findMany();
}

async function getAllStaff() {
  return await prisma.staff.findMany();
}

async function logActivity({ staffId, activity, status }) {
  try {
    await prisma.activityLog.create({
      data: {
        staffId,
        activity,
        status,
      },
    });
    console.log(`Activity logged: ${activity} (Status: ${status})`);
  } catch (error) {
    console.error("⚠️ Failed to save activity log:", error);
    // Anda bisa menambahkan mekanisme logging error yang lebih canggih di sini
  }
}

module.exports = { getAllUsers, getAllStaff, logActivity };
