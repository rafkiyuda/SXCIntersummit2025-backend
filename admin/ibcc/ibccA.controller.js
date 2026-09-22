const service = require("./ibccA.service");
exports.getAllIBCCTeams = async (req, res) => {
  try {
    // const { page = 1, limit = 10 } = req.query;
    const teams = await service.getAllIBCCTeams(); //();//(+page, +limit);;
    res.json(teams);
  } catch (err) {
    console.error("Error get all team IBCC:", err);
    res.status(500).json({ message: "Gagal mengambil tim IBCC" });
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
      res.locals.activityLog = {
        activity: `${req.user.id} Gagal Mengubah status tim ke peserta IBCC - team id tidak valid`,
      };
      return res
        .status(400)
        .json({ message: "teamIds harus berupa array dan tidak kosong" });
    }

    const teamSearch = await service.getTeambyId(teamIds);
    if (teamSearch.length !== teamIds.length) {
      res.locals.activityLog = {
        activity: `${req.user.id} Gagal Mengubah status tim ke peserta IBCC - Beberapa tim tidak ditemukan`,
      };
      return res.status(404).json({ message: "Beberapa tim tidak ditemukan" });
    }

    const updated = await service.updateTeamStatus(teamIds, status);
    res.locals.activityLog = {
      activity: `${req.user.id} Mengubah status tim ke peserta IBCC`,
    };
    res.status(201).json({ message: "Status tim diperbarui", updated });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengubah status tim ke peserta IBCC`,
    };
    console.error("Error update status Team IBCC:", err);
    res.status(500).json({ message: "Gagal memperbarui status tim" });
  }
};

exports.postAnnouncementToTeamMembers = async (req, res) => {
  try {
    const staffId = req.user.id;
    const status = parseInt(req.params.id);
    const { message, title } = req.body;
    const checkTeam = await service.getTeambyStatus(status);

    if (checkTeam.length === 0) {
      res.locals.activityLog = {
        activity: `${req.user.id} Gagal Mengirim pengumuman ke anggota tim IBCC - tim tidak ditemukan`,
      };
      return res.status(404).json({ message: "Tim tidak ditemukan" });
    }

    await service.postAnnouncementToTeamMembers(
      status,
      message,
      title,
      staffId
    );
    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim pengumuman ke anggota tim IBCC`,
    };
    res.status(201).json({ message: "Pengumuman dikirim ke anggota tim" });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim pengumuman ke anggota tim IBCC`,
    };
    console.error("Error send announcement to team :", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

exports.postAnnouncementToAll = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;

    await service.postAnnouncementToAll(message, title, staffId);
    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim pengumuman ke semua anggota tim IBCC`,
    };
    res
      .status(201)
      .json({ message: "Pengumuman dikirim ke semua anggota tim" });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim pengumuman ke semua anggota tim IBCC`,
    };
    console.error("Error send announcement to team :", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

exports.postNotificationToAll = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;
    await service.postNotificationToAll(message, title, staffId);
    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim notifikasi ke semua user`,
    };
    res.json({ message: "Notifikasi dikirim ke semua user" });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim notifikasi ke semua user`,
    };
    console.error("Error send notification to ALL :", err);
    res.status(500).json({ message: "Gagal mengirim notifikasi" });
  }
};

exports.searchTeam = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const result = await service.searchTeam(keyword); //, page, limit;
    res.json(result);
  } catch (err) {
    console.error("Error Team Searching :", err);
    res.status(500).json({ message: "Gagal mencari tim" });
  }
};

exports.allParticipant = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const teams = await service.getAllIBCCParticipants(); //(+page, +limit);;
    res.json(teams);
  } catch (err) {
    console.error("Error get all participants IBCC:", err);
    res.status(500).json({ message: "Gagal mengambil participants IBCC" });
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
    res.locals.activityLog = {
      activity: `${req.user.id} Mengubah status peserta IBCC`,
    };
    res.status(201).json({ message: "Status users diperbarui", updated });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengubah status peserta IBCC`,
    };
    console.error("Error update status participants IBCC:", err);
    res.status(500).json({ message: "Gagal memperbarui status user" });
  }
};

exports.downloadExcelByEvent = async (req, res) => {
  try {
    const { eventName } = req.params; // dapatkan nama event dari parameter URL

    // Panggil fungsi export di service, passing nama event
    const excelBuffer = await service.exportDataToExcel();

    // Set header supaya browser tahu ini file Excel dan pakai nama file sesuai event
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${eventName}.xlsx`
    );

    // Kirim file buffer sebagai response
    res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengunduh file Excel" });
  }
};
