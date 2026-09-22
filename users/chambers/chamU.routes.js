const express = require("express");
const router = express.Router();
const chamUController = require("./chamU.controller");

/** announcement seperti biasa aja */
router.get("/announcement", chamUController.announcement);
/** read announcement, id nya itu id dari announcement yang dipilih */
router.patch("/announcement/read/:id", chamUController.readNotif);
/** submit form untuk seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.post("/form/:day", chamUController.form);
/** register seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.post("/register/:day", chamUController.registerSeminar);
/** cancel seminar, parameter day itu menyesuaikan nanti register day brp
 * pilihannya (DAY1 dan DAY2)
 */
router.delete("/cancel/:day", chamUController.cancelSeminar);
module.exports = router;

router.post("/test-email", chamUController.testEmail);
