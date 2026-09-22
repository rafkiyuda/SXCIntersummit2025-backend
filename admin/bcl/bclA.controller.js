const service = require("./bclA.service");

exports.participants = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await service.getParticipants(); //(+page, +limit);;
    res.json(data);
  } catch (err) {
    console.error("Error fetch participants BCL:", err);
    res.status(500).json({ message: "Gagal mengambil data peserta BCL" });
  }
};

exports.dataEvent = async (req, res) => {
  try {
    const feedbacks = await service.getEventFeedback();
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetch feedback BCL:", err);
    res.status(500).json({ message: "Gagal mengambil data feedback BCL" });
  }
};

exports.announcement = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { message, title } = req.body;

    const sendAnnouncement = await service.postAnnouncementToParticipants(
      message,
      title,
      staffId
    );
    res.locals.activityLog = {
      activity: `${req.user.id} Mengirim pengumuman ke peserta BCL`,
    };
    res
      .status(201)
      .json({ message: "Pengumuman dikirim ke peserta BCL" }, sendAnnouncement);
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengirim pengumuman ke peserta BCL`,
    };
    console.error("Error send announcement BCL:", err);
    res.status(500).json({ message: "Gagal mengirim pengumuman" });
  }
};

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

exports.searchParticipant = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const result = await service.searchParticipant(keyword); //, page, limit;
    res.json(result);
  } catch (err) {
    console.error("Error Team Searching :", err);
    res.status(500).json({ message: "Gagal mencari tim" });
  }
};
