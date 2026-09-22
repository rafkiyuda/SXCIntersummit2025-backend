const prisma = require("../config/db");

const checkStatus = (programName) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const searchProgram = await prisma.Program.findUnique({
      where: { name: programName },
    });
    if (!searchProgram) {
      return res.status(404).json({ message: "Program not found" });
    }
    const programId = searchProgram.id;
    const userTeam = await prisma.TeamMember.findFirst({
      where: { userId: userId, team: { programId: programId } },
      include: { team: true },
    });
    if (!userTeam || !userTeam.team) {
      return next();
    }
    const status = userTeam.team.status;

    if (status === 10 || status === 12) {
      return res.status(403).json({ message: "Your Team is not eligible" });
    }
    return next();
  };
};

module.exports = {
  checkStatus,
};
