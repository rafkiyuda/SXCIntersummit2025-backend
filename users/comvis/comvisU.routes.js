const express = require("express");
const router = express.Router();
const comvisUController = require("./comvisU.controller");

/** announcement seperti biasa aja */
router.get("/announcement", comvisUController.announcement);
/** read announcement, id nya itu id dari announcement yang dipilih */
router.patch("/announcement/read/:id", comvisUController.readNotif);
/** submit form untuk seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.post("/form/:day", comvisUController.form);
/** register seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.post("/register/:day", comvisUController.registerSeminar);
/** cancel seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.delete("/cancel/:day", comvisUController.cancelSeminar);
module.exports = router;

router.post("/test-email", comvisUController.testEmail);
