//API untuk BCL

const {
  findProgramByName,
  getAnnouncement,
  alreadyRead,
  sendEmailBcl,
  userAnswer,
  hearFrom,
  joinSeminar,
  alreadyJoined,
  cancelJoin,
  findUserById,
} = require("./bclU.service");

exports.registerSeminar = async (req, res) => {
  try {
    const userId = req.user.id;
    const programId = 4;

    const checkUser = await alreadyJoined(userId, programId);
    if (checkUser) {
      return res.status(400).json({ message: "User already joined seminar" });
    }

    const seminar = await joinSeminar(userId, programId);
    if (!seminar) {
      return res.status(400).json({ message: "Failed to register seminar" });
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
    const programId = 4;

    const checkUser = await alreadyJoined(userId, programId);
    if (!checkUser) {
      return res.status(400).json({ message: "User not joined seminar" });
    }

    const seminar = await cancelJoin(userId, programId);
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
    const userId = req.user.id;
    const programId = 4;
    const {
      onTime,
      wellOrganized,
      practicalInsights,
      interactiveSession,
      otherExpectations,
      instagram,
      facebook,
      twitter,
      friends,
      family,
      otherHear,
    } = req.body;

    const checkUser = await alreadyJoined(userId, programId);
    if (!checkUser) {
      return res.status(400).json({ message: "User not joined seminar" });
    }

    const userResponse = await userAnswer(
      userId,
      onTime,
      wellOrganized,
      practicalInsights,
      interactiveSession,
      otherExpectations
    );
    if (!userResponse) {
      return res
        .status(400)
        .json({ message: "Failed to submit feedback form" });
    }

    const hearFromResponse = await hearFrom(
      userId,
      instagram,
      facebook,
      twitter,
      friends,
      family,
      otherHear
    );
    if (!hearFromResponse) {
      return res.status(400).json({ message: "Failed to submit hear form" });
    }

    return res.status(201).json({ userResponse, hearFromResponse });
  } catch (err) {
    console.error("Submit Form:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.sendEmailBcl = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const email = user.email;
    const emailResponse = await sendEmailBcl(email);
    if (!emailResponse) {
      return res.status(400).json({ message: "Failed to send email" });
    }
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Send Email BCL:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
