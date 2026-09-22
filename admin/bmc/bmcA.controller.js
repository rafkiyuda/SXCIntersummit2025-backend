const service = require("./bmcA.service");
exports.getAllBMCTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const teams = await service.getAllBMCTeams(); //(+page, +limit);;
    res.json(teams);
  } catch (err) {
    console.error("Error get all team BMC:", err);
    res.status(500).json({ message: "Gagal mengambil tim BMC" });
  }
};

exports.getAllGeneral = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const teams = await service.getGeneralVerif(); //(+page, +limit);;
    res.json(teams);
  } catch (err) {
    console.error("Error get all general verif:", err);
    res.status(500).json({ message: "Gagal mengambil tim BMC" });
  }
};

exports.updateTeamStatus = async (req, res) => {
  try {
    const { teamIds, status } = req.body;
    if (!Array.isArray(teamIds) || teamIds.length === 0) {
      return res
        .status(400)
        .json({ message: "teamIds harus berupa array dan tidak kosong" });
    }

    const updated = await service.updateTeamStatus(teamIds, status);
    res.status(201).json({ message: "Status tim diperbarui", updated });
  } catch (err) {
    console.error("Error update status Team BMC:", err);
    res.status(500).json({ message: "Gagal memperbarui status tim" });
  }
};

exports.postAnnouncementToTeamMembers = async (req, res) => {
  try {
    const staffId = req.user.id;
    const status = parseInt(req.params.id);
    const { message, title } = req.body;
    await service.postAnnouncementToTeamMembers(
      status,
      message,
      title,
      staffId
    );
    res.status(201).json({ message: "Pengumuman dikirim ke anggota tim" });
  } catch (err) {
    console.error("Error send announcement to team :", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

exports.postNotificationToAll = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;
    await service.postNotificationToAll(message, title, staffId);
    res.json({ message: "Notifikasi dikirim ke semua user" });
  } catch (err) {
    console.error("Error send notification to ALL :", err);
    res.status(500).json({ message: "Gagal mengirim notifikasi" });
  }
};

exports.searchTeam = async (req, res) => {
  try {
    const { keyword } = req.query;
    const result = await service.searchTeam(keyword);
    res.json(result);
  } catch (err) {
    console.error("Error Team Searching :", err);
    res.status(500).json({ message: "Gagal mencari tim" });
  }
};

exports.allParticipant = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const teams = await service.getAllBMCParticipants(); //(+page, +limit);;
    res.json(teams);
  } catch (err) {
    console.error("Error get all participants BMC:", err);
    res.status(500).json({ message: "Gagal mengambil participants BMC" });
  }
};

exports.updateParticipantStatus = async (req, res) => {
  try {
    const { userIds, status } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "teamIds harus berupa array dan tidak kosong" });
    }

    const updated = await service.updateParticipantStatus(userIds, status);
    res.status(201).json({ message: "Status users diperbarui", updated });
  } catch (err) {
    console.error("Error update status participants BMC:", err);
    res.status(500).json({ message: "Gagal memperbarui status user" });
  }
};
