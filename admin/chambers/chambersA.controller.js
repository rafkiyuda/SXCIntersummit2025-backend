const service = require("./chambersA.service");

// Fetch participants Chambers
exports.participants = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort } = req.query; // tambah filter day
    const data = await service.getParticipants(+page, +limit, sort);
    res.json(data);
  } catch (err) {
    console.error("Error fetch participants Chambers:", err);
    res.status(500).json({ message: "Gagal mengambil data peserta Chambers" });
  }
};

// Fetch additional form answers (feedback + hearFrom)
exports.dataEvent = async (req, res) => {
  try {
    const feedbacks = await service.getAllChambersData();
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetch feedback Chambers:", err);
    res.status(500).json({ message: "Gagal mengambil data feedback Chambers" });
  }
};

// Send announcement ke peserta Chambers
exports.announcement = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;

    await service.postAnnouncementToParticipants(message, title, staffId);

    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim pengumuman ke peserta Chambers`,
    };

    res.status(201).json({ message: "Pengumuman dikirim ke peserta Chambers" });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim pengumuman ke peserta Chambers`,
    };
    console.error("Error send announcement Chambers:", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

// Optional: Notifikasi umum ke semua user
exports.notification = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;
    await service.postNotificationToAll(message, title, staffId);
    res.json({ message: "Notifikasi dikirim ke semua user" });
  } catch (err) {
    console.error("Error send notification ALL:", err);
    res.status(500).json({ message: "Gagal mengirim notifikasi" });
  }
};

// Search peserta Chambers
exports.searchParticipant = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const result = await service.searchParticipant(keyword); //, page, limit;
    res.json(result);
  } catch (err) {
    console.error("Error Team Searching Chambers:", err);
    res.status(500).json({ message: "Gagal mencari peserta Chambers" });
  }
};

exports.downloadExcelByEvent = async (req, res) => {
  try {
    const { eventName } = req.params; // dapatkan nama event dari parameter URL

    // Panggil fungsi export di service, passing nama event
    const excelBuffer = await service.exportDataToExcel(1, 1000);

    // Set header supaya browser tahu ini file Excel dan pakai nama file sesuai event
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${eventName}.xlsx`
    );
    res.locals.activityLog = {
      activity: `${req.user.id} Export peserta Chambers`,
    };
    // Kirim file buffer sebagai response
    res.send(excelBuffer);
  } catch (error) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal mengunduh file Excel peserta Chambers`,
    };
    console.error(error);
    res.status(500).json({ message: "Gagal mengunduh file Excel" });
  }
};
