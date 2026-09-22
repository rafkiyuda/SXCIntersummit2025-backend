const prisma = require("../../config/db");
const {
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
  getAnnouncement,
  alreadyRead,
  deleteUserfromTeam,
  deleteTeam,
  sendEmailRegistIBCC,
  changeTeamStatus,
  getTeamDetail,
} = require("./ibccU.service");

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name } = req.body;
    const programIBCC = await findProgramByName("IBCC");
    if (!programIBCC)
      return res.status(404).json({ message: "Program IBCC not found" });

    const isLeader = await checkLeader(userId, programIBCC.id);
    if (isLeader)
      return res.status(400).json({ message: "You are already a leader" });
    const alreadyMember = await checkAlreadyMember(userId, programIBCC.id);
    if (alreadyMember)
      return res.status(400).json({ message: "Already in a team" });

    const teamExist = await checkTeamName(name);
    if (teamExist)
      return res.status(400).json({ message: "Team name already exists" });

    let code;
    do {
      code = generateTeamCode();
    } while (!(await isCodeUnique(code)));

    const newTeam = await createTeam({
      leaderId: userId,
      name,
      code,
      programId: programIBCC.id,
      status: 15, // default "on progress" / pending verification
    });

    await prisma.TeamMember.create({
      data: {
        teamId: newTeam.id,
        userId: userId,
        role: "LEADER",
      },
    });
    // await sendLinkCanva(userId);
    await sendEmailRegistIBCC(userId, newTeam.name);
    return res.status(201).json({
      message: "IBCC team created successfully",
      data: newTeam,
    });
  } catch (error) {
    console.error("Create Team IBCC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Join existing team
exports.joinTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    const { code } = req.body;
    const programIBCC = await findProgramByName("IBCC");

    const team = await findTeamByCode(code, programIBCC.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const alreadyMember = await checkAlreadyMember(userId, programIBCC.id);
    if (alreadyMember)
      return res.status(400).json({ message: "Already in a team" });

    const isMember = await findMember(userId, team.id);
    if (isMember)
      return res.status(400).json({ message: "Already in this team" });

    const canJoin = await teamLimitCheck(team.id, 3);
    if (!canJoin)
      return res.status(400).json({ message: "Team is full (max 3)" });

    const join = await joinTeam(userId, team.id);
    if (!join) {
      return res.status(500).json({ message: "Failed to join team" });
    }

    await sendEmailRegistIBCC(userId, team.name);

    const countMembers = await teamLimitCheck(team.id, 2);
    if (!countMembers) {
      await changeTeamStatus(team.id, 14); // status 14 = complete
      // await sendLinkCanva(team.leaderId);
      console.log("Team is complete, status changed to 'complete'");
    }

    // await sendLinkCanva(userId);

    return res.status(200).json({ message: "Successfully joined IBCC team" });
  } catch (error) {
    console.error("Join Team IBCC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// Fetch team members
exports.teamMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBCC = await findProgramByName("IBCC");
    const userTeam = await checkAlreadyMember(userId, programIBCC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }
    const members = await getTeamMembers(userTeam.teamId);
    return res.json(members);
  } catch (error) {
    console.error("Get IBCC team members error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.teamDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBCC = await findProgramByName("IBCC");
    const userTeam = await checkAlreadyMember(userId, programIBCC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }

    const teamDetail = await getTeamDetail(userTeam.teamId);
    return res.json(teamDetail);
  } catch (error) {
    console.error("Get IBCC team detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.exitTeam = async (req, res) => {
  try {
    const programIBCC = await findProgramByName("IBCC");
    const userId = req.user.id;
    const userTeam = await checkAlreadyMember(userId, programIBCC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }
    const deleted = await deleteUserfromTeam(userId, userTeam.teamId);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to leave the team" });
    }

    return res.json({ message: "Successfully left the team" });
  } catch (error) {
    console.error("Exit Team IBCC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBCC = await findProgramByName("IBCC");

    const isLeader = await checkLeader(userId, programIBCC.id);
    if (!isLeader)
      return res
        .status(403)
        .json({ message: "Only team leader can delete the team" });

    await deleteTeam(isLeader.id);
    return res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete Team IBCC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// exports.validateTeam = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const programIBCC = await findProgramByName("IBCC");
//     const userTeam = await checkAlreadyMember(userId, programIBCC.id);
//     if (!userTeam) {
//       return res.status(400).json({ message: "You are not in a team" });
//     }
//     const team = userTeam.teamId;
//     const countMembers = await teamLimitCheck(team, 3);
//     if (!countMembers) {
//       return res.status(400).json({ message: "Team must have 3 members" });
//     }

//     return res.json({ message: "Team is valid" });
//   } catch (error) {
//     console.error("Validate Team IBCC error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// Fetch announcements for IBCC
exports.announcement = async (req, res) => {
  try {
    const userId = req.user.id;
    const announcements = await getAnnouncement(userId);
    return res.json(announcements);
  } catch (error) {
    console.error("IBCC Announcement error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
exports.readNotif = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = +req.params.id;
    const result = await alreadyRead(userId, notifId);
    return res.json(result);
  } catch (error) {
    console.error("IBCC read notif error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.sendEmailTest = async (req, res) => {
  try {
    const userId = req.user.id;
    await sendEmailRegistIBCC(userId, "Test Team");
    return res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Send Email Test error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
