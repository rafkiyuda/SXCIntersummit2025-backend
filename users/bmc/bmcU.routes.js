const express = require("express");
const router = express.Router();
const bmcUController = require("./bmcU.controller");
const submission = require("../../submission/submission.routes");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/team/create", bmcUController.createTeam);
router.post("/team/join", bmcUController.joinTeam);
router.get("/team/member", bmcUController.teamMembers);
router.post("/individual", bmcUController.individual);
router.get("/announcement", bmcUController.announcement);
router.patch("/announcement/read/:id", bmcUController.readNotif);

module.exports = router;
