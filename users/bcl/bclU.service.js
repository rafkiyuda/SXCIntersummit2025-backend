const prisma = require("../../config/db");
const { sendEmail } = require("../../utils/SendEmail");
const { composeEmail } = require("../../constants/email");

const findProgramByName = async (name) => {
  return await prisma.program.findFirst({
    where: { name },
  });
};

async function getAnnouncement(userId) {
  return await prisma.notification.findMany({
    where: {
      userId: userId,
      purpose: "ANNOUNCEMENT",
    },
    select: {
      id: true,
      title: true,
      message: true,
    },
  });
}

async function alreadyRead(userId, notifId) {
  return await prisma.notification.updateMany({
    where: { userId: userId, id: notifId },
    data: {
      isRead: true,
    },
  });
}

async function userAnswer(userId, ans1, ans2, ans3, ans4, ans5) {
  return await prisma.addForm.create({
    data: {
      userId,
      onTime: ans1,
      wellOrganized: ans2,
      practicalInsights: ans3,
      interactiveSession: ans4,
      other: ans5,
    },
  });
}

async function hearFrom(userId, insta, fb, twit, friends, family, other) {
  return await prisma.hearFrom.create({
    data: {
      userId,
      instagram: insta,
      facebook: fb,
      twitter: twit,
      friends: friends,
      family: family,
      other: other,
    },
  });
}

async function joinSeminar(userId, programId) {
  return await prisma.seminarReg.create({
    data: {
      userId,
      programId,
    },
  });
}

async function alreadyJoined(userId, programId) {
  return await prisma.seminarReg.findFirst({
    where: {
      userId,
      programId,
    },
  });
}

async function cancelJoin(userId, programId) {
  return await prisma.seminarReg.deleteMany({
    where: {
      userId,
      programId,
    },
  });
}

async function findUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

async function sendEmailBcl(email) {
  const html = await composeEmail({
    title: "Welcome to Business Competition Launchpad (BCL)", // Judul untuk <title> tag dan header email
    bodyBlocks: [
      { type: "paragraph", text: "Dear BCL’s Participant," },
      {
        type: "paragraph",
        text: "We warmly welcome you to be part of the <b>Business Competition Launchpad (BCL)</b> designed to prepare students to excel in business competitions.",
      },
      {
        type: "paragraph",
        text: "This event aims to accelerate the growth of young talents by providing practical exposure to real-world business challenges through expert-led sessions, strategic frameworks, and interactive case simulations. Join us together with fellow high school and university students as we cultivate innovation, sharpen business thinking, and empower participants to confidently face future business competitions.",
      },
      {
        type: "paragraph",
        text: "For more detail, here is the rundown of our event:",
      },
      { type: "title", text: "BUSINESS COMPETITION LAUNCHPAD RUNDOWN" }, // Ini akan jadi h2 dengan styling khusus
    ],
    tableColumns: [
      { header: "Time (GMT+7)", field: "time" },
      { header: "Agenda", field: "agenda" },
      { header: "Description", field: "description" },
    ],
    tableData: [
      {
        time: "09:45-10:00",
        agenda: "Open Room",
        description: "Opening room for the participants to main room",
      },
      {
        time: "10:00-10:05",
        agenda: "Opening by MC",
        description: "Opening from MC",
      },
      {
        time: "10:05-10:10",
        agenda: "Opening Remarks",
        description:
          "Opening remarks by Project Officer of StudentsxCEOs International Summit",
      },
      {
        time: "10:10-10:15",
        agenda: "Speaker Overview",
        description: "Introduce the moderator and speakers",
      },
      {
        time: "10:15-10:20",
        agenda: "Expectation Settings",
        description: "Explain what the participants will do and will get",
      },
      {
        time: "10:20-10:25",
        agenda: "Class Session: Entering Breakout Room",
        description:
          "Participants joining break out room for BPC/BCC as their choice before",
      },
      {
        time: "10:25-10:27",
        agenda: "Opening First Session",
        description: "Moderator opens & explains the session",
      },
      {
        time: "10:27-10:30",
        agenda: "1st Speaker Introduction",
        description:
          "Moderator introducing first speaker overview to the participants",
      },
      {
        time: "10:30-11:00",
        agenda: "1st Speaker Material Delivering",
        description: "Speaker presenting materials about BCC/BPC",
      },
      {
        time: "11:00-11:15",
        agenda: "QnA Session 1",
        description:
          "Participants ask their questions (raise hand and open mic) to speaker about BCC/BPC",
      },
      {
        time: "11:15-11:20",
        agenda: "Speaker Certificate and Documentation",
        description:
          "Hands on certificate to the speaker  as well as documentation",
      },
      {
        time: "11:20-11:22",
        agenda: "Closing First Session",
        description: "Moderator say thank you goodbye to speakers",
      },
      {
        time: "11:22-11:32",
        agenda: "Ice Breaking",
        description: "Mini games for the participants to keep up the mood",
      },
      {
        time: "11:32-11:35",
        agenda: "Opening Session 2",
        description: "Moderator opening the session",
      },
      {
        time: "11:35-11:37",
        agenda: "2nd Speaker Introduction",
        description:
          "Moderator introducing second speaker overview to the participants",
      },
      {
        time: "11:37-12:07",
        agenda: "2nd Speaker Material Delivering",
        description: "Speaker presenting materials about BCC/BPC",
      },
      {
        time: "12:07-12:22",
        agenda: "QnA Session 2",
        description:
          "Participants ask their questions (raise hand and open mic) to speaker about BCC/BPC",
      },
      {
        time: "12:22-12:27",
        agenda: "Speaker Certificate and Documentation",
        description:
          "Hands on certificate to the speaker  as well as documentation",
      },
      {
        time: "12:27-12:35",
        agenda: "Finalize",
        description:
          "Moderator announce to participants to prepare themselves to enter the main room and give overview about the next session",
      },
      {
        time: "12:35-12:37",
        agenda: "Prepare to enter Main Room (Photoshoot)",
        description:
          "Participants enter main room for photoshoot session with all participants",
      },
      {
        time: "12:37-12:52",
        agenda:
          "Closing Remarks by Project Officer of StudentsxCEOs International Summit",
        description:
          "Closing remarks by Project Officer of StudentsxCEOs International Summit",
      },
      {
        time: "12:52-13:02",
        agenda: "BCL Games",
        description: "Mini games with the host with all participants",
      },
      {
        time: "13:02-13:08",
        agenda: "Sponsor's Greetings",
        description: "Sponsor greeting video",
      },
      {
        time: "13:08-13:17",
        agenda: "Sponsor's Greetings",
        description: "Sponsor greeting video",
      },
      {
        time: "13:17-13:20",
        agenda: "Closing by MC",
        description: "Closing from MC",
      },
      {
        time: "13:20-13:30",
        agenda: "Documentation & Exit",
        description: "Documentation session & exiting the room accordingly",
      },
    ],
  });

  return await sendEmail(
    email,
    "Registration for Business Competition Launchpad SxC Intersummit 2025",
    html
  );
}

module.exports = {
  findProgramByName,
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
};
