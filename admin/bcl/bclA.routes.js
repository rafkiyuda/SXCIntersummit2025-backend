const express = require("express");
const router = express.Router();
const controller = require("./bclA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  isSuperAdmin,
  authorizeRoles,
} = require("../../middlewares/role.middleware");
const { StaffRole } = require("@prisma/client");
const { activityLogger } = require("../../middlewares/activityLog.middleware");

// fetch peserta BCL
router.get(
  "/participants",
  authenticate,
  authorizeRoles(StaffRole.BCL_ADMIN),
  controller.participants
);

// fetch data event (feedback)
router.get(
  "/dataevent",
  authenticate,
  authorizeRoles(StaffRole.BCL_ADMIN),
  controller.dataEvent
);

// ngirim announcement ke peserta BCL
router.post(
  "/announcement",
  authenticate,
  authorizeRoles(StaffRole.BCL_ADMIN),
  activityLogger,
  controller.announcement
);

// ngirim notifikasi ke semua user
router.post(
  "/notification",
  authenticate,
  isSuperAdmin,
  controller.notification
);

// cari peserta BCL
router.get(
  "/search",
  authenticate,
  authorizeRoles(StaffRole.BCL_ADMIN),
  controller.searchParticipant
);

module.exports = router;
