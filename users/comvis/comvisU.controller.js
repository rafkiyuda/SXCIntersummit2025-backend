//API untuk Comvis
const {
  findProgramByName,
  getAnnouncement,
  alreadyRead,
  sendEmailComvis,
  userAnswer,
  hearFrom,
  joinSeminar,
  alreadyJoined,
  cancelJoin,
  findUserById,
  deleteUserAnswer,
  generateTicket,
  testEmail,
} = require("./comvisU.service");
const { generateQRCode } = require("../../constants/qr");
const programId = 6; // Program ID for Comvis Seminar

exports.registerSeminar = async (req, res) => {
  try {
    const userId = req.user.id;
    const day = req.params.day?.toUpperCase();

    const checkUser = await alreadyJoined(userId, programId, day);
    if (checkUser) {
      return res.status(400).json({ message: "User already joined seminar" });
    }

    const seminar = await joinSeminar(userId, programId, day);
    if (!seminar) {
      return res.status(400).json({ message: "Failed to register seminar" });
    }

    // const payload = await generateTicket({
    //   id: seminar.id,
    //   name: req.user.name,
    //   program: "Comvis 2025",
    // });
    // const qrcode = await generateQRCode(payload);

    if (day === "DAY1") {
      const link = "https://chat.whatsapp.com/KGk3wYJH8mY6m4b0gRk1bE"; // Link WhatsApp Group Day 1
      const email = await sendEmailComvis(userId, link);
      if (!email) {
        return res.status(400).json({ message: "Failed to send email" });
      }
    }

    if (day === "DAY2") {
      const link =
        "https://chat.whatsapp.com/DqYFa3t6i5D5WELn42D1E9?mode=ems_copy_t"; // Link WhatsApp Group Day 2
      const email = await sendEmailComvis(userId, link);
      if (!email) {
        return res.status(400).json({ message: "Failed to send email" });
      }
      console.log(email);
    }
    return res.status(201).json(seminar);
  } catch (err) {
    console.error("Register Seminar:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.cancelSeminar = async (req, res) => {
  try {
    const userId = req.user.id;
    const day = req.params.day;
    const checkUser = await alreadyJoined(userId, programId, day);
    if (!checkUser) {
      return res.status(400).json({ message: "User not joined seminar" });
    }

    const deleteAnswer = await deleteUserAnswer(
      userId,
      programId,
      checkUser.id
    );
    if (!deleteAnswer) {
      return res.status(400).json({ message: "Failed to delete user answer" });
    }

    const seminar = await cancelJoin(userId, programId, day);
    if (!seminar) {
      return res.status(400).json({ message: "Failed to cancel seminar" });
    }
    return res.status(200).json({ message: "Successfully canceled seminar" });
  } catch (err) {
    console.error("Cancel Seminar:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.announcement = async (req, res) => {
  try {
    const userId = req.user.id;
    const userAnnouncement = await getAnnouncement(userId);
    if (!userAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res.json(userAnnouncement);
  } catch (err) {
    console.error("Get Announcement:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.readNotif = async (req, res) => {
  try {
    const userId = req.user.id;

    const readNotif = await alreadyRead(userId, +req.params.id);
    if (!readNotif) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res.json(readNotif);
  } catch (err) {
    console.error("read Announcement:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.form = async (req, res) => {
  try {
    const user = req.user.id;
    const day = req.params.day?.toUpperCase();
    const {
      commitment,
      consent,
      concerns,
      linkedin,
      question,
      specificMaterial,
    } = req.body;

    const checkUser = await alreadyJoined(user, programId, day);
    if (!checkUser) {
      return res.status(400).json({ message: "User not joined seminar" });
    }

    const userResponse = await userAnswer({
      userId: user,
      programId: programId,
      registrationId: checkUser.id,
      commitment: commitment,
      consent: consent,
      concerns: concerns,
      linkedin: linkedin,
      question: question,
      specificMaterial: specificMaterial,
    });
    if (!userResponse) {
      return res
        .status(400)
        .json({ message: "Failed to submit feedback form" });
    }

    return res.status(201).json({ userResponse });
  } catch (err) {
    console.error("Submit Form:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.testEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = await generateTicket({
      id: userId,
      name: req.user.name,
      program: "Comvis 2025",
    });
    const qrcode = await generateQRCode(payload);
    const email = await testEmail(userId, qrcode);
    if (!email) {
      return res.status(400).json({ message: "Failed to send email" });
    }
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Test Email:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
