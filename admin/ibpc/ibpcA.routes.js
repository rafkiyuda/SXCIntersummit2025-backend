const express = require("express");
const router = express.Router();
const controller = require("./ibpcA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");
const { StaffRole } = require("@prisma/client");
const { activityLogger } = require("../../middlewares/activityLog.middleware");

router.get(
  "/teams",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  controller.getAllIBPCTeams
);
router.patch(
  "/teams/status",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  activityLogger,
  controller.updateTeamStatus
);
router.get(
  "/teams/general",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  controller.getAllGeneral
);

router.get(
  "/participants",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  controller.allParticipant
);
router.patch(
  "/participants/status",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  activityLogger,
  controller.updateParticipantStatus
);

router.post(
  "/announcement/team/:id",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  activityLogger,
  controller.postAnnouncementToTeamMembers
);

/**
 * mike ini route buat kirim announcement ke all participants
 * untuk post announcement ke all participants dia cuman butuh message, title, staffId. dia udh gak butuh status lagi
 *
 */
router.post(
  "/announcement/all",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  activityLogger,
  controller.postAnnouncementToAll
);

router.post(
  "/notification",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  activityLogger,
  controller.postNotificationToAll
);

router.get(
  "/search",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  controller.searchTeam
);

router.post(
  "/export/:eventName",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  // activityLogger,
  controller.downloadExcelByEvent
);

module.exports = router;
