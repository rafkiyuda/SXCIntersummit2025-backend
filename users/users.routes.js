const router = require("express").Router();
const controller = require("./users.controller");
const {
  authenticate,
  verifyProfile,
} = require("../middlewares/auth.middleware");
const { authorizeInstitution } = require("../middlewares/role.middleware");
const { checkStatus } = require("../middlewares/competition.middleware");

router.get("/profile", authenticate, controller.getProfile);
router.patch("/profile/update", authenticate, controller.updateProfile);
router.delete("/card/delete", authenticate, controller.deleteIdcard);
router.get("/registered", authenticate, controller.registeredProgram);

router.post("/referral/:name", authenticate, controller.referral); // Check referral code for a specific program

router.use(
  "/bmc",
  [verifyProfile, authorizeInstitution("HSC")],
  require("./bmc/bmcU.routes")
);

router.use("/bcl", [verifyProfile], require("./bcl/bclU.routes"));

router.use(
  "/ibcc",
  [verifyProfile, authorizeInstitution("UNIV"), checkStatus("IBCC")],
  require("./ibcc/ibccU.routes")
);

router.use(
  "/ibpc",
  [verifyProfile, authorizeInstitution("UNIV"), checkStatus("IBPC")],
  require("./ibpc/ibpcU.routes")
);

router.use(
  "/chambers",
  [verifyProfile, authorizeInstitution("HSC", "UNIV")],
  require("./chambers/chamU.routes")
);
module.exports = router;
