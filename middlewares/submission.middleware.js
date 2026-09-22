// file middleware untuk set parameter submission
const prisma = require("../config/db");

// set stage di parameter seperti registration, seminar, final
function setStageParam(req, res, next) {
  const validStages = [
    "REGISTRATION",
    "SEMINAR",
    "FINAL",
    "PREELIM",
    "SEMIFINAL",
  ]; // dari enum stages
  const stage = req.params.stage?.toUpperCase();

  if (!stage || !validStages.includes(stage)) {
    return res.status(400).json({ message: "Invalid submission stage" });
  }

  req.stage = stage;
  next();
}

async function verifyProgram(req, res, next) {
  const { programId, type } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  if (programId !== "null" && programId !== undefined) {
    const programIdInt = parseInt(programId, 10);
    if (isNaN(programIdInt)) {
      return res.status(400).json({ error: "Invalid programId format" });
    }
    const program = await prisma.program.findUnique({
      where: { id: programIdInt },
    });
    if (!program) return res.status(404).json({ error: "Program not found" });

    req.programId = programIdInt;
    req.event = program.name;
    const proType = program.type;

    if (proType === "EVENT") {
      const seminar = await prisma.seminarReg.findFirst({
        where: { userId, programId: programIdInt },
      });
      if (!seminar)
        return res
          .status(403)
          .json({ error: "User not registered for seminar" });
      req.seminarId = seminar.id;
      req.teamId = null;
    } else if (proType === "COMPETITION") {
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId, team: { programId: programIdInt } },
        include: { team: true },
      });
      if (!teamMember)
        return res
          .status(403)
          .json({ error: "User not in any team for competition" });
      req.teamId = teamMember.teamId;
      req.seminarId = null;
    }
  } else if (type === "IDCARD") {
    req.programId = null;
    req.seminarId = null;
    req.teamId = null;
    req.event = "PROFILE";
  } else {
    return res
      .status(400)
      .json({ error: "programId is required unless submission is PROFILE" });
  }

  req.type = type; // tetap simpan untuk validasi atau logika lain

  next();
}

module.exports = { setStageParam, verifyProgram };
