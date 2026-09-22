const express = require("express");
const router = express.Router();
const controller = require("./itA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { isSuperAdmin } = require("../../middlewares/role.middleware");
const { activityLogger } = require("../../middlewares/activityLog.middleware");
// STAFF
router.post(
  "/staff",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.createStaff
);
router.get("/staff", authenticate, isSuperAdmin, controller.getAllStaff);
router.patch(
  "/staff/:id",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.updateStaff
);
router.delete(
  "/staff/:id",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.deleteStaff
);

router.get("/activity", authenticate, isSuperAdmin, controller.getActivityLog);

// REFERRAL / OPSIONAL, HARUSNYA FILE SENDIRI GASI?
router.post(
  "/referral",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.createReferral
);
router.get("/referral", authenticate, isSuperAdmin, controller.getAllReferral);
router.delete(
  "/referral/:id",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.deleteReferral
);

router.patch(
  "/referral/:id",
  authenticate,
  isSuperAdmin,
  activityLogger,
  controller.updateReferral
);

router.get("/referral/total", authenticate, isSuperAdmin, controller.totalUsed);

module.exports = router;
