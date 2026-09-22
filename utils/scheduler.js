const prisma = require("../config/db");
const cron = require("node-cron");
const { sendEmail } = require("./emailService");
