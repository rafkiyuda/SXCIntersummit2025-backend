const express = require("express");
const router = express.Router();
const controller = require("./chambersA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  isSuperAdmin,
  authorizeRoles,
} = require("../../middlewares/role.middleware");
const { StaffRole } = require("@prisma/client");
const { activityLogger } = require("../../middlewares/activityLog.middleware");

// fetch peserta Chambers
router.get(
  "/participants",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  controller.participants
);

// fetch data event (additional form)
router.get(
  "/dataevent",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  controller.dataEvent
);

// ngirim announcement ke peserta Chambers
router.post(
  "/announcement",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  activityLogger,
  controller.announcement
);

// ngirim notifikasi ke semua user (super admin only)
router.post(
  "/notification",
  authenticate,
  isSuperAdmin,
  controller.notification
);

// cari peserta Chambers
router.get(
  "/search",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  controller.searchParticipant
);

router.post(
  "/export/:eventName",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  // activityLogger,
  controller.downloadExcelByEvent
);

module.exports = router;
