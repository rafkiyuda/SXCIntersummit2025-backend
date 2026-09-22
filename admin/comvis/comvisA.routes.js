const express = require("express");
const router = express.Router();
const controller = require("./comvisA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  isSuperAdmin,
  authorizeRoles,
} = require("../../middlewares/role.middleware");
const { StaffRole } = require("@prisma/client");
const { activityLogger } = require("../../middlewares/activityLog.middleware");

// fetch participants ComVis
router.get(
  "/participants",
  authenticate,
  authorizeRoles(StaffRole.COMPANY_VISIT_ADMIN),
  controller.participants
);

// fetch data event (feedback/addForm)
router.get(
  "/dataevent",
  authenticate,
  authorizeRoles(StaffRole.COMPANY_VISIT_ADMIN),
  controller.dataEvent
);

// send announcement to ComVis participants
router.post(
  "/announcement",
  authenticate,
  authorizeRoles(StaffRole.COMPANY_VISIT_ADMIN),
  activityLogger,
  controller.announcement
);

// send notification to all users
router.post(
  "/notification",
  authenticate,
  isSuperAdmin,
  controller.notification
);

module.exports = router;
