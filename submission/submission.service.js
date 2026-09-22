const { google } = require("googleapis");
const prisma = require("../config/db"); // Asumsi Prisma ORM
const { Readable } = require("stream");
const { buffer } = require("stream/consumers");
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const ORGANIZATION_FOLDER_ID = process.env.GOOGLE_DRIVE_ORG_FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token yang sudah Anda dapat manual sekali dari flow oauth consent
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const driveService = google.drive({ version: "v3", auth: oauth2Client });

/**
 * Cari folder bernama folderName di dalam parentFolderId, kembalikan ID folder jika ada, atau null jika tidak ada
 */
async function findFolderId(folderName, parentFolderId) {
  const res = await driveService.files.list({
    q: `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  } else {
    return null;
  }
}

/**
 * Buat folder baru dengan nama folderName di dalam parentFolderId, kembalikan ID folder baru tersebut
 */
async function createFolder(folderName, parentFolderId) {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };
  const folder = await driveService.files.create({
    requestBody: fileMetadata,
    fields: "id",
    supportsAllDrives: true,
  });
  return folder.data.id;
}

/**
 * Pastikan folder event ada, jika tidak ada buat baru lalu return ID folder
 */
async function ensureEventFolder(eventName) {
  let folderId = await findFolderId(eventName, ORGANIZATION_FOLDER_ID);
  if (!folderId) {
    folderId = await createFolder(eventName, ORGANIZATION_FOLDER_ID);
  }
  return folderId;
}

async function ensureTypeFolder(typeName, parentFolderId) {
  let folderId = await findFolderId(typeName, parentFolderId);
  if (!folderId) {
    folderId = await createFolder(typeName, parentFolderId);
  }
  return folderId;
}

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Upload file ke Google Drive di folder parentFolderId
 */
async function uploadFileToDrive(fileBuffer, fileName, parentFolderId) {
  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId],
  };
  const media = {
    mimeType: "application/octet-stream",
    body: bufferToStream(fileBuffer),
  };
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, mimeType, size",
    supportsAllDrives: true,
  });
  return response.data; // {id, webViewLink}
}

/**
 * Fungsi buat submission dengan enum event (string) yang jadi nama folder di Drive
 */
async function createSubmission({ data }) {
  // Pastikan folder event ada dan dapatkan folderId-nya
  const eventFolderId = await ensureEventFolder(data.event);

  const typeFolderId = await ensureTypeFolder(data.type, eventFolderId);
  // Upload file ke Google Drive di folder event
  const uploadedFile = await uploadFileToDrive(
    data.file.buffer,
    data.file.originalname,
    typeFolderId
  );
  const mimeType = uploadedFile.mimeType;

  // Simpan ke DB
  const submission = await prisma.Submission.create({
    data: {
      seminarId: data.seminarId,
      teamId: data.teamId,
      userId: data.userId,
      stage: data.stage,
      type: data.type,
      event: data.event,
      programId: data.programId,
      submittedAt: new Date(),
    },
  });
  const submissionFile = await prisma.SubmissionFile.create({
    data: {
      submission: { connect: { id: submission.id } },
      filePath: uploadedFile.webViewLink,
      gdriveId: uploadedFile.id,
      fileType: mimeType,
      fileSize: parseInt(uploadedFile.size || "0"),
    },
  });

  // Return submission lengkap (atau sesuai kebutuhan)
  return { submission, submissionFile };
}

async function updateSubmissionFile(data) {
  const eventFolderId = await ensureEventFolder(data.event);

  const typeFolderId = await ensureTypeFolder(data.type, eventFolderId);
  // Upload file ke Google Drive di folder event
  const uploadedFile = await uploadFileToDrive(
    data.file.buffer,
    data.file.originalname,
    typeFolderId
  );
  const mimeType = uploadedFile.mimeType;

  const submissionFile = await prisma.SubmissionFile.update({
    where: { id: data.submissionId },
    data: {
      filePath: uploadedFile.webViewLink,
      gdriveId: uploadedFile.id,
      fileType: mimeType,
      fileSize: parseInt(uploadedFile.size || "0"),
    },
  });
  return { submissionFile };
}

async function findUserRole(userId, teamId) {
  return prisma.teamMember.findFirst({
    where: { userId: userId, teamId: teamId },
  });
}

async function getSubmissionsByEvent(event) {
  return prisma.submission.findMany({
    where: { event },
  });
}

async function findSubmission(userId, seminarId, stage, teamId, type, event) {
  return prisma.Submission.findFirst({
    where: {
      userId: userId,
      seminarId: seminarId,
      stage: stage,
      type: type,
      event: event,
      teamId: teamId,
    },
  });
}

module.exports = {
  createSubmission,
  getSubmissionsByEvent,
  findUserRole,
  updateSubmissionFile,
  findSubmission,
};
