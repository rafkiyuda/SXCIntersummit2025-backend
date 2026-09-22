const express = require("express");
const router = express.Router();
const ibccUController = require("./ibccU.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Semua endpoint butuh auth
router.post(
  "/team/create",
  authMiddleware.authenticate,
  ibccUController.createTeam
);
router.post(
  "/team/join",
  authMiddleware.authenticate,
  ibccUController.joinTeam
);
router.get(
  "/team/member",
  authMiddleware.authenticate,
  ibccUController.teamMembers
);

router.delete(
  "/team/exit",
  authMiddleware.authenticate,
  ibccUController.exitTeam
);

router.delete(
  "/team/delete",
  authMiddleware.authenticate,
  ibccUController.deleteTeam
);

router.get(
  "/announcement",
  authMiddleware.authenticate,
  ibccUController.announcement
);
router.patch(
  "/announcement/read/:id",
  authMiddleware.authenticate,
  ibccUController.readNotif
);

router.post(
  "/test-email",
  authMiddleware.authenticate,
  ibccUController.sendEmailTest
);
router.get("/team", authMiddleware.authenticate, ibccUController.teamDetail);

module.exports = router;
