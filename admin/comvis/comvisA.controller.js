const service = require("./comvisA.service");

// Get participants (sorted by company, with pagination + limit)
exports.participants = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await service.getParticipants(+page, +limit);
    res.json(data);
  } catch (err) {
    console.error("Error fetch participants Company Visit:", err);
    res.status(500).json({ message: "Gagal mengambil data peserta Company Visit" });
  }
};

// Get user answers (from addForm + hearFrom table)
exports.dataEvent = async (req, res) => {
  try {
    const feedbacks = await service.getEventFeedback();
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetch feedback Company Visit:", err);
    res.status(500).json({ message: "Gagal mengambil data feedback Company Visit" });
  }
};

// Send announcement to ComVis participants
exports.announcement = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;

    await service.postAnnouncementToParticipants(message, title, staffId);

    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim pengumuman ke peserta Company Visit`,
    };

    res.status(201).json({ message: "Pengumuman dikirim ke peserta Company Visit" });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim pengumuman ke peserta Company Visit`,
    };
    console.error("Error send announcement Company Visit:", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

// Send notification to all users
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
