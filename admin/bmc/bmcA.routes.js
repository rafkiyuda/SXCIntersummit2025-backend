const express = require("express");
const router = express.Router();
const controller = require("./bmcA.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  isBMCAdmin,
  isSuperAdmin,
} = require("../../middlewares/role.middleware");

router.get("/teams", authenticate, isBMCAdmin, controller.getAllBMCTeams);
router.patch(
  "/teams/status",
  authenticate,
  isBMCAdmin,
  controller.updateTeamStatus
);
router.get(
  "/teams/general",
  authenticate,
  isBMCAdmin,
  controller.getAllGeneral
);

router.get(
  "/participants",
  authenticate,
  isBMCAdmin,
  controller.allParticipant
);
router.patch(
  "/participants/status",
  authenticate,
  isBMCAdmin,
  controller.updateParticipantStatus
);

router.post(
  "/announcement/team/:id",
  authenticate,
  isBMCAdmin,
  controller.postAnnouncementToTeamMembers
);
router.post(
  "/notification",
  authenticate,
  isBMCAdmin,
  controller.postNotificationToAll
);

router.get("/search", authenticate, isBMCAdmin, controller.searchTeam);

module.exports = router;
