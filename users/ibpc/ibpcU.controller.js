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
  sendEmailRegistIBPC,
  changeTeamStatus,
  getTeamDetail,
} = require("./ibpcU.service");

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name } = req.body;
    const programIBPC = await findProgramByName("IBPC");
    if (!programIBPC)
      return res.status(404).json({ message: "Program IBPC not found" });

    const isLeader = await checkLeader(userId, programIBPC.id);
    if (isLeader)
      return res.status(400).json({ message: "You are already a leader" });
    const alreadyMember = await checkAlreadyMember(userId, programIBPC.id);
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
      programId: programIBPC.id,
      status: 15, // default "on progress" / pending verification
    });

    await prisma.teamMember.create({
      data: {
        teamId: newTeam.id,
        userId: userId,
        role: "LEADER",
      },
    });
    // await sendLinkCanva(userId);
    await sendEmailRegistIBPC(userId, newTeam.name);
    return res.status(201).json({
      message: "IBPC team created successfully",
      data: newTeam,
    });
  } catch (error) {
    console.error("Create Team IBPC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Join existing team
exports.joinTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    const { code } = req.body;
    const programIBPC = await findProgramByName("IBPC");

    const team = await findTeamByCode(code, programIBPC.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const alreadyMember = await checkAlreadyMember(userId, programIBPC.id);
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

    await sendEmailRegistIBPC(userId, team.name);

    const countMembers = await teamLimitCheck(team.id, 2);
    if (!countMembers) {
      await changeTeamStatus(team.id, 14); // status 14 = complete
      // await sendLinkCanva(team.leaderId);
      console.log("Team is complete, status changed to 'complete'");
    }

    // await sendLinkCanva(userId);

    return res.status(200).json({ message: "Successfully joined IBPC team" });
  } catch (error) {
    console.error("Join Team IBPC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// Fetch team members
exports.teamMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBPC = await findProgramByName("IBPC");
    const userTeam = await checkAlreadyMember(userId, programIBPC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }
    const members = await getTeamMembers(userTeam.teamId);
    return res.json(members);
  } catch (error) {
    console.error("Get IBPC team members error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.teamDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBPC = await findProgramByName("IBPC");
    const userTeam = await checkAlreadyMember(userId, programIBPC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }

    const teamDetail = await getTeamDetail(userTeam.teamId);
    return res.json(teamDetail);
  } catch (error) {
    console.error("Get IBPC team detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.exitTeam = async (req, res) => {
  try {
    const programIBPC = await findProgramByName("IBPC");
    const userId = req.user.id;
    const userTeam = await checkAlreadyMember(userId, programIBPC.id);
    if (!userTeam) {
      return res.status(400).json({ message: "You are not in a team" });
    }
    const deleted = await deleteUserfromTeam(userId, userTeam.teamId);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to leave the team" });
    }

    return res.json({ message: "Successfully left the team" });
  } catch (error) {
    console.error("Exit Team IBPC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const programIBPC = await findProgramByName("IBPC");

    const isLeader = await checkLeader(userId, programIBPC.id);
    if (!isLeader) {
      return res
        .status(403)
        .json({ message: "Only team leader can delete the team" });
    }

    await deleteTeam(isLeader.id);
    return res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete Team IBPC error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// exports.validateTeam = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const programIBPC = await findProgramByName("IBPC");
//     const userTeam = await checkAlreadyMember(userId, programIBPC.id);
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
//     console.error("Validate Team IBPC error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// Fetch announcements for IBPC
exports.announcement = async (req, res) => {
  try {
    const userId = req.user.id;
    const announcements = await getAnnouncement(userId);
    return res.json(announcements);
  } catch (error) {
    console.error("IBPC Announcement error:", error);
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
    console.error("IBPC read notif error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.sendEmailTest = async (req, res) => {
  try {
    const userId = req.user.id;
    await sendEmailRegistIBPC(userId, "Test Team");
    return res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Send Email Test error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
