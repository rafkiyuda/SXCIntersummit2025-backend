const express = require("express");
const router = express.Router();
const ibpcUController = require("./ibpcU.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Semua endpoint butuh auth
router.post(
  "/team/create",
  authMiddleware.authenticate,
  ibpcUController.createTeam
);
router.post(
  "/team/join",
  authMiddleware.authenticate,
  ibpcUController.joinTeam
);
router.get(
  "/team/member",
  authMiddleware.authenticate,
  ibpcUController.teamMembers
);

router.delete(
  "/team/exit",
  authMiddleware.authenticate,
  ibpcUController.exitTeam
);

router.delete(
  "/team/delete",
  authMiddleware.authenticate,
  ibpcUController.deleteTeam
);

router.get(
  "/announcement",
  authMiddleware.authenticate,
  ibpcUController.announcement
);
router.patch(
  "/announcement/read/:id",
  authMiddleware.authenticate,
  ibpcUController.readNotif
);

router.post(
  "/test-email",
  authMiddleware.authenticate,
  ibpcUController.sendEmailTest
);
router.get("/team", authMiddleware.authenticate, ibpcUController.teamDetail);

module.exports = router;
