const router = require("express").Router();
const controller = require("./admin.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { AllAdminRoles } = require("../constants/roles");
const { StaffRole } = require("@prisma/client");

// Routes untuk IT, PO, BMC
router.get(
  "/users",
  authenticate,
  authorizeRoles(...AllAdminRoles),
  controller.getAllUsers
);
router.get(
  "/staffs",
  authenticate,
  authorizeRoles(...AllAdminRoles),
  controller.getAllStaff
);
router.use(
  "/bmc",
  authenticate,
  authorizeRoles(StaffRole.BMC_ADMIN),
  require("./bmc/bmcA.routes")
);
router.use(
  "/po",
  authenticate,
  authorizeRoles(StaffRole.PO),
  require("./po/poA.routes")
);
router.use(
  "/it",
  authenticate,
  authorizeRoles(StaffRole.ADMIN),
  require("./IT/itA.routes")
);

router.use(
  "/bcl",
  authenticate,
  authorizeRoles(StaffRole.BCL_ADMIN),
  require("./bcl/bclA.routes")
);

router.use(
  "/ibcc",
  authenticate,
  authorizeRoles(StaffRole.IBCC_ADMIN),
  require("./ibcc/ibccA.routes")
);
router.use(
  "/ibpc",
  authenticate,
  authorizeRoles(StaffRole.IBPC_ADMIN),
  require("./ibpc/ibpcA.routes")
);

router.use(
  "/chambers",
  authenticate,
  authorizeRoles(StaffRole.CHAMBERS_ADMIN),
  require("./chambers/chambersA.routes")
);

router.use(
  "/comvis",
  authenticate,
  authorizeRoles(StaffRole.COMPANY_VISIT_ADMIN),
  require("./comvis/comvisA.routes")
);
module.exports = router;
