const express = require('express');
const router = express.Router();

const poController = require('./poA.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isProjectOfficer } = require('../../middlewares/role.middleware');
const {setProgramParam} = require('../../middlewares/po.middleware')

// Route: GET /api/admin/po/bmc
router.get(
  '/:program',
  authenticate,
  isProjectOfficer,
  setProgramParam,
  poController.AllBMC
);

module.exports = router;
