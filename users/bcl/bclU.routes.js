const express = require("express");
const router = express.Router();
const bclUController = require("./bclU.controller");

router.get("/announcement", bclUController.announcement);
router.patch("/announcement/read/:id", bclUController.readNotif);
router.post("/form", bclUController.form);
router.post("/register", bclUController.registerSeminar);
router.delete("/cancel", bclUController.cancelSeminar);
router.post("/sendemail", bclUController.sendEmailBcl);
module.exports = router;
